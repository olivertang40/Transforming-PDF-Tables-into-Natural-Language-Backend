# GuidelineTransform AI - PDF表格提取与处理系统

一个基于AI的PDF表格提取和自然语言转换系统，将PDF中的表格数据转换为结构化JSON Schema，并生成自然语言描述。

## 🚀 快速开始

### 环境要求

- Python 3.8+
- PostgreSQL 15+ (生产环境)
- Redis (用于Celery任务队列)
- MinIO/AWS S3 (文件存储)

### 安装依赖

```bash
# 安装Python依赖
pip install -r requirements.txt

# 如果遇到NumPy兼容性问题，可能需要降级
pip install "numpy<2.0"
```

### 核心依赖包

```txt
# Web框架
fastapi>=0.104.0
uvicorn[standard]>=0.24.0

# 数据库
sqlalchemy>=2.0.0
asyncpg>=0.29.0
alembic>=1.12.0

# PDF处理
pdfplumber>=0.10.0
camelot-py[base]>=0.10.1
PyPDF2>=3.0.0

# 数据处理
pandas>=2.0.0
numpy<2.0  # 兼容性要求
pillow>=10.0.0

# 任务队列
celery>=5.3.0
redis>=5.0.0

# 存储
boto3>=1.29.0
minio>=7.2.0

# 数据验证
pydantic>=2.5.0
jsonschema>=4.20.0

# 日志
structlog>=23.2.0

# AI/LLM (可选)
openai>=1.3.0
```

## 📋 系统架构

### 核心Pipeline

```
PDF上传 → 文件存储(S3/MinIO) → 异步表格检测 → JSON Schema生成 
    ↓
数据库存储(PostgreSQL) → AI草稿生成 → 人工编辑 → QA审核 → 导出
```

### 主要组件

1. **PDF检测服务** (`app/services/pdf_detect.py`)
   - 使用pdfplumber + camelot进行表格检测
   - 生成统一JSON Schema格式
   - 支持多种检测策略

2. **存储服务** (`app/services/storage_s3.py`)
   - S3/MinIO文件存储
   - 多租户文件组织
   - 预签名URL生成

3. **Schema验证** (`app/services/schema_normalize.py`)
   - JSON Schema验证和标准化
   - 数据质量检查
   - 错误修复机制

4. **异步任务** (`app/workers/`)
   - Celery任务队列
   - PDF解析任务 (`tasks_parse.py`)
   - AI草稿生成 (`tasks_draft.py`)

5. **数据库模型** (`app/db/models/`)
   - 多租户数据隔离
   - 完整的表格生命周期管理
   - JSONB存储优化

## 🧪 测试PDF表格提取

### 使用测试脚本

我们提供了一个简单的测试脚本来验证PDF表格提取功能：

```bash
# 使用默认测试文件
python test_pdf_extraction.py

# 指定PDF文件
python test_pdf_extraction.py "path/to/your.pdf"

# 测试项目中的示例文件
python test_pdf_extraction.py "../测试文件/BP Draft Price Sheet.pdf"
python test_pdf_extraction.py "../测试文件1.pdf"
```

### 输出文件

- `{filename}_schema.json` - 完整JSON Schema (包含所有单元格数据)
- `{filename}_summary.json` - 简化摘要 (统计信息和样本数据)

### 测试输出示例

```
🔍 PDF表格提取测试工具
📄 目标文件: ../测试文件1.pdf
==================================================
🚀 开始处理PDF文件: 测试文件1.pdf
📁 文件大小: 945,452 bytes

🎉 提取成功!
📊 统计信息:
   - 总表格数: 11
   - 处理页数: 4
   - 总单元格: 613
   - 平均置信度: 0.633
   - 检测器使用: plumber

📁 生成文件:
   - 测试文件1_schema.json (208,409 bytes) - 完整JSON Schema
   - 测试文件1_summary.json (5,379 bytes) - 摘要信息

📋 表格详情:
   表格 1: 第1页, 49行 × 5列, 置信度0.756, 检测器: plumber
   表格 2: 第2页, 28行 × 5列, 置信度0.786, 检测器: plumber
   ...
```

## 🗄️ 数据存储结构

### JSON Schema格式

每个提取的表格都符合统一的JSON Schema：

