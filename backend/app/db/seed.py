"""
Database seeding script for demo data.
Creates organizations, projects, users, and sample data for development.
"""

import asyncio
from uuid import uuid4

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models.organizations import Organization
from app.db.models.projects import Project
from app.db.models.users import User, UserOrganization, UserRole
from app.db.session import get_async_session
from app.security.auth_stub import get_password_hash

settings = get_settings()
logger = get_logger(__name__)


async def create_demo_data():
    """Create demo organizations, projects, and users."""
    
    async with get_async_session() as db:
        logger.info("Starting database seeding")
        
        # Create demo organization
        demo_org = Organization(
            name="Demo Insurance Corp",
            description="Demo organization for GuidelineTransform AI",
            settings={"max_users": 100, "features": ["pdf_processing", "ai_drafts", "qa_workflow"]}
        )
        db.add(demo_org)
        await db.flush()  # Get the ID
        
        logger.info(f"Created organization: {demo_org.name} ({demo_org.id})")
        
        # Create demo project
        demo_project = Project(
            organization_id=demo_org.id,
            name="Policy Guidelines Extraction",
            description="Extract and process insurance policy tables",
            settings={"auto_draft": True, "qa_required": True}
        )
        db.add(demo_project)
        await db.flush()
        
        logger.info(f"Created project: {demo_project.name} ({demo_project.id})")
        
        # Create demo users
        users_data = [
            {
                "email": "admin@guideline-transform.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "User",
                "role": UserRole.ADMIN
            },
            {
                "email": "annotator@guideline-transform.com", 
                "password": "annotator123",
                "first_name": "Anna",
                "last_name": "Annotator",
                "role": UserRole.ANNOTATOR
            },
            {
                "email": "qa@guideline-transform.com",
                "password": "qa123", 
                "first_name": "Quinn",
                "last_name": "QA",
                "role": UserRole.QA
            },
            {
                "email": "viewer@guideline-transform.com",
                "password": "viewer123",
                "first_name": "Victor", 
                "last_name": "Viewer",
                "role": UserRole.VIEWER
            }
        ]
        
        created_users = []
        for user_data in users_data:
            # Create user
            user = User(
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                is_active=True,
                is_verified=True
            )
            db.add(user)
            await db.flush()
            
            # Create user-organization relationship
            user_org = UserOrganization(
                user_id=user.id,
                organization_id=demo_org.id,
                role=user_data["role"],
                is_active=True
            )
            db.add(user_org)
            
            created_users.append({
                "user": user,
                "role": user_data["role"],
                "password": user_data["password"]
            })
            
            logger.info(f"Created user: {user.email} with role {user_data['role']}")
        
        await db.commit()
        
        # Print summary
        logger.info("Database seeding completed successfully!")
        logger.info("=" * 50)
        logger.info("DEMO CREDENTIALS")
        logger.info("=" * 50)
        logger.info(f"Organization ID: {demo_org.id}")
        logger.info(f"Project ID: {demo_project.id}")
        logger.info("")
        
        for user_info in created_users:
            user = user_info["user"]
            logger.info(f"Email: {user.email}")
            logger.info(f"Password: {user_info['password']}")
            logger.info(f"Role: {user_info['role']}")
            logger.info(f"User ID: {user.id}")
            logger.info("-" * 30)
        
        logger.info("Use these credentials to test the API endpoints")
        logger.info("=" * 50)


async def create_sample_jwt_tokens():
    """Create sample JWT tokens for API testing."""
    from app.security.auth_stub import create_access_token
    
    # Sample token for admin user
    admin_token = create_access_token(
        user_id="admin-user-123",
        email="admin@guideline-transform.com", 
        organization_id="demo-org-123",
        organization_role="admin",
        project_id="demo-project-123"
    )
    
    logger.info("=" * 50)
    logger.info("SAMPLE JWT TOKENS FOR TESTING")
    logger.info("=" * 50)
    logger.info("Admin Token (use in Authorization: Bearer <token>):")
    logger.info(admin_token)
    logger.info("=" * 50)


if __name__ == "__main__":
    asyncio.run(create_demo_data())
    asyncio.run(create_sample_jwt_tokens()) 