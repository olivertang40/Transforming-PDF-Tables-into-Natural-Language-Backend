"""
Task and annotation models for the AI-assisted workflow.
Implements the task state machine and human annotation pipeline.
"""

import enum
from typing import Optional, Dict, Any

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class TaskStatus(str, enum.Enum):
    """Task status following the state machine."""
    AWAITING_DRAFT = "awaiting_draft"
    READY_FOR_ANNOTATION = "ready_for_annotation"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    QA_PENDING = "qa_pending"
    QA_DONE = "qa_done"
    REASSIGNED = "reassigned"
    DRAFT_FAILED = "draft_failed"


class DraftStatus(str, enum.Enum):
    """AI draft generation status."""
    QUEUED = "queued"
    GENERATING = "generating"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class QAResult(str, enum.Enum):
    """QA review result."""
    PASS = "pass"
    FAIL = "fail"


class Task(Base, UUIDMixin, TimestampMixin):
    """
    Task model for the annotation workflow.
    
    Tasks are created for each parsed table and follow the state machine:
    awaiting_draft → ready_for_annotation → in_progress → completed → qa_pending → qa_done
    """
    
    __tablename__ = "tasks"
    
    # Foreign keys
    table_id: Mapped[UUID] = mapped_column(
        ForeignKey("parsed_tables.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Task assignment
    assigned_to: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Task status and workflow
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus),
        default=TaskStatus.AWAITING_DRAFT,
        nullable=False,
        index=True
    )
    
    draft_status: Mapped[DraftStatus] = mapped_column(
        Enum(DraftStatus),
        default=DraftStatus.QUEUED,
        nullable=False,
        index=True
    )
    
    # Task priority and allocation
    priority: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        index=True
    )
    
    allocation_hold: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    # Error tracking
    last_error: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    retry_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    
    # Timestamps for workflow tracking
    assigned_at: Mapped[Optional[str]] = mapped_column(
        "assigned_at",
        nullable=True
    )
    
    started_at: Mapped[Optional[str]] = mapped_column(
        "started_at",
        nullable=True
    )
    
    completed_at: Mapped[Optional[str]] = mapped_column(
        "completed_at",
        nullable=True
    )
    
    # Relationships
    parsed_table = relationship("ParsedTable", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")
    
    ai_draft = relationship(
        "AIDraft",
        back_populates="task",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"Task({self.id}, status={self.status})"
    
    @property
    def task_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def organization_id(self) -> Optional[UUID]:
        """Get organization ID through project relationship."""
        return self.project.organization_id if self.project else None


class AIDraft(Base, UUIDMixin, TimestampMixin):
    """
    AI-generated draft model with cost tracking and idempotency.
    
    Each task can have one AI draft. Idempotency is ensured via prompt_hash
    to prevent duplicate LLM calls for the same content.
    """
    
    __tablename__ = "ai_drafts"
    
    # Foreign key to task (one-to-one relationship)
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    
    # AI model information
    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )
    
    prompt_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    
    prompt_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
    )
    
    # Generated content
    draft_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    # Tracing and debugging
    trace_json: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True
    )
    
    # Cost tracking
    usage: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default={}
    )
    
    # Generation metadata
    generation_time_ms: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    temperature: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )
    
    # Relationships
    task = relationship("Task", back_populates="ai_draft")
    
    human_edits = relationship(
        "HumanEdit",
        back_populates="ai_draft",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"AIDraft({self.id}, model={self.model_name})"
    
    @property
    def draft_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)
    
    @property
    def input_tokens(self) -> int:
        """Get input tokens from usage data."""
        return self.usage.get("input_tokens", 0)
    
    @property
    def output_tokens(self) -> int:
        """Get output tokens from usage data."""
        return self.usage.get("output_tokens", 0)
    
    @property
    def cost_usd(self) -> float:
        """Get cost in USD from usage data."""
        return self.usage.get("cost_usd", 0.0)


class HumanEdit(Base, UUIDMixin, TimestampMixin):
    """
    Human edit model for annotator modifications.
    
    Annotators can edit AI drafts to create the final content.
    Multiple edits can be made, with the latest being the current version.
    """
    
    __tablename__ = "human_edits"
    
    # Foreign keys
    draft_id: Mapped[UUID] = mapped_column(
        ForeignKey("ai_drafts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Edited content
    edited_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    # Edit metadata
    edit_reason: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    time_spent_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    # Relationships
    ai_draft = relationship("AIDraft", back_populates="human_edits")
    user = relationship("User", back_populates="edits")
    
    qa_checks = relationship(
        "QACheck",
        back_populates="human_edit",
        cascade="all, delete-orphan"
    )
    
    def __str__(self) -> str:
        return f"HumanEdit({self.id}, user={self.user_id})"
    
    @property
    def edit_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id)


class QACheck(Base, UUIDMixin, TimestampMixin):
    """
    Quality assurance check model.
    
    QA reviewers check human edits and can pass or fail them.
    Failed edits are reassigned for further work.
    """
    
    __tablename__ = "qa_checks"
    
    # Foreign keys
    edit_id: Mapped[UUID] = mapped_column(
        ForeignKey("human_edits.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    reviewer_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # QA result
    result: Mapped[QAResult] = mapped_column(
        Enum(QAResult),
        nullable=False,
        index=True
    )
    
    # QA feedback
    comments: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # QA metadata
    review_time_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    
    # Relationships
    human_edit = relationship("HumanEdit", back_populates="qa_checks")
    reviewer = relationship("User", back_populates="qa_reviews")
    
    def __str__(self) -> str:
        return f"QACheck({self.id}, result={self.result})"
    
    @property
    def qa_id(self) -> str:
        """Alias for id to match the specification."""
        return str(self.id) 