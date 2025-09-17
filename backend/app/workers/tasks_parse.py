"""
Celery tasks for PDF parsing and table extraction.
Handles async processing of PDF files with table detection and task creation.
"""

import time
from typing import Dict, Any, List

from celery import Task
from sqlalchemy import select, update

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models.files import PDFFile, ParsedTable, FileStatus
from app.db.models.tasks import Task as TaskModel, TaskStatus, DraftStatus
from app.db.session import get_async_session
from app.services.pdf_detect import PDFDetectionService
from app.services.storage_s3 import S3StorageService
from app.workers.celery_app import celery_app

settings = get_settings()
logger = get_logger(__name__)


class ParseCallbackTask(Task):
    """Custom Celery task class for PDF parsing with database session management."""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure."""
        logger.error(
            f"Parse task {self.name} failed",
            task_id=task_id,
            exception=str(exc),
            traceback=str(einfo)
        )


@celery_app.task(bind=True, base=ParseCallbackTask, max_retries=2)
def process_pdf(self, file_id: str) -> Dict[str, Any]:
    """
    Process PDF file to extract tables and create tasks.
    
    This task:
    1. Downloads PDF from storage
    2. Extracts tables using PDF detection service
    3. Creates parsed table records
    4. Creates tasks for AI draft generation
    5. Updates file status
    
    Args:
        file_id: UUID of the PDF file to process
        
    Returns:
        Dict with processing results and metadata
    """
    logger.info(
        "Starting PDF processing",
        file_id=file_id,
        retry_count=self.request.retries
    )
    
    start_time = time.time()
    
    try:
        # Use async context manager for database operations
        import asyncio
        return asyncio.run(_process_pdf_async(file_id, self))
        
    except Exception as exc:
        logger.error(
            f"PDF processing failed",
            file_id=file_id,
            exception=str(exc),
            retry_count=self.request.retries
        )
        
        # Update file status to failed
        asyncio.run(_update_file_failed(file_id, str(exc)))
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            backoff_seconds = 2 ** self.request.retries * 60  # 1min, 2min, 4min
            logger.info(
                f"Retrying PDF processing in {backoff_seconds} seconds",
                file_id=file_id,
                retry_count=self.request.retries + 1
            )
            raise self.retry(exc=exc, countdown=backoff_seconds)
        
        # Max retries exceeded
        logger.error(
            f"Max retries exceeded for PDF processing",
            file_id=file_id,
            max_retries=self.max_retries
        )
        raise exc


async def _process_pdf_async(file_id: str, celery_task) -> Dict[str, Any]:
    """Async implementation of PDF processing."""
    async with get_async_session() as db:
        # Load PDF file record
        pdf_query = select(PDFFile).where(PDFFile.id == file_id)
        pdf_file = await db.scalar(pdf_query)
        
        if not pdf_file:
            raise ValueError(f"PDF file not found: {file_id}")
        
        # Update file status to parsing
        pdf_file.status = FileStatus.PARSING
        pdf_file.processing_started_at = time.time()
        await db.commit()
        
        # Initialize services
        storage_service = S3StorageService()
        pdf_service = PDFDetectionService()
        
        # Download file from storage
        logger.info(f"Downloading file from storage: {pdf_file.s3_path}")
        file_content = await storage_service.download_file(pdf_file.s3_path)
        
        if not file_content:
            raise ValueError(f"Failed to download file from storage: {pdf_file.s3_path}")
        
        # Extract tables from PDF
        logger.info(f"Extracting tables from PDF: {pdf_file.file_name}")
        extracted_tables = await pdf_service.extract_tables_from_pdf(
            file_content=file_content,
            file_name=pdf_file.file_name,
            doc_id=str(pdf_file.id)
        )
        
        logger.info(f"Extracted {len(extracted_tables)} tables from PDF")
        
        # Create parsed table records and tasks
        created_tasks = []
        for table_data in extracted_tables:
            try:
                # Create parsed table record
                parsed_table = ParsedTable(
                    file_id=pdf_file.id,
                    page_number=table_data["page"],
                    schema_json=table_data,
                    detector=table_data["meta"]["detector"],
                    confidence=table_data["meta"]["confidence"],
                    extraction_flavor=table_data["meta"].get("extraction_flavor", "default"),
                    processing_time_ms=table_data["meta"].get("processing_time_ms", 0)
                )
                
                db.add(parsed_table)
                await db.flush()  # Get the ID
                
                # Create task for this table
                task = TaskModel(
                    table_id=parsed_table.id,
                    project_id=pdf_file.project_id,
                    status=TaskStatus.AWAITING_DRAFT,
                    draft_status=DraftStatus.QUEUED,
                    priority=0,
                    allocation_hold=True
                )
                
                db.add(task)
                await db.flush()  # Get the task ID
                
                created_tasks.append({
                    "task_id": str(task.id),
                    "table_id": str(parsed_table.id),
                    "page": table_data["page"],
                    "detector": table_data["meta"]["detector"],
                    "confidence": table_data["meta"]["confidence"]
                })
                
                logger.debug(
                    f"Created task for table",
                    task_id=str(task.id),
                    table_id=str(parsed_table.id),
                    page=table_data["page"]
                )
                
            except Exception as e:
                logger.warning(f"Failed to create task for table on page {table_data.get('page', 'unknown')}: {e}")
                continue
        
        # Update file status to parsed
        pdf_file.status = FileStatus.PARSED
        pdf_file.total_pages = max((t["page"] for t in extracted_tables), default=1) if extracted_tables else 1
        pdf_file.processing_completed_at = time.time()
        pdf_file.processing_error = None  # Clear any previous errors
        
        await db.commit()
        
        processing_time = time.time() - start_time
        
        # Enqueue draft generation tasks
        draft_task_ids = []
        for task_info in created_tasks:
            try:
                # Import here to avoid circular imports
                from app.workers.tasks_draft import generate_ai_draft
                
                result = generate_ai_draft.delay(task_info["task_id"])
                draft_task_ids.append(result.id)
                
            except Exception as e:
                logger.warning(f"Failed to enqueue draft generation for task {task_info['task_id']}: {e}")
        
        logger.info(
            "PDF processing completed successfully",
            file_id=file_id,
            total_tables=len(extracted_tables),
            created_tasks=len(created_tasks),
            draft_tasks_queued=len(draft_task_ids),
            processing_time_seconds=round(processing_time, 2)
        )
        
        return {
            "status": "success",
            "file_id": file_id,
            "tables_extracted": len(extracted_tables),
            "tasks_created": len(created_tasks),
            "draft_tasks_queued": len(draft_task_ids),
            "processing_time_seconds": round(processing_time, 2),
            "created_tasks": created_tasks,
            "draft_task_ids": draft_task_ids
        }


async def _update_file_failed(file_id: str, error_message: str):
    """Update file status to failed."""
    async with get_async_session() as db:
        await db.execute(
            update(PDFFile)
            .where(PDFFile.id == file_id)
            .values(
                status=FileStatus.FAILED,
                processing_error=error_message,
                processing_completed_at=time.time()
            )
        )
        await db.commit()


@celery_app.task
def batch_process_pdfs(file_ids: List[str]) -> Dict[str, Any]:
    """
    Process multiple PDF files in batch.
    
    Args:
        file_ids: List of PDF file UUIDs to process
        
    Returns:
        Dict with batch processing results
    """
    logger.info(f"Starting batch PDF processing for {len(file_ids)} files")
    
    results = []
    for file_id in file_ids:
        try:
            result = process_pdf.delay(file_id)
            results.append({
                "file_id": file_id,
                "celery_task_id": result.id,
                "status": "queued"
            })
        except Exception as e:
            logger.error(f"Failed to queue PDF processing for file {file_id}: {e}")
            results.append({
                "file_id": file_id,
                "status": "failed",
                "error": str(e)
            })
    
    logger.info(f"Queued {len([r for r in results if r['status'] == 'queued'])} PDF processing tasks")
    
    return {
        "total_files": len(file_ids),
        "queued": len([r for r in results if r["status"] == "queued"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }


@celery_app.task
def reprocess_failed_files():
    """
    Periodic task to reprocess failed PDF files.
    
    Finds files that failed processing and retries them.
    """
    logger.info("Starting failed files reprocessing")
    
    import asyncio
    return asyncio.run(_reprocess_failed_files_async())


async def _reprocess_failed_files_async():
    """Async implementation of failed files reprocessing."""
    async with get_async_session() as db:
        # Find files that failed processing more than 1 hour ago
        from datetime import datetime, timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        
        failed_files_query = select(PDFFile).where(
            PDFFile.status == FileStatus.FAILED,
            PDFFile.updated_at < cutoff_time
        ).limit(10)  # Process max 10 at a time
        
        failed_files = (await db.execute(failed_files_query)).scalars().all()
        
        reprocessed = 0
        for pdf_file in failed_files:
            try:
                # Reset status and clear error
                pdf_file.status = FileStatus.UPLOADED
                pdf_file.processing_error = None
                await db.commit()
                
                # Queue for reprocessing
                process_pdf.delay(str(pdf_file.id))
                reprocessed += 1
                
                logger.info(f"Queued failed file for reprocessing: {pdf_file.file_id}")
                
            except Exception as e:
                logger.error(f"Failed to requeue file {pdf_file.file_id}: {e}")
        
        logger.info(f"Requeued {reprocessed} failed files for processing")
        
        return {"reprocessed_files": reprocessed} 