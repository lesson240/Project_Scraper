# Cloudflare R2 스토리지 서비스
import boto3
import hashlib
import uuid
import os
from typing import Optional, Dict, Any, BinaryIO
import mimetypes
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, UploadFile
import logging

from ..models.storage_model import StorageConfig, StorageProvider
from ..models.image_model import ImageMetadata, ImageFormat, ImageStatus

logger = logging.getLogger(__name__)

class CloudflareR2Service:
    """Cloudflare R2 스토리지 서비스"""
    
    def __init__(self, config: StorageConfig):
        """서비스 초기화"""
        if config.provider != StorageProvider.CLOUDFLARE_R2:
            raise ValueError("이 서비스는 Cloudflare R2 전용입니다.")
        
        self.config = config
        self.client = self._create_client()
        self.bucket_name = config.bucket_name
        
    def _create_client(self):
        """boto3 클라이언트 생성"""
        try:
            # 테스트 모드에서는 None 반환
            # 자격증명 미설정 시 에러로 처리하여 즉시 알림
            if not self.config.access_key_id or not self.config.secret_access_key:
                logger.error("Cloudflare R2 자격증명이 설정되지 않았습니다")
                raise HTTPException(status_code=500, detail="Cloudflare R2 자격증명이 누락되었습니다")
                
            session = boto3.Session(
                aws_access_key_id=self.config.access_key_id,
                aws_secret_access_key=self.config.secret_access_key,
                region_name=self.config.region
            )
            
            client = session.client(
                's3',
                endpoint_url=self.config.endpoint_url or f"https://{os.getenv('CLOUDFLARE_R2_ACCOUNT_ID','')}.r2.cloudflarestorage.com",
                aws_access_key_id=self.config.access_key_id,
                aws_secret_access_key=self.config.secret_access_key,
                config=boto3.session.Config(
                    max_pool_connections=self.config.max_connections,
                    retries={'max_attempts': self.config.retry_attempts}
                )
            )
            
            return client
            
        except Exception as e:
            logger.error(f"Cloudflare R2 클라이언트 생성 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="스토리지 서비스 초기화 실패")
    
    async def upload_image(self, content: bytes, filename: str, content_type: Optional[str] = None) -> str:
        """바이트 데이터를 Cloudflare R2에 업로드 (로컬 백업 제거)"""
        try:
            if self.client is None:
                raise HTTPException(status_code=500, detail="Cloudflare R2 클라이언트가 초기화되지 않았습니다")
            
            # Content-Type 유추
            guessed_type, _ = mimetypes.guess_type(filename)
            ct = content_type or guessed_type or 'application/octet-stream'

            # Cloudflare R2에 업로드 (강한 캐시로 중복 네트워크 최소화)
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=content,
                ContentType=ct,
                CacheControl="public, max-age=31536000, immutable"
            )
            
            # Cloudflare R2 공개 URL 생성 (환경변수 우선)
            public_base = os.getenv('CLOUDFLARE_R2_PUBLIC_URL') or os.getenv('CLOUDFLARE_R2_PUBLIC_BASE_URL')
            if public_base:
                cloudflare_url = f"{public_base.rstrip('/')}/{filename}"
            else:
                account_id = os.getenv('CLOUDFLARE_R2_ACCOUNT_ID', '')
                # 퍼블릭 버킷이 아닌 경우에는 이 URL이 공개 접근이 되지 않을 수 있음
                cloudflare_url = f"https://{account_id}.r2.cloudflarestorage.com/{self.bucket_name}/{filename}"
            
            logger.info(f"Cloudflare R2 업로드 성공: {filename} -> {cloudflare_url}")
            return cloudflare_url
            
        except Exception as e:
            logger.error(f"Cloudflare R2 업로드 실패: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Cloudflare R2 업로드 실패: {str(e)}")

    async def upload_file(self, file: UploadFile, metadata: Dict[str, Any] = None) -> ImageMetadata:
        """파일 업로드 (로컬 백업 제거)"""
        try:
            # 파일 검증
            self._validate_file(file)
            
            # 고유 파일명 생성
            file_id = str(uuid.uuid4())
            file_extension = self._get_file_extension(file.filename)
            cloudflare_id = f"{file_id}.{file_extension}"
            
            # 파일 내용 읽기
            content = await file.read()
            file_size = len(content)
            
            # 체크섬 계산
            checksum = hashlib.md5(content).hexdigest()

            if self.client is None:
                logger.error("Cloudflare R2 클라이언트가 초기화되지 않았습니다")
                raise HTTPException(status_code=500, detail="Cloudflare R2 클라이언트가 초기화되지 않았습니다")

            # 실제 Cloudflare R2 업로드 (강한 캐시로 중복 네트워크 최소화)
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=cloudflare_id,
                Body=content,
                ContentType=file.content_type,
                CacheControl="public, max-age=31536000, immutable",
                Metadata={
                    'original_filename': file.filename,
                    'uploaded_at': datetime.utcnow().isoformat(),
                    'checksum': checksum,
                    **(metadata or {})
                }
            )
            
            # 이미지 메타데이터 생성
            image_metadata = ImageMetadata(
                id=file_id,
                filename=file.filename,
                cloudflare_id=cloudflare_id,
                url=(
                    (
                        (os.getenv('CLOUDFLARE_R2_PUBLIC_URL') or os.getenv('CLOUDFLARE_R2_PUBLIC_BASE_URL')).rstrip('/')
                        + f"/{cloudflare_id}"
                    ) if (os.getenv('CLOUDFLARE_R2_PUBLIC_URL') or os.getenv('CLOUDFLARE_R2_PUBLIC_BASE_URL'))
                    else f"https://{os.getenv('CLOUDFLARE_R2_ACCOUNT_ID','')}.r2.cloudflarestorage.com/{self.bucket_name}/{cloudflare_id}"
                ),
                size=file_size,
                format=self._detect_image_format(file.content_type),
                content_type=file.content_type,
                checksum=checksum,
                status=ImageStatus.ACTIVE,
                uploaded_at=datetime.utcnow()
            )
            
            logger.info(f"파일 업로드 성공: {file.filename} -> {cloudflare_id}")
            return image_metadata
            
        except ClientError as e:
            logger.error(f"Cloudflare R2 업로드 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 업로드 실패")
        except Exception as e:
            logger.error(f"파일 업로드 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 업로드 중 오류 발생")
    
    async def download_file(self, cloudflare_id: str) -> bytes:
        """파일 다운로드"""
        try:
            response = self.client.get_object(
                Bucket=self.bucket_name,
                Key=cloudflare_id
            )
            return response['Body'].read()
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
            logger.error(f"파일 다운로드 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 다운로드 실패")
    
    async def delete_file(self, cloudflare_id: str) -> bool:
        """파일 삭제"""
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=cloudflare_id
            )
            logger.info(f"파일 삭제 성공: {cloudflare_id}")
            return True
            
        except ClientError as e:
            logger.error(f"파일 삭제 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 삭제 실패")
    
    async def update_file_metadata(self, cloudflare_id: str, metadata: Dict[str, Any]) -> bool:
        """파일 메타데이터 업데이트"""
        try:
            # 기존 객체 복사하여 메타데이터 업데이트
            copy_source = {'Bucket': self.bucket_name, 'Key': cloudflare_id}
            
            self.client.copy_object(
                Bucket=self.bucket_name,
                Key=cloudflare_id,
                CopySource=copy_source,
                Metadata=metadata,
                MetadataDirective='REPLACE'
            )
            
            logger.info(f"메타데이터 업데이트 성공: {cloudflare_id}")
            return True
            
        except ClientError as e:
            logger.error(f"메타데이터 업데이트 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="메타데이터 업데이트 실패")
    
    async def get_file_info(self, cloudflare_id: str) -> Dict[str, Any]:
        """파일 정보 조회"""
        try:
            response = self.client.head_object(
                Bucket=self.bucket_name,
                Key=cloudflare_id
            )
            
            return {
                'size': response['ContentLength'],
                'content_type': response['ContentType'],
                'last_modified': response['LastModified'],
                'metadata': response.get('Metadata', {}),
                'etag': response['ETag']
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
            logger.error(f"파일 정보 조회 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 정보 조회 실패")
    
    async def list_files(self, prefix: str = "", max_keys: int = 1000) -> list[Dict[str, Any]]:
        """파일 목록 조회"""
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'],
                    'etag': obj['ETag']
                })
            
            return files
            
        except ClientError as e:
            logger.error(f"파일 목록 조회 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="파일 목록 조회 실패")
    
    async def get_storage_stats(self) -> Dict[str, Any]:
        """스토리지 통계 조회"""
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket_name)
            
            total_size = sum(obj['Size'] for obj in response.get('Contents', []))
            file_count = len(response.get('Contents', []))
            
            return {
                'total_size_bytes': total_size,
                'total_size_gb': total_size / (1024**3),
                'file_count': file_count,
                'bucket_name': self.bucket_name,
                'region': self.config.region
            }
            
        except ClientError as e:
            logger.error(f"스토리지 통계 조회 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="스토리지 통계 조회 실패")
    
    def _validate_file(self, file: UploadFile):
        """파일 검증"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다")
        
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다")
        
        # 파일 크기 제한 (기본 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if hasattr(file, 'size') and file.size > max_size:
            raise HTTPException(status_code=400, detail="파일 크기가 너무 큽니다 (최대 50MB)")
    
    def _get_file_extension(self, filename: str) -> str:
        """파일 확장자 추출"""
        if '.' in filename:
            return filename.split('.')[-1].lower()
        return 'jpg'  # 기본값
    
    def _detect_image_format(self, content_type: str) -> ImageFormat:
        """이미지 포맷 감지"""
        content_type_lower = content_type.lower()
        
        if 'jpeg' in content_type_lower or 'jpg' in content_type_lower:
            return ImageFormat.JPEG
        elif 'png' in content_type_lower:
            return ImageFormat.PNG
        elif 'webp' in content_type_lower:
            return ImageFormat.WEBP
        elif 'gif' in content_type_lower:
            return ImageFormat.GIF
        elif 'avif' in content_type_lower:
            return ImageFormat.AVIF
        else:
            return ImageFormat.JPEG  # 기본값
