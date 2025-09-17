"""
Export API routes for data export functionality.
Handles exporting project/file data in various formats (JSON, TXT, ZIP).
"""

import json
import zipfile
from io import BytesIO, StringIO
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, get_current_user, require_viewer
from app.core.logging import get_logger
from app.db.models.exports import ExportLog, ExportType
from app.db.models.files import PDFFile, ParsedTable
from app.db.models.projects import Project
from app.db.models.tasks import Task, AIDraft, HumanEdit, QACheck
from app.security.auth_stub import JWTPayload

logger = get_logger(__name__)
router = APIRouter()


# Request/Response DTOs
class ExportRequest(BaseModel):
    """Request for data export."""
    export_type: ExportType
    file_id: Optional[str] = None
    project_id: Optional[str] = None
    include_raw_parse: bool = True
    include_ai_draft: bool = True
    include_human_edit: bool = True
    include_qa_results: bool = True


class ExportResponse(BaseModel):
    """Response for export request."""
    export_id: str
    export_type: ExportType
    download_url: str
    file_size_bytes: int
    total_records: int
    created_at: str


class ExportStatus(BaseModel):
    """Export status information."""
    export_id: str
    export_type: ExportType
    status: str
    progress_percentage: float
    total_records: Optional[int] = None
    file_size_bytes: Optional[int] = None
    created_at: str
    completed_at: Optional[str] = None


@router.post("/export", response_model=ExportResponse)
async def export_data(
    request: ExportRequest,
    current_user: JWTPayload = Depends(require_viewer),
    db: AsyncSession = Depends(get_db)
):
    """
    Export project or file data in the requested format.
    
    Supports exporting:
    - Individual PDF file data
    - Entire project data
    - Various formats: JSON, TXT, ZIP
    - Configurable data inclusion (raw parse, AI draft, human edits, QA)
    """
    logger.info(
        "Export request",
        export_type=request.export_type,
        file_id=request.file_id,
        project_id=request.project_id,
        user_id=current_user.user_id
    )
    
    if not request.file_id and not request.project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file_id or project_id must be provided"
        )
    
    # Verify access and get data
    if request.file_id:
        # File-level export
        file_query = (
            select(PDFFile)
            .join(Project)
            .where(
                PDFFile.id == UUID(request.file_id),
                Project.organization_id == UUID(current_user.organization_id)
            )
            .options(
                selectinload(PDFFile.parsed_tables).selectinload(ParsedTable.tasks)
            )
        )
        pdf_file = await db.scalar(file_query)
        
        if not pdf_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or access denied"
            )
        
        export_data = await _export_file_data(pdf_file, request, db)
        project = pdf_file.project
        
    else:
        # Project-level export
        project_query = (
            select(Project)
            .where(
                Project.id == UUID(request.project_id),
                Project.organization_id == UUID(current_user.organization_id)
            )
            .options(
                selectinload(Project.pdf_files).selectinload(PDFFile.parsed_tables).selectinload(ParsedTable.tasks)
            )
        )
        project = await db.scalar(project_query)
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or access denied"
            )
        
        export_data = await _export_project_data(project, request, db)
    
    # Generate export file
    if request.export_type == ExportType.JSON:
        file_content, filename = _generate_json_export(export_data, project.name)
        content_type = "application/json"
    elif request.export_type == ExportType.TXT:
        file_content, filename = _generate_txt_export(export_data, project.name)
        content_type = "text/plain"
    elif request.export_type == ExportType.ZIP:
        file_content, filename = _generate_zip_export(export_data, project.name)
        content_type = "application/zip"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export type: {request.export_type}"
        )
    
    # Create export log
    export_log = ExportLog(
        project_id=project.id,
        file_id=UUID(request.file_id) if request.file_id else None,
        export_type=request.export_type,
        path=f"exports/{filename}",
        total_records=len(export_data.get("tables", [])),
        file_size_bytes=len(file_content),
        export_params=request.dict()
    )
    
    db.add(export_log)
    await db.commit()
    await db.refresh(export_log)
    
    logger.info(
        "Export completed",
        export_id=export_log.export_id,
        file_size=len(file_content),
        total_records=export_log.total_records
    )
    
    # Return file as streaming response
    file_stream = BytesIO(file_content.encode('utf-8') if isinstance(file_content, str) else file_content)
    
    return StreamingResponse(
        iter([file_stream.getvalue()]),
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Length": str(len(file_content))
        }
    )


