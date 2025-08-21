# path: app/config/imagehost.py
# ImageHost 설정 파일
import os
from typing import Optional

class ImageHostSettings:
    """ImageHost 설정"""
    
    def __init__(self):
        # Cloudflare R2 설정
        self.CLOUDFLARE_R2_ACCESS_KEY_ID = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
        self.CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
        self.CLOUDFLARE_R2_BUCKET_NAME = os.getenv("CLOUDFLARE_R2_BUCKET_NAME", "project-scraper-images")
        self.CLOUDFLARE_R2_ACCOUNT_ID = os.getenv("CLOUDFLARE_R2_ACCOUNT_ID", "")
        self.CLOUDFLARE_R2_REGION = os.getenv("CLOUDFLARE_R2_REGION", "auto")
        
        # CDN 설정
        self.CDN_DOMAIN = os.getenv("CDN_DOMAIN", "your-cdn-domain.com")
        self.CDN_PROVIDER = os.getenv("CDN_PROVIDER", "cloudflare")
        
        # 이미지 최적화 설정
        self.IMAGE_AUTO_CONVERT_WEBP = os.getenv("IMAGE_AUTO_CONVERT_WEBP", "true").lower() == "true"
        self.IMAGE_DEFAULT_QUALITY = int(os.getenv("IMAGE_DEFAULT_QUALITY", "85"))
        self.IMAGE_MAX_WIDTH = int(os.getenv("IMAGE_MAX_WIDTH", "1920")) if os.getenv("IMAGE_MAX_WIDTH") else None
        self.IMAGE_MAX_HEIGHT = int(os.getenv("IMAGE_MAX_HEIGHT", "1080")) if os.getenv("IMAGE_MAX_HEIGHT") else None
        self.IMAGE_GENERATE_THUMBNAILS = os.getenv("IMAGE_GENERATE_THUMBNAILS", "true").lower() == "true"
        self.IMAGE_THUMBNAIL_SIZES = os.getenv("IMAGE_THUMBNAIL_SIZES", "150x150,300x300,600x600")
        
        # 할당량 설정
        self.STORAGE_LIMIT_GB = float(os.getenv("STORAGE_LIMIT_GB", "100.0"))
        self.FILE_COUNT_LIMIT = int(os.getenv("FILE_COUNT_LIMIT", "10000"))
        self.MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
        self.MAX_FILES_PER_UPLOAD = int(os.getenv("MAX_FILES_PER_UPLOAD", "100"))
        
        # 보안 설정
        self.ALLOWED_IMAGE_TYPES = os.getenv("ALLOWED_IMAGE_TYPES", "jpeg,jpg,png,webp,gif,avif")
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
        
        # 로깅 설정
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
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
