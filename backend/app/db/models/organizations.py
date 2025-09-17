"""
Organization model for multi-tenant isolation.
Root entity in the tenant hierarchy.
"""

from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Dict, Any

from app.db.base import Base, TimestampMixin, UUIDMixin


class Organization(Base, UUIDMixin, TimestampMixin):
    """
    Organization model for multi-tenant isolation.
    
    This is the root entity in the tenant hierarchy:
    organizations → projects → pdf_files → parsed_tables → tasks
    """
    
    __tablename__ = "organizations"
    
    # Basic information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    description: Mapped[str] = mapped_column(
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
    users = relationship(
        "UserOrganization",
        back_populates="organization",
        cascade="all, delete-orphan"
    )
    
    projects = relationship(
        "Project",
        back_populates="organization",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"Organization({self.name})"
    
    @property
    def org_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id) 