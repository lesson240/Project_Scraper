# 이미지 업로드 API
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import logging

from ..services.storage_service import CloudflareR2Service
from ..services.image_processor import ImageProcessor
from ..models.storage_model import StorageConfig, ImageOptimizationConfig
from ..models.image_model import ImageMetadata

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/imagehost", tags=["ImageHost"])

# 의존성 주입을 위한 설정 (실제로는 환경변수나 설정 파일에서 로드)
def get_storage_config() -> StorageConfig:
    """스토리지 설정 반환"""
    return StorageConfig(
        provider="cloudflare_r2",
        bucket_name="project-scraper-images",
        region="auto",
        access_key_id="your_access_key_id",
        secret_access_key="your_secret_access_key",
        endpoint_url="https://your_account_id.r2.cloudflarestorage.com"
    )

def get_optimization_config() -> ImageOptimizationConfig:
    """이미지 최적화 설정 반환"""
    return ImageOptimizationConfig(
        auto_convert_to_webp=True,
        default_quality=85,
        max_width=1920,
        max_height=1080,
        generate_thumbnails=True,
        thumbnail_sizes=[(150, 150), (300, 300), (600, 600)]
    )

@router.post("/upload", response_class=JSONResponse)
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = None,
    origin_goods_code: str = None,
    tags: List[str] = [],
    category: str = None,
    storage_config: StorageConfig = Depends(get_storage_config),
    optimization_config: ImageOptimizationConfig = Depends(get_optimization_config)
):
    """단일 이미지 업로드"""
    try:
        # 스토리지 서비스 초기화
        storage_service = CloudflareR2Service(storage_config)
        
        # 이미지 프로세서 초기화
        image_processor = ImageProcessor(optimization_config)
        
        # 메타데이터 준비
        metadata = {
            'user_id': user_id,
            'origin_goods_code': origin_goods_code,
            'tags': ','.join(tags) if tags else '',
            'category': category or 'general'
        }
        
        # 이미지 업로드
        image_metadata = await storage_service.upload_file(file, metadata)
        
        # 추가 메타데이터 설정
        image_metadata.user_id = user_id
        image_metadata.origin_goods_code = origin_goods_code
        image_metadata.tags = tags
        image_metadata.category = category
        
        # 이미지 최적화 (비동기로 처리 가능)
        try:
            file_content = await file.read()
            optimized_info = await image_processor.process_image(file_content, file.content_type)
            
            # 최적화된 정보를 메타데이터에 추가
            image_metadata.width = optimized_info.get('width')
            image_metadata.height = optimized_info.get('height')
            image_metadata.is_optimized = optimized_info.get('is_optimized', False)
            image_metadata.optimization_level = 8  # 기본 최적화 레벨
            
        except Exception as e:
            logger.warning(f"이미지 최적화 실패: {str(e)}")
            # 최적화 실패해도 업로드는 성공
        
        logger.info(f"이미지 업로드 성공: {file.filename} -> {image_metadata.id}")
        
        return {
            "success": True,
            "message": "이미지가 성공적으로 업로드되었습니다",
            "data": image_metadata.dict()
        }
        
    except Exception as e:
        logger.error(f"이미지 업로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"이미지 업로드 실패: {str(e)}")

@router.post("/upload/batch", response_class=JSONResponse)
async def upload_images_batch(
    files: List[UploadFile] = File(...),
    user_id: str = None,
    origin_goods_code: str = None,
    tags: List[str] = [],
    category: str = None,
    storage_config: StorageConfig = Depends(get_storage_config),
    optimization_config: ImageOptimizationConfig = Depends(get_optimization_config)
):
    """배치 이미지 업로드"""
    try:
        if len(files) > 100:  # 최대 100개 파일 제한
            raise HTTPException(status_code=400, detail="최대 100개 파일까지 업로드 가능합니다")
        
        # 스토리지 서비스 초기화
        storage_service = CloudflareR2Service(storage_config)
        
        # 이미지 프로세서 초기화
        image_processor = ImageProcessor(optimization_config)
        
        uploaded_images = []
        failed_uploads = []
        
        for file in files:
            try:
                # 메타데이터 준비
                metadata = {
                    'user_id': user_id,
                    'origin_goods_code': origin_goods_code,
                    'tags': ','.join(tags) if tags else '',
                    'category': category or 'general'
                }
                
                # 이미지 업로드
                image_metadata = await storage_service.upload_file(file, metadata)
                
                # 추가 메타데이터 설정
                image_metadata.user_id = user_id
                image_metadata.origin_goods_code = origin_goods_code
                image_metadata.tags = tags
                image_metadata.category = category
                
                uploaded_images.append(image_metadata.dict())
                
            except Exception as e:
                logger.error(f"파일 업로드 실패: {file.filename} - {str(e)}")
                failed_uploads.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        success_count = len(uploaded_images)
        failed_count = len(failed_uploads)
        
        logger.info(f"배치 업로드 완료: 성공 {success_count}개, 실패 {failed_count}개")
        
        return {
            "success": True,
            "message": f"배치 업로드 완료: 성공 {success_count}개, 실패 {failed_count}개",
            "data": {
                "uploaded_images": uploaded_images,
                "failed_uploads": failed_uploads,
                "summary": {
                    "total_files": len(files),
                    "success_count": success_count,
                    "failed_count": failed_count
                }
            }
        }
        
    except Exception as e:
        logger.error(f"배치 업로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"배치 업로드 실패: {str(e)}")

@router.post("/upload/from-base64", response_class=JSONResponse)
async def upload_from_base64(
    base64_data: str,
    filename: str,
    content_type: str = "image/jpeg",
    user_id: str = None,
    origin_goods_code: str = None,
    tags: List[str] = [],
    category: str = None,
    storage_config: StorageConfig = Depends(get_storage_config),
    optimization_config: ImageOptimizationConfig = Depends(get_optimization_config)
):
    """Base64 이미지 업로드"""
    try:
        import base64
        from io import BytesIO
        
        # Base64 디코딩
        try:
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            image_data = base64.b64decode(base64_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail="잘못된 Base64 데이터입니다")
        
        # BytesIO 객체 생성
        file_obj = BytesIO(image_data)
        
        # UploadFile 객체 생성
        from fastapi import UploadFile
        file = UploadFile(
            filename=filename,
            file=file_obj,
            content_type=content_type
        )
        
        # 기존 업로드 로직 재사용
        return await upload_image(
            file=file,
            user_id=user_id,
            origin_goods_code=origin_goods_code,
            tags=tags,
            category=category,
            storage_config=storage_config,
            optimization_config=optimization_config
        )
        
    except Exception as e:
        logger.error(f"Base64 업로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Base64 업로드 실패: {str(e)}")

@router.get("/health", response_class=JSONResponse)
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "ImageHost",
        "timestamp": "2024-01-15T10:30:00Z"
    }
