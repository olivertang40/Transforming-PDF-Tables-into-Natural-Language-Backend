"""
GuidelineTransform AI - Main FastAPI Application

Production-ready MVP for PDF table extraction and AI-assisted annotation pipeline.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1 import routes_parse, routes_tasks, routes_drafts, routes_export
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.session import engine

# Initialize settings and logging
settings = get_settings()
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    logger.info("Starting GuidelineTransform AI application", extra={"event": "startup"})
    
    # Test database connection
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down GuidelineTransform AI application", extra={"event": "shutdown"})
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="GuidelineTransform AI",
    description="PDF table extraction and AI-assisted annotation pipeline",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy database errors."""
    logger.error(f"Database error: {exc}", extra={"url": str(request.url)})
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred", "error": "internal_server_error"}
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Handle validation errors."""
    logger.warning(f"Validation error: {exc}", extra={"url": str(request.url)})
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "error": "validation_error"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {exc}", extra={"url": str(request.url)}, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": "internal_server_error"}
    )


# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "guideline-transform-ai"}


@app.get("/health/ready")
async def readiness_check():
    """Readiness check with database connectivity."""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "disconnected", "error": str(e)}
        )


# Include API routes
app.include_router(
    routes_parse.router,
    prefix="/api/v1",
    tags=["Parse"]
)

app.include_router(
    routes_tasks.router,
    prefix="/api/v1",
    tags=["Tasks"]
)

app.include_router(
    routes_drafts.router,
    prefix="/api/v1",
    tags=["Drafts"]
)

app.include_router(
    routes_export.router,
    prefix="/api/v1",
    tags=["Export"]
)


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint with basic information."""
    return {
        "message": "GuidelineTransform AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.APP_ENV == "local",
        log_level=settings.LOG_LEVEL.lower(),
    ) 