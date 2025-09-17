"""
Project model for organizing PDF files and tasks.
Second level in the tenant hierarchy: organizations → projects → files.
"""

from typing import Optional, Dict, Any

from sqlalchemy import ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    """
    Project model for organizing PDF files and tasks.
    
    Projects belong to organizations and contain PDF files.
    Users can have project-specific roles that override organization roles.
    """
    
    __tablename__ = "projects"
    
    # Foreign key to organization (for multi-tenant isolation)
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Basic information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Configuration settings (JSON)
    settings: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default={}
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        index=True
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    
    users = relationship(
        "UserProject",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    
    pdf_files = relationship(
        "PDFFile",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    
    tasks = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    
    export_logs = relationship(
        "ExportLog",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"Project({self.name})"
    
    @property
    def project_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id) 