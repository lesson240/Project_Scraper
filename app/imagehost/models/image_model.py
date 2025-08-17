# 이미지 메타데이터 모델
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class ImageFormat(str, Enum):
    """이미지 포맷 열거형"""
    JPEG = "jpeg"
    PNG = "png"
    WEBP = "webp"
    GIF = "gif"
    AVIF = "avif"

class ImageStatus(str, Enum):
    """이미지 상태 열거형"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"
    PROCESSING = "processing"

class ImageMetadata(BaseModel):
    """이미지 메타데이터 모델"""
    id: str = Field(..., description="고유 이미지 ID")
    filename: str = Field(..., description="원본 파일명")
    cloudflare_id: str = Field(..., description="Cloudflare R2 파일 ID")
    url: str = Field(..., description="이미지 접근 URL")
    
    # 파일 정보
    size: int = Field(..., description="파일 크기 (bytes)")
    format: ImageFormat = Field(..., description="이미지 포맷")
    width: Optional[int] = Field(None, description="이미지 너비")
    height: Optional[int] = Field(None, description="이미지 높이")
    
    # 메타데이터
    content_type: str = Field(..., description="MIME 타입")
    checksum: str = Field(..., description="파일 체크섬 (MD5)")
    
    # 상태 및 생명주기
    status: ImageStatus = Field(default=ImageStatus.ACTIVE, description="이미지 상태")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, description="업로드 시간")
    last_accessed: Optional[datetime] = Field(None, description="마지막 접근 시간")
    
    # 사용자 정보
    user_id: Optional[str] = Field(None, description="업로드한 사용자 ID")
    origin_goods_code: Optional[str] = Field(None, description="연관된 상품 코드")
    
    # 태그 및 분류
    tags: List[str] = Field(default=[], description="이미지 태그")
    category: Optional[str] = Field(None, description="이미지 카테고리")
    
    # 최적화 정보
    is_optimized: bool = Field(default=False, description="최적화 여부")
    optimization_level: Optional[int] = Field(None, description="최적화 레벨 (1-10)")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ImageStorage(BaseModel):
    """이미지 스토리지 정보 모델"""
    total_size: int = Field(default=0, description="총 스토리지 사용량 (bytes)")
    file_count: int = Field(default=0, description="총 파일 수")
    storage_tier: str = Field(default="standard", description="스토리지 티어")
    region: str = Field(default="auto", description="스토리지 리전")
    
    # 할당량 정보
    quota_limit: Optional[int] = Field(None, description="할당량 제한 (bytes)")
    quota_used: int = Field(default=0, description="사용된 할당량 (bytes)")
    
    # 비용 정보
    cost_per_gb: float = Field(default=0.015, description="GB당 비용 (USD)")
    monthly_cost: float = Field(default=0.0, description="월 비용 (USD)")

class ImageLifecycle(BaseModel):
    """이미지 생명주기 관리 모델"""
    retention_days: int = Field(default=365, description="보관 기간 (일)")
    auto_archive: bool = Field(default=True, description="자동 아카이브 여부")
    auto_delete: bool = Field(default=False, description="자동 삭제 여부")
    
    # 아카이브 정책
    archive_after_days: int = Field(default=90, description="아카이브 전환 기간 (일)")
    archive_tier: str = Field(default="infrequent", description="아카이브 스토리지 티어")
    
    # 삭제 정책
    delete_after_days: Optional[int] = Field(None, description="삭제 기간 (일)")
    soft_delete: bool = Field(default=True, description="소프트 삭제 여부")
