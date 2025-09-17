"""
Drafts API routes for AI draft management.
Handles draft progress tracking and manual draft generation.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user, require_annotator
from app.core.logging import get_logger
from app.db.models.tasks import Task, TaskStatus, DraftStatus, AIDraft
from app.db.models.projects import Project
from app.security.auth_stub import JWTPayload

logger = get_logger(__name__)
router = APIRouter()


# Response DTOs
class DraftProgress(BaseModel):
    """Draft generation progress for a project."""
    project_id: str
    project_name: str
    total_tasks: int
    awaiting_draft: int
    generating: int
    succeeded: int
    failed: int
    progress_percentage: float
    estimated_completion_minutes: Optional[int] = None


class DraftDetail(BaseModel):
    """Detailed AI draft information."""
    draft_id: str
    task_id: str
    model_name: str
    prompt_version: str
    draft_text: str
    usage: dict
    generation_time_ms: Optional[int] = None
    temperature: Optional[float] = None
    created_at: str


class DraftSummary(BaseModel):
    """Summary of AI draft for listing."""
    draft_id: str
    task_id: str
    table_id: str
    file_name: str
    page_number: int
    model_name: str
    draft_length: int
    input_tokens: int
    output_tokens: int
    cost_usd: float
    created_at: str


class GenerateDraftRequest(BaseModel):
    """Request to generate AI draft."""
    force_regenerate: bool = False
    model_override: Optional[str] = None
    temperature_override: Optional[float] = None


class GenerateDraftResponse(BaseModel):
    """Response for draft generation request."""
    task_id: str
    message: str
    draft_status: DraftStatus
    estimated_completion_seconds: Optional[int] = None


@router.get("/projects/{project_id}/draft-progress", response_model=DraftProgress)
async def get_draft_progress(
    project_id: str,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI draft generation progress for a project.
    
    Returns statistics about draft generation status and estimated completion time.
    """
    logger.info(
        "Draft progress request",
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
    
    # Get draft statistics
    stats_query = (
        select(
            func.count().label("total"),
            func.sum(func.case((Task.status == TaskStatus.AWAITING_DRAFT, 1), else_=0)).label("awaiting_draft"),
            func.sum(func.case((Task.draft_status == DraftStatus.GENERATING, 1), else_=0)).label("generating"),
            func.sum(func.case((Task.draft_status == DraftStatus.SUCCEEDED, 1), else_=0)).label("succeeded"),
            func.sum(func.case((Task.draft_status == DraftStatus.FAILED, 1), else_=0)).label("failed")
        )
        .where(Task.project_id == UUID(project_id))
    )
    
    result = await db.execute(stats_query)
    row = result.first()
    
    total = row.total or 0
    awaiting_draft = row.awaiting_draft or 0
    generating = row.generating or 0
    succeeded = row.succeeded or 0
    failed = row.failed or 0
    
    # Calculate progress percentage
    completed_drafts = succeeded + failed
    progress_percentage = (completed_drafts / total * 100) if total > 0 else 0
    
    # Estimate completion time (rough estimate based on current rate)
    remaining_drafts = awaiting_draft + generating
    estimated_completion_minutes = None
    if remaining_drafts > 0:
        # Assume 2 minutes per draft on average
        estimated_completion_minutes = remaining_drafts * 2
    
    return DraftProgress(
        project_id=project_id,
        project_name=project.name,
        total_tasks=total,
        awaiting_draft=awaiting_draft,
        generating=generating,
        succeeded=succeeded,
        failed=failed,
        progress_percentage=progress_percentage,
        estimated_completion_minutes=estimated_completion_minutes
    )


@router.post("/draft/{task_id}", response_model=GenerateDraftResponse)
async def generate_draft(
    task_id: str,
    request: GenerateDraftRequest,
    current_user: JWTPayload = Depends(require_annotator),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually trigger AI draft generation for a task.
    
    Can force regeneration of existing drafts or use custom model parameters.
    """
    logger.info(
        "Manual draft generation request",
        task_id=task_id,
        user_id=current_user.user_id,
        force_regenerate=request.force_regenerate
    )
    
    # Get task with access control
    task_query = (
        select(Task)
        .join(Project)
        .where(
            Task.id == UUID(task_id),
            Project.organization_id == UUID(current_user.organization_id)
        )
    )
    
    task = await db.scalar(task_query)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Check if draft already exists
    if task.ai_draft and not request.force_regenerate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft already exists. Use force_regenerate=true to override."
        )
    
    # Check task status
    if task.status not in [TaskStatus.AWAITING_DRAFT, TaskStatus.READY_FOR_ANNOTATION]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot generate draft for task in status: {task.status}"
        )
    
    # Update task status
    task.draft_status = DraftStatus.QUEUED
    if task.status == TaskStatus.READY_FOR_ANNOTATION and request.force_regenerate:
        task.status = TaskStatus.AWAITING_DRAFT
    
    await db.commit()
    
    # TODO: Enqueue draft generation job with custom parameters
    # For now, just return success response
    
    logger.info(
        "Draft generation queued",
        task_id=task_id,
        model_override=request.model_override,
        temperature_override=request.temperature_override
    )
    
    return GenerateDraftResponse(
        task_id=task_id,
        message="Draft generation queued successfully",
        draft_status=task.draft_status,
        estimated_completion_seconds=120  # 2 minutes estimate
    )


@router.get("/drafts/{draft_id}", response_model=DraftDetail)
async def get_draft_detail(
    draft_id: str,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about an AI draft.
    
    Returns the full draft content, model information, and usage statistics.
    """
    logger.info(
        "Draft detail request",
        draft_id=draft_id,
        user_id=current_user.user_id
    )
    
    # Get draft with access control
    draft_query = (
        select(AIDraft)
        .join(Task)
        .join(Project)
        .where(
            AIDraft.id == UUID(draft_id),
            Project.organization_id == UUID(current_user.organization_id)
        )
    )
    
    draft = await db.scalar(draft_query)
    
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found or access denied"
        )
    
    return DraftDetail(
        draft_id=draft.draft_id,
        task_id=draft.task.task_id,
        model_name=draft.model_name,
        prompt_version=draft.prompt_version,
        draft_text=draft.draft_text,
        usage=draft.usage,
        generation_time_ms=draft.generation_time_ms,
        temperature=draft.temperature,
        created_at=draft.created_at.isoformat()
    )


@router.get("/projects/{project_id}/drafts", response_model=List[DraftSummary])
async def list_project_drafts(
    project_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List AI drafts for a project.
    
    Returns summary information about all drafts in the project.
    """
    logger.info(
        "Project drafts list request",
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
    
    # Get drafts
    drafts_query = (
        select(AIDraft)
        .join(Task)
        .where(Task.project_id == UUID(project_id))
        .order_by(AIDraft.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    drafts = (await db.execute(drafts_query)).scalars().all()
    
    # Convert to response format
    draft_summaries = []
    for draft in drafts:
        # Get table info
        table = draft.task.parsed_table
        
        draft_summaries.append(DraftSummary(
            draft_id=draft.draft_id,
            task_id=draft.task.task_id,
            table_id=table.table_id,
            file_name=table.pdf_file.file_name,
            page_number=table.page_number,
            model_name=draft.model_name,
            draft_length=len(draft.draft_text),
            input_tokens=draft.input_tokens,
            output_tokens=draft.output_tokens,
            cost_usd=draft.cost_usd,
            created_at=draft.created_at.isoformat()
        ))
    
    return draft_summaries


@router.get("/projects/{project_id}/draft-costs")
async def get_project_draft_costs(
    project_id: str,
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI draft cost summary for a project.
    
    Returns total costs, token usage, and cost breakdown by model.
    """
    logger.info(
        "Project draft costs request",
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
    
    # Get cost statistics
    costs_query = (
        select(
            func.count().label("total_drafts"),
            func.sum(func.cast(AIDraft.usage['input_tokens'].astext, db.Integer)).label("total_input_tokens"),
            func.sum(func.cast(AIDraft.usage['output_tokens'].astext, db.Integer)).label("total_output_tokens"),
            func.sum(func.cast(AIDraft.usage['cost_usd'].astext, db.Float)).label("total_cost_usd"),
            AIDraft.model_name
        )
        .join(Task)
        .where(Task.project_id == UUID(project_id))
        .group_by(AIDraft.model_name)
    )
    
    results = (await db.execute(costs_query)).all()
    
    # Aggregate results
    total_cost = 0.0
    total_input_tokens = 0
    total_output_tokens = 0
    total_drafts = 0
    cost_by_model = {}
    
    for row in results:
        total_drafts += row.total_drafts or 0
        total_input_tokens += row.total_input_tokens or 0
        total_output_tokens += row.total_output_tokens or 0
        total_cost += row.total_cost_usd or 0.0
        
        cost_by_model[row.model_name] = {
            "drafts": row.total_drafts or 0,
            "input_tokens": row.total_input_tokens or 0,
            "output_tokens": row.total_output_tokens or 0,
            "cost_usd": row.total_cost_usd or 0.0
        }
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        "summary": {
            "total_drafts": total_drafts,
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "total_cost_usd": round(total_cost, 4),
            "average_cost_per_draft": round(total_cost / total_drafts, 4) if total_drafts > 0 else 0.0
        },
        "cost_by_model": cost_by_model
    } 