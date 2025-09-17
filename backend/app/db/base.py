"""
SQLAlchemy base class and common database utilities.
Provides base model with common fields and utilities.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all database models."""
    
    # Generate table names automatically
    __abstract__ = True
    
    def __repr__(self) -> str:
        """String representation of the model."""
        class_name = self.__class__.__name__
        attrs = []
        
        # Show primary key fields
        for column in self.__table__.primary_key.columns:
            value = getattr(self, column.name, None)
            attrs.append(f"{column.name}={value}")
            
        return f"{class_name}({', '.join(attrs)})"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            elif isinstance(value, uuid.UUID):
                value = str(value)
            result[column.name] = value
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Base":
        """Create model instance from dictionary."""
        return cls(**data)


class TimestampMixin:
    """Mixin for models that need created_at and updated_at timestamps."""
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
        index=True
    )
    
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=datetime.utcnow,
        nullable=True
    )


class UUIDMixin:
    """Mixin for models that use UUID as primary key."""
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        nullable=False
    )


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.utcnow()


# Import all models here to ensure they are registered with SQLAlchemy
# This is important for Alembic to detect all models
from app.db.models.organizations import Organization  # noqa
from app.db.models.projects import Project  # noqa
from app.db.models.users import User, UserOrganization, UserProject  # noqa
from app.db.models.files import PDFFile, ParsedTable  # noqa
from app.db.models.tasks import Task, AIDraft, HumanEdit, QACheck  # noqa
from app.db.models.exports import ExportLog  # noqa 