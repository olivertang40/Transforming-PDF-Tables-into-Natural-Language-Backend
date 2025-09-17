"""
Export log model for tracking data exports.
Records when and what data was exported for audit purposes.
"""

import enum
from typing import Optional, Dict, Any

from sqlalchemy import Enum, ForeignKey, String, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class ExportType(str, enum.Enum):
    """Type of export performed."""
    JSON = "json"
    TXT = "txt"
    ZIP = "zip"


class ExportLog(Base, UUIDMixin, TimestampMixin):
    """
    Export log model for tracking data exports.
    
    Records when data is exported from projects or files,
    including the export type and storage path.
    """
    
    __tablename__ = "export_logs"
    
    # Foreign keys (either project or file export)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    file_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("pdf_files.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # Export metadata
    export_type: Mapped[ExportType] = mapped_column(
        Enum(ExportType),
        nullable=False,
        index=True
    )
    
    # Storage path for the exported file
    path: Mapped[str] = mapped_column(
        String(512),
        nullable=False
    )
    
    # Export statistics
    total_records: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    file_size_bytes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    # Export parameters (JSON)
    export_params: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default={}
    )
    
    # Relationships
    project = relationship("Project", back_populates="export_logs")
    pdf_file = relationship("PDFFile", back_populates="export_logs")
    
    def __str__(self) -> str:
        return f"ExportLog({self.id}, type={self.export_type})"
    
    @property
    def export_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def organization_id(self) -> Optional[UUID]:
        """Get organization ID through project relationship."""
        return self.project.organization_id if self.project else None 