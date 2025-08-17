# 스토리지 설정 및 관리 모델
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum

class StorageProvider(str, Enum):
    """스토리지 제공자 열거형"""
    CLOUDFLARE_R2 = "cloudflare_r2"
    AWS_S3 = "aws_s3"
    GOOGLE_CLOUD_STORAGE = "gcs"
    AZURE_BLOB = "azure_blob"

class StorageTier(str, Enum):
    """스토리지 티어 열거형"""
    STANDARD = "standard"
    INFREQUENT_ACCESS = "infrequent_access"
    ARCHIVE = "archive"
    DEEP_ARCHIVE = "deep_archive"

class CDNProvider(str, Enum):
    """CDN 제공자 열거형"""
    CLOUDFLARE = "cloudflare"
    AWS_CLOUDFRONT = "aws_cloudfront"
    GOOGLE_CLOUD_CDN = "gcp_cdn"
    AZURE_CDN = "azure_cdn"

class StorageConfig(BaseModel):
    """스토리지 설정 모델"""
    provider: StorageProvider = Field(..., description="스토리지 제공자")
    bucket_name: str = Field(..., description="버킷/컨테이너 이름")
    region: str = Field(..., description="스토리지 리전")
    
    # 인증 정보
    access_key_id: str = Field(..., description="액세스 키 ID")
    secret_access_key: str = Field(..., description="시크릿 액세스 키")
    
    # 연결 설정
    endpoint_url: Optional[str] = Field(None, description="엔드포인트 URL")
    use_ssl: bool = Field(default=True, description="SSL 사용 여부")
    verify_ssl: bool = Field(default=True, description="SSL 인증서 검증 여부")
    
    # 성능 설정
    max_connections: int = Field(default=100, description="최대 연결 수")
    timeout: int = Field(default=30, description="타임아웃 (초)")
    retry_attempts: int = Field(default=3, description="재시도 횟수")
    
    # 보안 설정
    encryption: bool = Field(default=True, description="암호화 사용 여부")
    kms_key_id: Optional[str] = Field(None, description="KMS 키 ID")
    
    class Config:
        # 민감한 정보는 환경변수에서 로드
        env_prefix = "STORAGE_"

class CDNConfig(BaseModel):
    """CDN 설정 모델"""
    provider: CDNProvider = Field(..., description="CDN 제공자")
    domain: str = Field(..., description="CDN 도메인")
    
    # 캐싱 설정
    cache_control: str = Field(default="public, max-age=31536000", description="캐시 컨트롤 헤더")
    cache_headers: Dict[str, str] = Field(default={}, description="추가 캐시 헤더")
    
    # 보안 설정
    cors_origins: list[str] = Field(default=["*"], description="CORS 허용 오리진")
    security_headers: Dict[str, str] = Field(default={}, description="보안 헤더")
    
    # 성능 설정
    compression: bool = Field(default=True, description="압축 사용 여부")
    minify: bool = Field(default=False, description="코드 최소화 여부")
    
    class Config:
        env_prefix = "CDN_"

class ImageOptimizationConfig(BaseModel):
    """이미지 최적화 설정 모델"""
    # 포맷 변환
    auto_convert_to_webp: bool = Field(default=True, description="WebP 자동 변환")
    supported_formats: list[str] = Field(default=["jpeg", "png", "webp"], description="지원 포맷")
    
    # 품질 설정
    default_quality: int = Field(default=85, description="기본 품질 (1-100)")
    max_width: Optional[int] = Field(None, description="최대 너비")
    max_height: Optional[int] = Field(None, description="최대 높이")
    
    # 썸네일 생성
    generate_thumbnails: bool = Field(default=True, description="썸네일 자동 생성")
    thumbnail_sizes: list[tuple[int, int]] = Field(
        default=[(150, 150), (300, 300), (600, 600)], 
        description="썸네일 크기 목록"
    )
    
    # 메타데이터 처리
    preserve_exif: bool = Field(default=False, description="EXIF 데이터 보존")
    strip_metadata: bool = Field(default=True, description="메타데이터 제거")

class QuotaConfig(BaseModel):
    """할당량 설정 모델"""
    # 스토리지 할당량
    storage_limit_gb: float = Field(default=100.0, description="스토리지 제한 (GB)")
    file_count_limit: int = Field(default=10000, description="파일 수 제한")
    
    # 업로드 제한
    max_file_size_mb: int = Field(default=50, description="최대 파일 크기 (MB)")
    max_files_per_upload: int = Field(default=100, description="업로드당 최대 파일 수")
    
    # 대역폭 제한
    monthly_bandwidth_gb: Optional[float] = Field(None, description="월 대역폭 제한 (GB)")
    
    # 사용자별 제한
    per_user_storage_gb: Optional[float] = Field(None, description="사용자별 스토리지 제한 (GB)")
    per_user_file_count: Optional[int] = Field(None, description="사용자별 파일 수 제한")
    
    class Config:
        env_prefix = "QUOTA_"
