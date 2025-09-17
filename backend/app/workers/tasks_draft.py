"""
Celery tasks for AI draft generation.
Handles async processing of AI draft generation with retry logic and cost tracking.
"""

import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Any

from celery import Task
from sqlalchemy import select, update

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models.tasks import Task as TaskModel, TaskStatus, DraftStatus, AIDraft
from app.db.models.files import ParsedTable
from app.db.session import get_async_session
from app.services.draft_service import DraftService
from app.workers.celery_app import celery_app

settings = get_settings()
logger = get_logger(__name__)


class CallbackTask(Task):
    """Custom Celery task class with database session management."""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure."""
        logger.error(
            f"Task {self.name} failed",
            task_id=task_id,
            exception=str(exc),
            traceback=str(einfo)
        )


@celery_app.task(bind=True, base=CallbackTask, max_retries=3)
def generate_ai_draft(self, task_id: str, force_regenerate: bool = False) -> Dict[str, Any]:
    """
    Generate AI draft for a task.
    
    This task:
    1. Loads the task and table schema
    2. Checks for existing drafts (idempotency)
    3. Generates AI draft using LLM service
    4. Updates task status and creates draft record
    5. Handles retries with exponential backoff
    
    Args:
        task_id: UUID of the task to generate draft for
        force_regenerate: Whether to regenerate existing draft
        
    Returns:
        Dict with generation results and metadata
    """
    logger.info(
        "Starting AI draft generation",
        task_id=task_id,
        force_regenerate=force_regenerate,
        retry_count=self.request.retries
    )
    
    start_time = time.time()
    
    try:
        # Use async context manager for database operations
        import asyncio
        return asyncio.run(_generate_draft_async(task_id, force_regenerate, self))
        
    except Exception as exc:
        logger.error(
            f"Draft generation failed",
            task_id=task_id,
            exception=str(exc),
            retry_count=self.request.retries
        )
        
        # Update task status to failed
        asyncio.run(_update_task_failed(task_id, str(exc)))
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            backoff_seconds = settings.DRAFT_RETRY_BACKOFF_FACTOR ** self.request.retries * 60
            logger.info(
                f"Retrying draft generation in {backoff_seconds} seconds",
                task_id=task_id,
                retry_count=self.request.retries + 1
            )
            raise self.retry(exc=exc, countdown=backoff_seconds)
        
        # Max retries exceeded
        logger.error(
            f"Max retries exceeded for draft generation",
            task_id=task_id,
            max_retries=self.max_retries
        )
        raise exc


async def _generate_draft_async(task_id: str, force_regenerate: bool, celery_task) -> Dict[str, Any]:
    """Async implementation of draft generation."""
    async with get_async_session() as db:
        # Load task with related data
        task_query = (
            select(TaskModel)
            .where(TaskModel.id == task_id)
            .options(
                selectinload(TaskModel.parsed_table),
                selectinload(TaskModel.ai_draft)
            )
        )
        task = await db.scalar(task_query)
        
        if not task:
            raise ValueError(f"Task not found: {task_id}")
        
        # Update task status to generating
        task.draft_status = DraftStatus.GENERATING
        await db.commit()
        
        # Check for existing draft (idempotency)
        if task.ai_draft and not force_regenerate:
            logger.info(
                "Draft already exists, skipping generation",
                task_id=task_id,
                draft_id=str(task.ai_draft.id)
            )
            
            # Update task to ready for annotation
            task.status = TaskStatus.READY_FOR_ANNOTATION
            task.draft_status = DraftStatus.SUCCEEDED
            task.allocation_hold = False
            await db.commit()
            
            return {
                "status": "skipped",
                "draft_id": str(task.ai_draft.id),
                "message": "Draft already exists"
            }
        
        # Load table schema
        table = task.parsed_table
        if not table:
            raise ValueError(f"No parsed table found for task: {task_id}")
        
        # Initialize draft service
        draft_service = DraftService()
        
        # Generate prompt hash for idempotency
        prompt_content = draft_service.create_prompt(table.schema_json)
        prompt_hash = hashlib.sha256(
            f"{settings.DEFAULT_LLM_MODEL}:{prompt_content}".encode()
        ).hexdigest()
        
        # Check for existing draft with same prompt hash
        existing_draft_query = select(AIDraft).where(
            AIDraft.prompt_hash == prompt_hash
        )
        existing_draft = await db.scalar(existing_draft_query)
        
        if existing_draft and not force_regenerate:
            logger.info(
                "Found existing draft with same prompt hash",
                task_id=task_id,
                existing_draft_id=str(existing_draft.id),
                prompt_hash=prompt_hash
            )
            
            # Create new draft record pointing to same content
            new_draft = AIDraft(
                task_id=task.id,
                model_name=existing_draft.model_name,
                prompt_version=existing_draft.prompt_version,
                prompt_hash=prompt_hash,
                draft_text=existing_draft.draft_text,
                trace_json=existing_draft.trace_json,
                usage={"reused": True, "original_draft_id": str(existing_draft.id)},
                generation_time_ms=0,
                temperature=existing_draft.temperature
            )
            
            db.add(new_draft)
            task.status = TaskStatus.READY_FOR_ANNOTATION
            task.draft_status = DraftStatus.SUCCEEDED
            task.allocation_hold = False
            await db.commit()
            
            return {
                "status": "reused",
                "draft_id": str(new_draft.id),
                "original_draft_id": str(existing_draft.id),
                "prompt_hash": prompt_hash
            }
        
        # Generate new draft
        generation_start = time.time()
        
        draft_result = await draft_service.generate_draft(
            table_schema=table.schema_json,
            model=settings.DEFAULT_LLM_MODEL,
            temperature=0.7
        )
        
        generation_time_ms = int((time.time() - generation_start) * 1000)
        
        # Create draft record
        draft = AIDraft(
            task_id=task.id,
            model_name=draft_result["model"],
            prompt_version=draft_result["prompt_version"],
            prompt_hash=prompt_hash,
            draft_text=draft_result["text"],
            trace_json=draft_result.get("trace"),
            usage=draft_result["usage"],
            generation_time_ms=generation_time_ms,
            temperature=draft_result.get("temperature", 0.7)
        )
        
        db.add(draft)
        
        # Update task status
        task.status = TaskStatus.READY_FOR_ANNOTATION
        task.draft_status = DraftStatus.SUCCEEDED
        task.allocation_hold = False
        task.last_error = None
        
        await db.commit()
        await db.refresh(draft)
        
        logger.info(
            "AI draft generated successfully",
            task_id=task_id,
            draft_id=str(draft.id),
            generation_time_ms=generation_time_ms,
            input_tokens=draft_result["usage"].get("input_tokens", 0),
            output_tokens=draft_result["usage"].get("output_tokens", 0),
            cost_usd=draft_result["usage"].get("cost_usd", 0.0)
        )
        
        return {
            "status": "generated",
            "draft_id": str(draft.id),
            "generation_time_ms": generation_time_ms,
            "usage": draft_result["usage"],
            "prompt_hash": prompt_hash
        }


async def _update_task_failed(task_id: str, error_message: str):
    """Update task status to failed."""
    async with get_async_session() as db:
        await db.execute(
            update(TaskModel)
            .where(TaskModel.id == task_id)
            .values(
                draft_status=DraftStatus.FAILED,
                last_error=error_message,
                retry_count=TaskModel.retry_count + 1
            )
        )
        await db.commit()


@celery_app.task
def cleanup_failed_tasks():
    """
    Periodic task to clean up old failed tasks.
    
    Removes error messages from tasks that have been failed for more than 24 hours
    to prevent database bloat.
    """
    logger.info("Starting failed tasks cleanup")
    
    import asyncio
    return asyncio.run(_cleanup_failed_tasks_async())


async def _cleanup_failed_tasks_async():
    """Async implementation of failed tasks cleanup."""
    async with get_async_session() as db:
        # Clear error messages from old failed tasks
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        result = await db.execute(
            update(TaskModel)
            .where(
                TaskModel.draft_status == DraftStatus.FAILED,
                TaskModel.updated_at < cutoff_time,
                TaskModel.last_error.isnot(None)
            )
            .values(last_error=None)
        )
        
        await db.commit()
        
        cleaned_count = result.rowcount
        logger.info(f"Cleaned up {cleaned_count} old failed tasks")
        
        return {"cleaned_tasks": cleaned_count}


@celery_app.task
def batch_generate_drafts(task_ids: list[str], force_regenerate: bool = False):
    """
    Generate drafts for multiple tasks in batch.
    
    This is useful for processing large numbers of tasks efficiently.
    """
    logger.info(
        f"Starting batch draft generation for {len(task_ids)} tasks",
        force_regenerate=force_regenerate
    )
    
    results = []
    for task_id in task_ids:
        try:
            result = generate_ai_draft.delay(task_id, force_regenerate)
            results.append({
                "task_id": task_id,
                "celery_task_id": result.id,
                "status": "queued"
            })
        except Exception as e:
            logger.error(f"Failed to queue draft generation for task {task_id}: {e}")
            results.append({
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            })
    
    logger.info(f"Queued {len([r for r in results if r['status'] == 'queued'])} draft generation tasks")
    
    return {
        "total_tasks": len(task_ids),
        "queued": len([r for r in results if r["status"] == "queued"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    } 