```json
{
  "doc_id": "文档UUID",
  "page": 1,
  "table_id": "表格UUID",
  "bbox": [x0, y0, x1, y1],
  "n_rows": 10,
  "n_cols": 5,
  "cells": [
    {
      "row": 0,
      "col": 0,
      "text": "单元格内容",
      "bbox": [x0, y0, x1, y1],
      "rowspan": 1,
      "colspan": 1,
      "is_header": true
    }
  ],
  "meta": {
    "detector": "plumber",
    "confidence": 0.85,
    "extraction_flavor": "lattice",
    "processing_time_ms": 150,
    "page_dimensions": {"width": 612, "height": 792},
    "table_area_ratio": 0.7,
    "ocr_used": false
  }
}
```

### 数据库存储

- **`parsed_tables`表**: 存储完整JSON Schema到`schema_json`字段(JSONB类型)
- **`pdf_files`表**: PDF文件元数据和状态
- **`tasks`表**: 每个表格对应的处理任务
- **`ai_drafts`表**: AI生成的自然语言草稿

## 🔧 开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd GrandScale\ 后端/backend
```

### 2. 安装依赖

```bash
# 创建虚拟环境 (推荐)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

### 3. 环境配置

创建`.env`文件：

```bash
# 数据库配置
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/guideline_transform
DATABASE_URL_SYNC=postgresql://user:pass@localhost/guideline_transform

# Redis配置
REDIS_URL=redis://localhost:6379/0

# S3/MinIO配置
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=guideline-transform
S3_USE_SSL=false

# AI配置 (可选)
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4

# 应用配置
DEBUG=true
LOG_LEVEL=DEBUG
```

### 4. 数据库初始化

```bash
# 运行数据库迁移
alembic upgrade head

# 可选：运行种子数据
python -m app.db.seed
```

### 5. 启动服务

```bash
# 启动API服务器
uvicorn app.main:app --reload --port 8000

# 启动Celery Worker (新终端)
celery -A app.workers.celery_app worker --loglevel=info

# 启动Celery Beat (可选，用于定时任务)
celery -A app.workers.celery_app beat --loglevel=info
```

## 📡 API端点

### 核心API

```bash
# 上传PDF文件
POST /api/v1/files/upload

# 获取文件解析状态
GET /api/v1/files/{file_id}/parse-status

# 获取文件的所有表格
GET /api/v1/files/{file_id}/tables

# 获取特定表格详情
GET /api/v1/files/{file_id}/tables/{table_id}

# 生成AI草稿
POST /api/v1/tasks/{task_id}/draft

# 重试草稿生成
POST /api/v1/tasks/{task_id}/retry-draft

# 导出处理结果
POST /api/v1/export
```

### 健康检查

```bash
# 系统健康检查
GET /health

# 服务状态检查
GET /api/v1/status
```

## 🧩 扩展功能

### 支持的检测器

1. **pdfplumber** (主要)
   - 适用于矢量PDF
   - 高精度表格检测
   - 快速处理

2. **camelot** (备选)
   - lattice和stream两种模式
   - 复杂表格处理
   - 置信度评分

3. **OCR** (规划中)
   - 扫描PDF支持
   - 深度学习模型
   - 图像表格识别

### AI集成

- OpenAI GPT-4支持
- 自定义Prompt模板
- 成本控制和监控
- 批量处理优化

## 🔍 故障排除

### 常见问题

1. **NumPy兼容性错误**
   ```bash
   pip install "numpy<2.0"
   ```

2. **PDF处理失败**
   - 检查PDF文件完整性
   - 确认文件权限
   - 查看日志详细错误信息

3. **数据库连接问题**
   - 确认PostgreSQL服务运行
   - 检查连接字符串配置
   - 验证用户权限

4. **Celery任务失败**
   - 检查Redis连接
   - 确认Worker进程运行
   - 查看任务队列状态

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看Celery日志
tail -f logs/celery.log

# 查看数据库日志
tail -f logs/db.log
```

## 📈 性能优化

### 推荐配置

- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: SSD推荐
- **网络**: 稳定的互联网连接(AI功能)

### 扩展建议

- 使用Redis Cluster进行任务队列扩展
- PostgreSQL读写分离
- MinIO分布式存储
- Kubernetes部署支持

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**注意**: 本系统仍在开发中，API可能会发生变化。生产环境使用前请充分测试。 