@router.get("/exports", response_model=List[ExportStatus])
async def list_exports(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: JWTPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List export history for the user's organization.
    
    Returns information about past exports including status and download links.
    """
    logger.info(
        "Export list request",
        project_id=project_id,
        user_id=current_user.user_id
    )
    
    # Build query with organization access control
    query = (
        select(ExportLog)
        .join(Project)
        .where(Project.organization_id == UUID(current_user.organization_id))
        .order_by(ExportLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    if project_id:
        query = query.where(ExportLog.project_id == UUID(project_id))
    
    exports = (await db.execute(query)).scalars().all()
    
    return [
        ExportStatus(
            export_id=export_log.export_id,
            export_type=export_log.export_type,
            status="completed",  # All logged exports are completed
            progress_percentage=100.0,
            total_records=export_log.total_records,
            file_size_bytes=export_log.file_size_bytes,
            created_at=export_log.created_at.isoformat(),
            completed_at=export_log.created_at.isoformat()
        )
        for export_log in exports
    ]


async def _export_file_data(pdf_file: PDFFile, request: ExportRequest, db: AsyncSession) -> dict:
    """Export data for a single PDF file."""
    export_data = {
        "file_info": {
            "file_id": pdf_file.file_id,
            "file_name": pdf_file.file_name,
            "project_id": str(pdf_file.project_id),
            "project_name": pdf_file.project.name,
            "total_pages": pdf_file.total_pages,
            "created_at": pdf_file.created_at.isoformat()
        },
        "tables": []
    }
    
    for table in pdf_file.parsed_tables:
        table_data = await _export_table_data(table, request, db)
        export_data["tables"].append(table_data)
    
    return export_data


async def _export_project_data(project: Project, request: ExportRequest, db: AsyncSession) -> dict:
    """Export data for an entire project."""
    export_data = {
        "project_info": {
            "project_id": project.project_id,
            "project_name": project.name,
            "description": project.description,
            "organization_id": str(project.organization_id),
            "created_at": project.created_at.isoformat()
        },
        "files": []
    }
    
    for pdf_file in project.pdf_files:
        file_data = await _export_file_data(pdf_file, request, db)
        export_data["files"].append(file_data)
    
    return export_data


async def _export_table_data(table: ParsedTable, request: ExportRequest, db: AsyncSession) -> dict:
    """Export data for a single table with all associated content."""
    table_data = {
        "table_id": table.table_id,
        "page_number": table.page_number,
        "detector": table.detector,
        "confidence": table.confidence,
        "created_at": table.created_at.isoformat()
    }
    
    # Include raw parse data
    if request.include_raw_parse:
        table_data["raw_parse"] = table.schema_json
    
    # Get task for this table
    if table.tasks:
        task = table.tasks[0]  # Assuming one task per table
        table_data["task_id"] = task.task_id
        table_data["task_status"] = task.status.value
        
        # Include AI draft
        if request.include_ai_draft and task.ai_draft:
            draft = task.ai_draft
            table_data["ai_draft"] = {
                "draft_id": draft.draft_id,
                "model_name": draft.model_name,
                "prompt_version": draft.prompt_version,
                "draft_text": draft.draft_text,
                "usage": draft.usage,
                "created_at": draft.created_at.isoformat()
            }
            
            # Include human edits
            if request.include_human_edit:
                edits_query = select(HumanEdit).where(
                    HumanEdit.draft_id == draft.id
                ).order_by(HumanEdit.created_at.desc())
                
                edits = (await db.execute(edits_query)).scalars().all()
                
                if edits:
                    latest_edit = edits[0]
                    table_data["human_edit"] = {
                        "edit_id": latest_edit.edit_id,
                        "edited_text": latest_edit.edited_text,
                        "edit_reason": latest_edit.edit_reason,
                        "user_id": str(latest_edit.user_id),
                        "created_at": latest_edit.created_at.isoformat()
                    }
                    
                    # Include QA results
                    if request.include_qa_results:
                        qa_query = select(QACheck).where(
                            QACheck.edit_id == latest_edit.id
                        ).order_by(QACheck.created_at.desc())
                        
                        qa_checks = (await db.execute(qa_query)).scalars().all()
                        
                        if qa_checks:
                            latest_qa = qa_checks[0]
                            table_data["qa_result"] = {
                                "qa_id": latest_qa.qa_id,
                                "result": latest_qa.result.value,
                                "comments": latest_qa.comments,
                                "reviewer_id": str(latest_qa.reviewer_id),
                                "created_at": latest_qa.created_at.isoformat()
                            }
    
    return table_data


def _generate_json_export(export_data: dict, project_name: str) -> tuple[str, str]:
    """Generate JSON export file."""
    filename = f"{project_name.replace(' ', '_')}_export.json"
    content = json.dumps(export_data, indent=2, ensure_ascii=False)
    return content, filename


def _generate_txt_export(export_data: dict, project_name: str) -> tuple[str, str]:
    """Generate plain text export file."""
    filename = f"{project_name.replace(' ', '_')}_export.txt"
    
    output = StringIO()
    output.write(f"GuidelineTransform AI Export\n")
    output.write(f"Project: {project_name}\n")
    output.write(f"Generated: {export_data.get('project_info', {}).get('created_at', 'N/A')}\n")
    output.write("=" * 50 + "\n\n")
    
    # Handle both file and project exports
    files_data = export_data.get("files", [export_data]) if "files" in export_data else [export_data]
    
    for file_data in files_data:
        if "file_info" in file_data:
            file_info = file_data["file_info"]
            output.write(f"File: {file_info['file_name']}\n")
            output.write(f"File ID: {file_info['file_id']}\n")
            output.write("-" * 30 + "\n")
        
        for table in file_data.get("tables", []):
            output.write(f"\nTable ID: {table['table_id']}\n")
            output.write(f"Page: {table['page_number']}\n")
            output.write(f"Detector: {table['detector']} (confidence: {table['confidence']:.2f})\n")
            
            if "ai_draft" in table:
                output.write(f"\nAI Draft ({table['ai_draft']['model_name']}):\n")
                output.write(table['ai_draft']['draft_text'])
                output.write("\n")
            
            if "human_edit" in table:
                output.write(f"\nHuman Edit:\n")
                output.write(table['human_edit']['edited_text'])
                output.write("\n")
            
            if "qa_result" in table:
                output.write(f"\nQA Result: {table['qa_result']['result']}\n")
                if table['qa_result']['comments']:
                    output.write(f"QA Comments: {table['qa_result']['comments']}\n")
            
            output.write("\n" + "=" * 50 + "\n")
    
    return output.getvalue(), filename


def _generate_zip_export(export_data: dict, project_name: str) -> tuple[bytes, str]:
    """Generate ZIP export file with separate files for each format."""
    filename = f"{project_name.replace(' ', '_')}_export.zip"
    
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add JSON file
        json_content, json_filename = _generate_json_export(export_data, project_name)
        zip_file.writestr(json_filename, json_content)
        
        # Add TXT file
        txt_content, txt_filename = _generate_txt_export(export_data, project_name)
        zip_file.writestr(txt_filename, txt_content)
        
        # Add individual table files if project export
        files_data = export_data.get("files", [export_data]) if "files" in export_data else [export_data]
        
        for file_data in files_data:
            if "file_info" in file_data:
                file_name = file_data["file_info"]["file_name"].replace(".pdf", "")
                
                for i, table in enumerate(file_data.get("tables", [])):
                    table_filename = f"tables/{file_name}_table_{i+1}_page_{table['page_number']}.json"
                    table_content = json.dumps(table, indent=2, ensure_ascii=False)
                    zip_file.writestr(table_filename, table_content)
    
    zip_buffer.seek(0)
    return zip_buffer.getvalue(), filename 