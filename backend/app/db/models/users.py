"""
User models for authentication and role-based access control.
Supports multi-tenant hierarchy with organization and project-scoped roles.
"""

import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class UserRole(str, enum.Enum):
    """User roles with hierarchical permissions."""
    ADMIN = "admin"
    QA = "qa"
    ANNOTATOR = "annotator"
    VIEWER = "viewer"


class User(Base, UUIDMixin, TimestampMixin):
    """
    User model for authentication.
    Users can belong to multiple organizations with different roles.
    """
    
    __tablename__ = "users"
    
    # Authentication
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    
    # Profile information
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        index=True
    )
    
    is_verified: Mapped[bool] = mapped_column(
        default=False,
        nullable=False
    )
    
    # Relationships
    organizations = relationship(
        "UserOrganization",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    projects = relationship(
        "UserProject",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Files uploaded by this user
    uploaded_files = relationship(
        "PDFFile",
        back_populates="uploaded_by_user",
        foreign_keys="PDFFile.uploaded_by"
    )
    
    # Tasks assigned to this user
    assigned_tasks = relationship(
        "Task",
        back_populates="assigned_user",
        foreign_keys="Task.assigned_to"
    )
    
    # Human edits by this user
    edits = relationship(
        "HumanEdit",
        back_populates="user"
    )
    
    # QA reviews by this user
    qa_reviews = relationship(
        "QACheck",
        back_populates="reviewer"
    )
    
    def __str__(self) -> str:
        return f"User({self.email})"
    
    @property
    def user_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def full_name(self) -> str:
        """Get full name of the user."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return self.email.split("@")[0]


class UserOrganization(Base, UUIDMixin, TimestampMixin):
    """
    User-Organization relationship with role-based access control.
    Defines user roles at the organization level.
    """
    
    __tablename__ = "user_organizations"
    
    # Foreign keys
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Role at organization level
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        index=True
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False
    )
    
    # Relationships
    user = relationship("User", back_populates="organizations")
    organization = relationship("Organization", back_populates="users")
    
    # Ensure unique user-organization pairs
    __table_args__ = (
        UniqueConstraint("user_id", "organization_id", name="unique_user_org"),
    )
    
    def __str__(self) -> str:
        return f"UserOrganization(user={self.user_id}, org={self.organization_id}, role={self.role})"
    
    @property
    def user_org_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)


class UserProject(Base, UUIDMixin, TimestampMixin):
    """
    User-Project relationship for project-scoped roles.
    Optional: users can have project-specific roles that override organization roles.
    """
    
    __tablename__ = "user_projects"
    
    # Foreign keys
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Role at project level (overrides organization role for this project)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        index=True
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False
    )
    
    # Relationships
    user = relationship("User", back_populates="projects")
    project = relationship("Project", back_populates="users")
    
    # Ensure unique user-project pairs
    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="unique_user_project"),
    )
    
    def __str__(self) -> str:
        return f"UserProject(user={self.user_id}, project={self.project_id}, role={self.role})" 