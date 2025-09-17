"""
S3/MinIO storage service for file management.
Handles file upload, download, and management with multi-tenant organization.
"""

import asyncio
import io
from typing import Optional, Dict, Any, List
from urllib.parse import unquote

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config

from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class S3StorageService:
    """Service for S3/MinIO file storage operations."""
    
    def __init__(self):
        self.bucket_name = settings.S3_BUCKET
        self.client = self._create_client()
        self.initialized = False
    
    def _create_client(self):
        """Create S3/MinIO client with proper configuration."""
        try:
            config = Config(
                retries={'max_attempts': 3},
                signature_version='s3v4'
            )
            
            client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                config=config,
                use_ssl=settings.S3_USE_SSL
            )
            
            logger.info(
                "S3 client created",
                endpoint=settings.S3_ENDPOINT_URL,
                bucket=self.bucket_name,
                use_ssl=settings.S3_USE_SSL
            )
            
            return client
            
        except Exception as e:
            logger.error(f"Failed to create S3 client: {e}")
            return None
    
    async def initialize(self) -> bool:
        """Initialize storage service and ensure bucket exists."""
        if self.initialized:
            return True
        
        if not self.client:
            logger.error("S3 client not available")
            return False
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._ensure_bucket_exists)
            
            self.initialized = True
            logger.info(f"S3 storage service initialized with bucket: {self.bucket_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize S3 storage: {e}")
            return False
    
    def _ensure_bucket_exists(self):
        """Ensure the S3 bucket exists, create if it doesn't."""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
            logger.debug(f"Bucket {self.bucket_name} exists")
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            if error_code == '404':
                # Bucket doesn't exist, create it
                try:
                    self.client.create_bucket(Bucket=self.bucket_name)
                    logger.info(f"Created bucket: {self.bucket_name}")
                    
                    # Set bucket policy for public read if needed
                    # (Only for development with MinIO)
                    if "localhost" in settings.S3_ENDPOINT_URL or "minio" in settings.S3_ENDPOINT_URL:
                        self._set_public_read_policy()
                        
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket {self.bucket_name}: {create_error}")
                    raise
            else:
                logger.error(f"Error checking bucket {self.bucket_name}: {e}")
                raise
    
    def _set_public_read_policy(self):
        """Set public read policy for development bucket."""
        try:
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{self.bucket_name}/*"
                    }
                ]
            }
            
            import json
            self.client.put_bucket_policy(
                Bucket=self.bucket_name,
                Policy=json.dumps(policy)
            )
            logger.info(f"Set public read policy for bucket: {self.bucket_name}")
            
        except Exception as e:
            logger.warning(f"Failed to set bucket policy: {e}")
    
    async def upload_file(
        self,
        file_content: bytes,
        object_key: str,
        content_type: str = "application/octet-stream",
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Upload file to S3/MinIO.
        
        Args:
            file_content: File content as bytes
            object_key: S3 object key (path)
            content_type: MIME type of the file
            metadata: Optional metadata dictionary
            
        Returns:
            bool: True if upload successful, False otherwise
        """
        if not await self.initialize():
            return False
        
        try:
            # Prepare upload parameters
            upload_params = {
                'Bucket': self.bucket_name,
                'Key': object_key,
                'Body': file_content,
                'ContentType': content_type
            }
            
            if metadata:
                upload_params['Metadata'] = metadata
            
            # Upload in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.put_object(**upload_params)
            )
            
            logger.info(
                "File uploaded successfully",
                object_key=object_key,
                size_bytes=len(file_content),
                content_type=content_type
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload file {object_key}: {e}")
            return False
    
    async def download_file(self, object_key: str) -> Optional[bytes]:
        """
        Download file from S3/MinIO.
        
        Args:
            object_key: S3 object key (path)
            
        Returns:
            File content as bytes or None if failed
        """
        if not await self.initialize():
            return None
        
        try:
            # Download in thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.get_object(Bucket=self.bucket_name, Key=object_key)
            )
            
            file_content = response['Body'].read()
            
            logger.info(
                "File downloaded successfully",
                object_key=object_key,
                size_bytes=len(file_content)
            )
            
            return file_content
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                logger.warning(f"File not found: {object_key}")
            else:
                logger.error(f"Failed to download file {object_key}: {e}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to download file {object_key}: {e}")
            return None
    
    async def delete_file(self, object_key: str) -> bool:
        """
        Delete file from S3/MinIO.
        
        Args:
            object_key: S3 object key (path)
            
        Returns:
            bool: True if deletion successful, False otherwise
        """
        if not await self.initialize():
            return False
        
        try:
            # Delete in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.delete_object(Bucket=self.bucket_name, Key=object_key)
            )
            
            logger.info(f"File deleted successfully: {object_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete file {object_key}: {e}")
            return False
    
    async def file_exists(self, object_key: str) -> bool:
        """
        Check if file exists in S3/MinIO.
        
        Args:
            object_key: S3 object key (path)
            
        Returns:
            bool: True if file exists, False otherwise
        """
        if not await self.initialize():
            return False
        
        try:
            # Check in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.head_object(Bucket=self.bucket_name, Key=object_key)
            )
            
            return True
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                return False
            else:
                logger.error(f"Error checking file existence {object_key}: {e}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking file existence {object_key}: {e}")
            return False
    
    async def get_file_info(self, object_key: str) -> Optional[Dict[str, Any]]:
        """
        Get file information from S3/MinIO.
        
        Args:
            object_key: S3 object key (path)
            
        Returns:
            Dictionary with file information or None if not found
        """
        if not await self.initialize():
            return None
        
        try:
            # Get info in thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.head_object(Bucket=self.bucket_name, Key=object_key)
            )
            
            return {
                "size": response.get('ContentLength', 0),
                "content_type": response.get('ContentType', 'unknown'),
                "last_modified": response.get('LastModified'),
                "etag": response.get('ETag', '').strip('"'),
                "metadata": response.get('Metadata', {})
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                logger.debug(f"File not found: {object_key}")
            else:
                logger.error(f"Error getting file info {object_key}: {e}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting file info {object_key}: {e}")
            return None
    
    async def list_files(
        self,
        prefix: str = "",
        max_keys: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        List files in S3/MinIO bucket.
        
        Args:
            prefix: Object key prefix to filter results
            max_keys: Maximum number of keys to return
            
        Returns:
            List of file information dictionaries
        """
        if not await self.initialize():
            return []
        
        try:
            # List in thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    MaxKeys=max_keys
                )
            )
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    "key": obj['Key'],
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'],
                    "etag": obj['ETag'].strip('"')
                })
            
            logger.debug(f"Listed {len(files)} files with prefix: {prefix}")
            return files
            
        except Exception as e:
            logger.error(f"Failed to list files with prefix {prefix}: {e}")
            return []
    
    async def generate_presigned_url(
        self,
        object_key: str,
        expiration: int = 3600,
        method: str = "get_object"
    ) -> Optional[str]:
        """
        Generate presigned URL for S3/MinIO object.
        
        Args:
            object_key: S3 object key (path)
            expiration: URL expiration time in seconds
            method: S3 method (get_object, put_object, etc.)
            
        Returns:
            Presigned URL string or None if failed
        """
        if not await self.initialize():
            return None
        
        try:
            # Generate URL in thread pool
            loop = asyncio.get_event_loop()
            url = await loop.run_in_executor(
                None,
                lambda: self.client.generate_presigned_url(
                    method,
                    Params={'Bucket': self.bucket_name, 'Key': object_key},
                    ExpiresIn=expiration
                )
            )
            
            logger.debug(f"Generated presigned URL for {object_key}")
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for {object_key}: {e}")
            return None
    
    def generate_object_key(
        self,
        organization_id: str,
        project_id: str,
        file_type: str,
        filename: str
    ) -> str:
        """
        Generate standardized object key for multi-tenant storage.
        
        Args:
            organization_id: Organization UUID
            project_id: Project UUID
            file_type: Type of file (files, tables, exports, etc.)
            filename: Original filename
            
        Returns:
            Standardized S3 object key
        """
        # Sanitize filename
        safe_filename = filename.replace(" ", "_").replace("/", "_")
        
        # Create hierarchical path
        object_key = f"{organization_id}/{project_id}/{file_type}/{safe_filename}"
        
        return object_key
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on storage service.
        
        Returns:
            Health check results
        """
        health = {
            "service": "s3_storage",
            "status": "healthy",
            "bucket": self.bucket_name,
            "endpoint": settings.S3_ENDPOINT_URL,
            "initialized": self.initialized
        }
        
        try:
            if await self.initialize():
                # Try to list objects as a connectivity test
                await self.list_files(max_keys=1)
                health["connectivity"] = "ok"
            else:
                health["status"] = "unhealthy"
                health["connectivity"] = "failed"
                
        except Exception as e:
            health["status"] = "unhealthy"
            health["error"] = str(e)
            health["connectivity"] = "failed"
        
        return health 