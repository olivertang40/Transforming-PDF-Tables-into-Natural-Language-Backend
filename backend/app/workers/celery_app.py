"""
Celery application configuration for GuidelineTransform AI.
Handles async task processing with Redis backend.
"""

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

# Create Celery app
celery_app = Celery(
    "guideline_transform",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.tasks_draft",
        "app.workers.tasks_parse"
    ]
)

# Configure Celery
celery_app.conf.update(
    # Task routing
    task_routes={
        "app.workers.tasks_draft.generate_ai_draft": {"queue": "drafts"},
        "app.workers.tasks_parse.process_pdf": {"queue": "parsing"},
    },
    
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Task execution
    task_always_eager=settings.APP_ENV == "test",
    task_eager_propagates=True,
    
    # Result backend
    result_expires=3600,  # 1 hour
    result_persistent=True,
    
    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Retry configuration
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Beat schedule (for periodic tasks)
    beat_schedule={
        "cleanup-failed-tasks": {
            "task": "app.workers.tasks_draft.cleanup_failed_tasks",
            "schedule": 3600.0,  # Every hour
        },
    },
)

# Task configuration defaults
celery_app.conf.task_default_retry_delay = 60  # 1 minute
celery_app.conf.task_max_retries = 3


@celery_app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery connectivity."""
    print(f"Request: {self.request!r}")
    return "Celery is working!"


if __name__ == "__main__":
    celery_app.start() 