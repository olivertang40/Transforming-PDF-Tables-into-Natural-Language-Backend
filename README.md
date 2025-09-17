# GuidelineTransform AI

A production-ready MVP for transforming PDF tables into natural-language drafts with AI-assisted pipeline, human edits, and QA workflow.

## Architecture Overview

- **Backend**: FastAPI + SQLAlchemy 2 (async) + Alembic + Pydantic v2
- **Database**: PostgreSQL 15 with multi-tenant isolation
- **Queue**: Celery + Redis (local), SQS-ready adapter
- **Storage**: MinIO (local), S3-compatible
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT-based with RBAC (organization/project scoped)

## Core Features

1. **PDF Processing**: Upload PDF → detect tables page-by-page → normalize to unified JSON schema
2. **AI Draft Generation**: Auto-create AI drafts before human annotation
3. **Multi-tenant Workflow**: Organizations → Projects → Files → Tables → Tasks
4. **Role-based Access**: admin/annotator/qa/viewer at org/project levels
5. **Export Pipeline**: Raw parse + AI draft + human edits → JSON/TXT/ZIP

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### Setup

1. **Clone and configure**:
```bash
cp .env.example .env
# Edit .env with your settings
```

2. **Start services**:
```bash
make up
```

3. **Initialize database**:
```bash
make migrate
make seed
```

4. **Access services**:
- API: http://localhost:8000
- Frontend: http://localhost:3000
- MinIO Console: http://localhost:9001 (admin/password123)
- API Docs: http://localhost:8000/docs

### Development Commands

```bash
make up          # Start all services
make down        # Stop all services
make logs        # View logs
make migrate     # Run database migrations
make revision    # Create new migration
make seed        # Seed demo data
make test        # Run tests
make fmt         # Format code
make clean       # Clean up containers and volumes
```

## API Endpoints

### Core Processing
- `POST /api/v1/parse` - Upload PDF and start processing
- `GET /api/v1/files/{file_id}/parse-status` - Check parsing progress
- `GET /api/v1/projects/{id}/draft-progress` - Check AI draft progress

### Task Management
- `GET /api/v1/tasks` - List tasks with filters
- `POST /api/v1/tasks/{task_id}/retry-draft` - Retry failed draft generation
- `POST /api/v1/draft/{task_id}` - Manual draft regeneration

### Export
- `POST /api/v1/export` - Export project/file data

## Database Schema

### Multi-tenant Hierarchy
```
organizations → projects → pdf_files → parsed_tables → tasks
```

### Key Tables
- `organizations` - Tenant isolation root
- `users` + `user_organizations` + `user_projects` - RBAC
- `pdf_files` - Uploaded documents
- `parsed_tables` - Extracted table schemas
- `tasks` - Work units with state machine
- `ai_drafts` - Generated content with cost tracking
- `human_edits` - Annotator modifications
- `qa_checks` - Quality assurance reviews

## Task State Machine

```
uploaded → parsing → parsed
parsed → awaiting_draft → ready_for_annotation → in_progress → completed → qa_pending → (qa_done | reassigned)
awaiting_draft → draft_failed (retryable)
```

## Configuration

### Local Development (.env)
```env
APP_ENV=local
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/guideline_transform
REDIS_URL=redis://localhost:6379/0
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=guideline-transform
OPENAI_API_KEY=your-key-here
```

### Production Migration

#### MinIO → S3
1. Update `S3_ENDPOINT_URL` to AWS endpoint
2. Configure IAM credentials
3. Set `S3_USE_SSL=true`

#### Celery → SQS
1. Set `QUEUE_ADAPTER=sqs` in config
2. Configure `AWS_SQS_QUEUE_URL`
3. Update IAM permissions

#### Auth → Cognito/Clerk
1. Replace `security/auth_stub.py`
2. Update JWT validation logic
3. Configure identity provider

## Testing

```bash
# Run all tests
make test

# Run specific test suites
docker-compose exec api pytest tests/test_parse_flow.py
docker-compose exec api pytest tests/test_draft_flow.py
```

## Cost & Scaling Notes

- **AI Costs**: Tracked in `ai_drafts.usage` with token counts and USD estimates
- **Idempotency**: Prevents duplicate LLM calls via prompt_hash deduplication
- **Retry Logic**: Exponential backoff for failed draft generation (max 3 attempts)
- **Storage**: Organized by `s3://{org}/{project}/{file}/tables/{table_id}.json`
- **Multi-tenancy**: Strict isolation via `organization_id` across all data access

## Extension Points

- **OCR Integration**: Hooks ready in `pdf_detect.py` for deep-learning extractors
- **Advanced Auth**: Replace stub with Cognito/Clerk integration
- **Queue Scaling**: SQS adapter for serverless scaling
- **Rich Editor**: Frontend components ready for enhanced annotation UI
- **ML Training**: Export pipeline generates reusable training datasets

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check PostgreSQL is running and credentials
2. **MinIO access errors**: Verify S3 credentials and bucket exists
3. **Celery worker not processing**: Check Redis connection and worker logs
4. **PDF parsing failures**: Check file permissions and supported formats

### Logs

```bash
# View all service logs
make logs

# View specific service
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f postgres
```

## License

MIT License - see LICENSE file for details. 