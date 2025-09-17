"""
Structured logging configuration for the application.
Supports both JSON and text formats with contextual information.
"""

import logging
import logging.config
import sys
from typing import Any, Dict

import structlog
from pythonjsonlogger import jsonlogger

from app.core.config import get_settings

settings = get_settings()


def setup_logging() -> structlog.BoundLogger:
    """
    Configure structured logging with JSON format for production
    and human-readable format for development.
    """
    
    # Configure standard library logging
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "console": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "default": {
                "level": settings.LOG_LEVEL,
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "json" if settings.LOG_FORMAT == "json" else "console",
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["default"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "uvicorn": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "handlers": ["default"],
                "level": "WARNING",
                "propagate": False,
            },
            "celery": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }
    
    logging.config.dictConfig(logging_config)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer() if settings.LOG_FORMAT == "json" 
            else structlog.dev.ConsoleRenderer(colors=True),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.getLevelName(settings.LOG_LEVEL)
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Get logger instance
    logger = structlog.get_logger("guideline_transform")
    
    # Log startup information
    logger.info(
        "Logging configured",
        level=settings.LOG_LEVEL,
        format=settings.LOG_FORMAT,
        environment=settings.APP_ENV,
    )
    
    return logger


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a logger instance with the given name."""
    return structlog.get_logger(name)


class LoggingMixin:
    """Mixin class to add logging capabilities to other classes."""
    
    @property
    def logger(self) -> structlog.BoundLogger:
        """Get logger instance for this class."""
        return structlog.get_logger(self.__class__.__name__)


def log_function_call(func_name: str, **kwargs) -> Dict[str, Any]:
    """Helper to create consistent function call log context."""
    return {
        "function": func_name,
        "event": "function_call",
        **kwargs
    }


def log_database_operation(operation: str, table: str, **kwargs) -> Dict[str, Any]:
    """Helper to create consistent database operation log context."""
    return {
        "operation": operation,
        "table": table,
        "event": "database_operation",
        **kwargs
    }


def log_external_api_call(service: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Helper to create consistent external API call log context."""
    return {
        "service": service,
        "endpoint": endpoint,
        "event": "external_api_call",
        **kwargs
    }


def log_file_operation(operation: str, file_path: str, **kwargs) -> Dict[str, Any]:
    """Helper to create consistent file operation log context."""
    return {
        "operation": operation,
        "file_path": file_path,
        "event": "file_operation",
        **kwargs
    }


def log_task_operation(task_type: str, task_id: str, **kwargs) -> Dict[str, Any]:
    """Helper to create consistent task operation log context."""
    return {
        "task_type": task_type,
        "task_id": task_id,
        "event": "task_operation",
        **kwargs
    } 