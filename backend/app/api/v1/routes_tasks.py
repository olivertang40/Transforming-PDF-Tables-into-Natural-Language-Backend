"""
Task API routes for task management and workflow.
Handles task listing, filtering, assignment, and retry operations.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, get_current_user, require_annotator, require_admin
from app.core.logging import get_logger
from app.db.models.tasks import Task, TaskStatus, DraftStatus
from app.db.models.files import ParsedTable, PDFFile
from app.db.models.projects import Project
from app.security.auth_stub import JWTPayload

logger = get_logger(__name__)
router = APIRouter()


# Response DTOs
class TaskSummary(BaseModel):
    """Summary of a task for listing."""
    task_id: str
    table_id: str
    project_id: str
    project_name: str
    file_name: str
    page_number: int
    status: TaskStatus
    draft_status: DraftStatus
    assigned_to: Optional[str] = None
    assigned_user_name: Optional[str] = None
    priority: int
    retry_count: int
    last_error: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


class TaskDetail(BaseModel):
    """Detailed task information."""
    task_id: str
    table_id: str
    project_id: str
    project_name: str
    file_id: str
    file_name: str
    page_number: int
    status: TaskStatus
    draft_status: DraftStatus
    assigned_to: Optional[str] = None
    assigned_user_name: Optional[str] = None
    priority: int
    allocation_hold: bool
    retry_count: int
    last_error: Optional[str] = None
    table_summary: dict
    ai_draft_id: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    assigned_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class TaskStats(BaseModel):
    """Task statistics for dashboard."""
    total_tasks: int
    awaiting_draft: int
    generating_draft: int
    ready_for_annotation: int
    in_progress: int
    completed: int
    qa_pending: int
    qa_done: int
    draft_failed: int


class RetryResponse(BaseModel):
    """Response for task retry operation."""
    task_id: str
    message: str
    new_status: TaskStatus
    new_draft_status: DraftStatus


@router.get("/tasks", response_model=List[TaskSummary])
async def list_tasks(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    draft_status: Optional[DraftStatus] = Query(None, description="Filter by draft status"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    limit: int = Query(50, ge=1, le=200, description="Number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List tasks with filtering and pagination.
    
    Returns tasks that the user has access to based on their organization.
    Supports filtering by project, status, assignment, etc.
    """
    logger.info(
        "Tasks list request",
        user_id=current_user.user_id,
        project_id=project_id,
        status=status,
        draft_status=draft_status
    )
    
    # Build query with organization access control
    query = (
        select(Task)
        .join(Project)
        .join(ParsedTable)
        .join(PDFFile)
        .where(Project.organization_id == UUID(current_user.organization_id))
        .options(
            selectinload(Task.project),
            selectinload(Task.parsed_table).selectinload(ParsedTable.pdf_file),
            selectinload(Task.assigned_user)
        )
    )
    
    # Apply filters
    if project_id:
        query = query.where(Task.project_id == UUID(project_id))
    
    if status:
        query = query.where(Task.status == status)
    
    if draft_status:
        query = query.where(Task.draft_status == draft_status)
    
    if assigned_to:
        query = query.where(Task.assigned_to == UUID(assigned_to))
    
    # Add pagination and ordering
    query = query.order_by(Task.priority.desc(), Task.created_at.desc())
    query = query.offset(offset).limit(limit)
    
    tasks = (await db.execute(query)).scalars().all()
    
    # Convert to response format
    task_summaries = []
    for task in tasks:
        task_summaries.append(TaskSummary(
            task_id=task.task_id,
            table_id=task.parsed_table.table_id,
            project_id=task.project.project_id,
            project_name=task.project.name,
            file_name=task.parsed_table.pdf_file.file_name,
            page_number=task.parsed_table.page_number,
            status=task.status,
            draft_status=task.draft_status,
            assigned_to=str(task.assigned_to) if task.assigned_to else None,
            assigned_user_name=task.assigned_user.full_name if task.assigned_user else None,
            priority=task.priority,
            retry_count=task.retry_count,
            last_error=task.last_error,
            created_at=task.created_at.isoformat(),
            updated_at=task.updated_at.isoformat() if task.updated_at else None
        ))
    
    return task_summaries


