.PHONY: help up down logs migrate revision seed test fmt clean build restart

# Default target
help:
	@echo "GuidelineTransform AI - Development Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make build       - Build all images"
	@echo "  make restart     - Restart all services"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate     - Run database migrations"
	@echo "  make revision    - Create new migration"
	@echo "  make seed        - Seed demo data"
	@echo ""
	@echo "Development Commands:"
	@echo "  make logs        - View all service logs"
	@echo "  make test        - Run all tests"
	@echo "  make fmt         - Format code"
	@echo "  make lint        - Run linting"
	@echo "  make shell       - Open API container shell"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make clean-all   - Clean everything including images"

# Environment setup
up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Services started. Access points:"
	@echo "  API: http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  MinIO Console: http://localhost:9001"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  Flower (Celery): http://localhost:5555"

down:
	@echo "Stopping all services..."
	docker-compose down

build:
	@echo "Building all images..."
	docker-compose build

restart:
	@echo "Restarting all services..."
	docker-compose restart

# Database management
migrate:
	@echo "Running database migrations..."
	docker-compose exec api alembic upgrade head

revision:
	@echo "Creating new migration..."
	@read -p "Enter migration message: " msg; \
	docker-compose exec api alembic revision --autogenerate -m "$$msg"

seed:
	@echo "Seeding demo data..."
	docker-compose exec api python -m app.db.seed

# Development tools
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-worker:
	docker-compose logs -f worker

logs-postgres:
	docker-compose logs -f postgres

shell:
	docker-compose exec api /bin/bash

shell-worker:
	docker-compose exec worker /bin/bash

# Testing and quality
test:
	@echo "Running all tests..."
	docker-compose exec api pytest tests/ -v

test-parse:
	@echo "Running parse flow tests..."
	docker-compose exec api pytest tests/test_parse_flow.py -v

test-draft:
	@echo "Running draft flow tests..."
	docker-compose exec api pytest tests/test_draft_flow.py -v

test-coverage:
	@echo "Running tests with coverage..."
	docker-compose exec api pytest tests/ --cov=app --cov-report=html --cov-report=term

fmt:
	@echo "Formatting Python code..."
	docker-compose exec api black app/ tests/
	docker-compose exec api isort app/ tests/

lint:
	@echo "Running linting..."
	docker-compose exec api flake8 app/ tests/
	docker-compose exec api mypy app/

# Cleanup
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f

clean-all:
	@echo "Cleaning everything including images..."
	docker-compose down -v --rmi all
	docker system prune -af

# Monitoring and debugging
status:
	@echo "Service status:"
	docker-compose ps

health:
	@echo "Health checks:"
	@echo "API: $$(curl -s http://localhost:8000/health || echo 'FAILED')"
	@echo "MinIO: $$(curl -s http://localhost:9000/minio/health/live || echo 'FAILED')"

# Production helpers
backup-db:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres guideline_transform > backup_$$(date +%Y%m%d_%H%M%S).sql

restore-db:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file path: " backup; \
	docker-compose exec -T postgres psql -U postgres guideline_transform < $$backup

# Development environment
dev-setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	@echo "Please edit .env with your settings, then run 'make up'"

dev-reset:
	@echo "Resetting development environment..."
	make clean
	make up
	sleep 10
	make migrate
	make seed 