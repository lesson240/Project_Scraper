# ImageHost 설정 파일
import os
from typing import Optional
from pydantic import BaseSettings

class ImageHostSettings(BaseSettings):
    """ImageHost 설정"""
    
    # Cloudflare R2 설정
    CLOUDFLARE_R2_ACCESS_KEY_ID: str = ""
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str = ""
    CLOUDFLARE_R2_BUCKET_NAME: str = "project-scraper-images"
    CLOUDFLARE_R2_ACCOUNT_ID: str = ""
    CLOUDFLARE_R2_REGION: str = "auto"
    
    # CDN 설정
    CDN_DOMAIN: str = "your-cdn-domain.com"
    CDN_PROVIDER: str = "cloudflare"
    
    # 이미지 최적화 설정
    IMAGE_AUTO_CONVERT_WEBP: bool = True
    IMAGE_DEFAULT_QUALITY: int = 85
    IMAGE_MAX_WIDTH: Optional[int] = 1920
    IMAGE_MAX_HEIGHT: Optional[int] = 1080
    IMAGE_GENERATE_THUMBNAILS: bool = True
    IMAGE_THUMBNAIL_SIZES: str = "150x150,300x300,600x600"
    
    # 할당량 설정
    STORAGE_LIMIT_GB: float = 100.0
    FILE_COUNT_LIMIT: int = 10000
    MAX_FILE_SIZE_MB: int = 50
    MAX_FILES_PER_UPLOAD: int = 100
    
    # 보안 설정
    ALLOWED_IMAGE_TYPES: str = "jpeg,jpg,png,webp,gif,avif"
    CORS_ORIGINS: str = "*"
    
    # 로깅 설정
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def cloudflare_r2_endpoint_url(self) -> str:
        """Cloudflare R2 엔드포인트 URL 생성"""
        if self.CLOUDFLARE_R2_ACCOUNT_ID:
            return f"https://{self.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        return ""
    
    @property
    def thumbnail_sizes(self) -> list[tuple[int, int]]:
        """썸네일 크기 목록 파싱"""
        sizes = []
        for size_str in self.IMAGE_THUMBNAIL_SIZES.split(','):
            try:
                width, height = map(int, size_str.strip().split('x'))
                sizes.append((width, height))
            except ValueError:
                continue
        return sizes or [(150, 150), (300, 300), (600, 600)]
    
    @property
    def allowed_image_types(self) -> list[str]:
        """허용된 이미지 타입 목록"""
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(',')]
    
    @property
    def cors_origins(self) -> list[str]:
        """CORS 허용 오리진 목록"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]

# 전역 설정 인스턴스
imagehost_settings = ImageHostSettings()

# 환경변수에서 설정 로드
def load_imagehost_config() -> ImageHostSettings:
    """ImageHost 설정 로드"""
    return imagehost_settings

# 설정 검증
def validate_imagehost_config() -> bool:
    """ImageHost 설정 검증"""
    required_fields = [
        'CLOUDFLARE_R2_ACCESS_KEY_ID',
        'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
        'CLOUDFLARE_R2_BUCKET_NAME',
        'CLOUDFLARE_R2_ACCOUNT_ID'
    ]
    
    missing_fields = []
    for field in required_fields:
        if not getattr(imagehost_settings, field):
            missing_fields.append(field)
    
    if missing_fields:
        print(f"ImageHost 설정 누락: {', '.join(missing_fields)}")
        print("환경변수 또는 .env 파일에 설정을 추가해주세요.")
        return False
    
    return True