@router.get("/tasks/{task_id}", response_model=TaskDetail)
async def get_task_detail(
    task_id: str,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific task.
    
    Returns comprehensive task information including table summary and AI draft status.
    """
    logger.info(
        "Task detail request",
        task_id=task_id,
        user_id=current_user.user_id
    )
    
    # Get task with access control
    query = (
        select(Task)
        .join(Project)
        .where(
            Task.id == UUID(task_id),
            Project.organization_id == UUID(current_user.organization_id)
        )
        .options(
            selectinload(Task.project),
            selectinload(Task.parsed_table).selectinload(ParsedTable.pdf_file),
            selectinload(Task.assigned_user),
            selectinload(Task.ai_draft)
        )
    )
    
    task = await db.scalar(query)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Create table summary from schema
    table_schema = task.parsed_table.schema_json
    table_summary = {
        "n_rows": table_schema.get("n_rows", 0),
        "n_cols": table_schema.get("n_cols", 0),
        "detector": table_schema.get("meta", {}).get("detector", "unknown"),
        "confidence": table_schema.get("meta", {}).get("confidence", 0.0),
        "extraction_flavor": table_schema.get("meta", {}).get("extraction_flavor", "unknown")
    }
    
    return TaskDetail(
        task_id=task.task_id,
        table_id=task.parsed_table.table_id,
        project_id=task.project.project_id,
        project_name=task.project.name,
        file_id=task.parsed_table.pdf_file.file_id,
        file_name=task.parsed_table.pdf_file.file_name,
        page_number=task.parsed_table.page_number,
        status=task.status,
        draft_status=task.draft_status,
        assigned_to=str(task.assigned_to) if task.assigned_to else None,
        assigned_user_name=task.assigned_user.full_name if task.assigned_user else None,
        priority=task.priority,
        allocation_hold=task.allocation_hold,
        retry_count=task.retry_count,
        last_error=task.last_error,
        table_summary=table_summary,
        ai_draft_id=str(task.ai_draft.id) if task.ai_draft else None,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat() if task.updated_at else None,
        assigned_at=task.assigned_at,
        started_at=task.started_at,
        completed_at=task.completed_at
    )


@router.post("/tasks/{task_id}/retry-draft", response_model=RetryResponse)
async def retry_draft_generation(
    task_id: str,
    current_user: JWTPayload = Depends(require_annotator),
    db: AsyncSession = Depends(get_db)
):
    """
    Retry AI draft generation for a failed task.
    
    Resets the task status and enqueues a new draft generation job.
    Only works for tasks in 'draft_failed' status.
    """
    logger.info(
        "Draft retry request",
        task_id=task_id,
        user_id=current_user.user_id
    )
    
    # Get task with access control
    query = (
        select(Task)
        .join(Project)
        .where(
            Task.id == UUID(task_id),
            Project.organization_id == UUID(current_user.organization_id)
        )
    )
    
    task = await db.scalar(query)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Check if task can be retried
    if task.draft_status != DraftStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task cannot be retried. Current draft status: {task.draft_status}"
        )
    
    # Reset task status
    task.status = TaskStatus.AWAITING_DRAFT
    task.draft_status = DraftStatus.QUEUED
    task.last_error = None
    task.allocation_hold = True
    
    await db.commit()
    
    # TODO: Enqueue draft generation job
    # For now, just return success response
    
    logger.info(
        "Task draft retry initiated",
        task_id=task_id,
        retry_count=task.retry_count
    )
    
    return RetryResponse(
        task_id=task_id,
        message="Draft generation retry initiated",
        new_status=task.status,
        new_draft_status=task.draft_status
    )


@router.get("/projects/{project_id}/task-stats", response_model=TaskStats)
async def get_project_task_stats(
    project_id: str,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get task statistics for a project.
    
    Returns counts of tasks in each status for dashboard display.
    """
    logger.info(
        "Project task stats request",
        project_id=project_id,
        user_id=current_user.user_id
    )
    
    # Verify project access
    project_query = select(Project).where(
        Project.id == UUID(project_id),
        Project.organization_id == UUID(current_user.organization_id)
    )
    project = await db.scalar(project_query)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    # Get task counts by status
    stats_query = (
        select(
            func.count().label("total"),
            func.sum(func.case((Task.status == TaskStatus.AWAITING_DRAFT, 1), else_=0)).label("awaiting_draft"),
            func.sum(func.case((Task.draft_status == DraftStatus.GENERATING, 1), else_=0)).label("generating_draft"),
            func.sum(func.case((Task.status == TaskStatus.READY_FOR_ANNOTATION, 1), else_=0)).label("ready_for_annotation"),
            func.sum(func.case((Task.status == TaskStatus.IN_PROGRESS, 1), else_=0)).label("in_progress"),
            func.sum(func.case((Task.status == TaskStatus.COMPLETED, 1), else_=0)).label("completed"),
            func.sum(func.case((Task.status == TaskStatus.QA_PENDING, 1), else_=0)).label("qa_pending"),
            func.sum(func.case((Task.status == TaskStatus.QA_DONE, 1), else_=0)).label("qa_done"),
            func.sum(func.case((Task.draft_status == DraftStatus.FAILED, 1), else_=0)).label("draft_failed")
        )
        .where(Task.project_id == UUID(project_id))
    )
    
    result = await db.execute(stats_query)
    row = result.first()
    
    return TaskStats(
        total_tasks=row.total or 0,
        awaiting_draft=row.awaiting_draft or 0,
        generating_draft=row.generating_draft or 0,
        ready_for_annotation=row.ready_for_annotation or 0,
        in_progress=row.in_progress or 0,
        completed=row.completed or 0,
        qa_pending=row.qa_pending or 0,
        qa_done=row.qa_done or 0,
        draft_failed=row.draft_failed or 0
    )


@router.post("/tasks/{task_id}/assign")
async def assign_task(
    task_id: str,
    user_id: Optional[str] = None,
    current_user: JWTPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Assign or unassign a task to a user.
    
    Only admins can assign tasks. If user_id is None, the task is unassigned.
    """
    logger.info(
        "Task assignment request",
        task_id=task_id,
        user_id=user_id,
        admin_user=current_user.user_id
    )
    
    # Get task with access control
    query = (
        select(Task)
        .join(Project)
        .where(
            Task.id == UUID(task_id),
            Project.organization_id == UUID(current_user.organization_id)
        )
    )
    
    task = await db.scalar(query)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Update assignment
    if user_id:
        task.assigned_to = UUID(user_id)
        task.assigned_at = task.updated_at
        message = f"Task assigned to user {user_id}"
    else:
        task.assigned_to = None
        task.assigned_at = None
        message = "Task unassigned"
    
    await db.commit()
    
    logger.info(
        "Task assignment updated",
        task_id=task_id,
        assigned_to=user_id
    )
    
    return {"message": message, "task_id": task_id, "assigned_to": user_id} 