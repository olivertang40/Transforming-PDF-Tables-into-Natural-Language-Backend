"""
File and table models for PDF processing pipeline.
Handles uploaded PDFs and extracted table schemas.
"""

import enum
from typing import Optional, Dict, Any

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class FileStatus(str, enum.Enum):
    """Status of PDF file processing."""
    UPLOADED = "uploaded"
    PARSING = "parsing"
    PARSED = "parsed"
    FAILED = "failed"


class PDFFile(Base, UUIDMixin, TimestampMixin):
    """
    PDF file model for uploaded documents.
    
    Files belong to projects and contain parsed tables.
    Each file goes through: uploaded → parsing → parsed
    """
    
    __tablename__ = "pdf_files"
    
    # Foreign key to project (inherits organization via project)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # File information
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    # Storage path (S3 key or local path)
    s3_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False
    )
    
    upload_path: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True
    )
    
    # File metadata
    file_size: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    mime_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    # Processing status
    status: Mapped[FileStatus] = mapped_column(
        Enum(FileStatus),
        default=FileStatus.UPLOADED,
        nullable=False,
        index=True
    )
    
    # Processing metadata
    total_pages: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    processing_error: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    processing_started_at: Mapped[Optional[str]] = mapped_column(
        "processing_started_at",
        nullable=True
    )
    
    processing_completed_at: Mapped[Optional[str]] = mapped_column(
        "processing_completed_at", 
        nullable=True
    )
    
    # Celery task tracking
    celery_task_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True
    )
    
    # Foreign key to user who uploaded the file
    uploaded_by: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Relationships
    project = relationship("Project", back_populates="pdf_files")
    uploaded_by_user = relationship("User", back_populates="uploaded_files")
    
    parsed_tables = relationship(
        "ParsedTable",
        back_populates="pdf_file",
        cascade="all, delete-orphan"
    )
    
    export_logs = relationship(
        "ExportLog",
        back_populates="pdf_file",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"PDFFile({self.file_name})"
    
    @property
    def file_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def organization_id(self) -> Optional[UUID]:
        """Get organization ID through project relationship."""
        return self.project.organization_id if self.project else None


class ParsedTable(Base, UUIDMixin, TimestampMixin):
    """
    Parsed table model for extracted table schemas.
    
    Each table is extracted from a specific page of a PDF file
    and normalized to the unified JSON schema.
    """
    
    __tablename__ = "parsed_tables"
    
    # Foreign key to PDF file
    file_id: Mapped[UUID] = mapped_column(
        ForeignKey("pdf_files.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Table location
    page_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True
    )
    
    # Unified table schema (JSON)
    schema_json: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False
    )
    
    # Detection metadata
    detector: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    
    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        index=True
    )
    
    # Processing metadata
    extraction_flavor: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    
    processing_time_ms: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    # Relationships
    pdf_file = relationship("PDFFile", back_populates="parsed_tables")
    
    tasks = relationship(
        "Task",
        back_populates="parsed_table",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"ParsedTable(file={self.file_id}, page={self.page_number})"
    
    @property
    def table_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def organization_id(self) -> Optional[UUID]:
        """Get organization ID through file → project relationship."""
        return self.pdf_file.organization_id if self.pdf_file else None
    
    @property
    def project_id(self) -> Optional[UUID]:
        """Get project ID through file relationship."""
        return self.pdf_file.project_id if self.pdf_file else None 