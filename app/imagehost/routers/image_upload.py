# 이미지 업로드 API
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import logging
import os
import uuid
import hashlib
from datetime import datetime

from ..services.storage_service import CloudflareR2Service
from ..services.image_processor import ImageProcessor
from ..models.storage_model import StorageConfig, ImageOptimizationConfig, StorageProvider
# 환경설정은 .env 또는 실제 환경변수에서 직접 로드
import os
from ..models.image_model import ImageMetadata

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/imagehost", tags=["ImageHost"])

# 의존성 주입을 위한 설정 (실제로는 환경변수나 설정 파일에서 로드)
def get_storage_config() -> StorageConfig:
    """스토리지 설정 반환 (환경변수 기반)"""
    access_key = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
    secret_key = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
    bucket = os.getenv("CLOUDFLARE_R2_BUCKET_NAME", "")
    region = os.getenv("CLOUDFLARE_R2_REGION", "auto")
    account_id = os.getenv("CLOUDFLARE_R2_ACCOUNT_ID", "")
    endpoint = os.getenv("CLOUDFLARE_R2_ENDPOINT_URL", "") or (
        f"https://{account_id}.r2.cloudflarestorage.com" if account_id else ""
    )

    return StorageConfig(
        provider=StorageProvider.CLOUDFLARE_R2,
        bucket_name=bucket,
        region=region,
        access_key_id=access_key,
        secret_access_key=secret_key,
        endpoint_url=endpoint or None
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
    user_id: str = Form(None),
    origin_goods_code: str = Form(None),
    tags: str = Form(None),  # JSON 문자열 또는 콤마 구분 문자열 허용
    category: str = Form(None),
    storage_config: StorageConfig = Depends(get_storage_config),
    optimization_config: ImageOptimizationConfig = Depends(get_optimization_config)
):
    """단일 이미지 업로드 (Cloudflare R2 사용)"""
    try:
        # 파일 검증
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다")
        
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다")
        
        # 파일 내용 읽기
        content = await file.read()
        file_size = len(content)
        
        # 파일 크기 제한 (50MB)
        max_size = 50 * 1024 * 1024
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="파일 크기가 너무 큽니다 (최대 50MB)")
        
        # 고유 파일명 생성 (실무적 규칙 적용)
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
        
        # 파일명 규칙: [상품코드]_[이미지타입]_[날짜]_[UUID].[확장자]
        current_date = datetime.now().strftime("%Y%m%d")
        
        # origin_goods_code가 있으면 상품코드 포함, 없으면 'unknown' 사용
        goods_code = (origin_goods_code or '').strip() or 'no-code'
        image_type = 'thumbnail' if 'thumbnail' in (category or '').lower() else 'image'
        
        # 의미있는 파일명 생성
        meaningful_filename = f"{goods_code}_{image_type}_{current_date}_{file_id[:8]}.{file_extension}"
        
        # 체크섬 계산
        checksum = hashlib.md5(content).hexdigest()
        
        try:
            # Cloudflare R2에 업로드
            r2_service = CloudflareR2Service(storage_config)
            cloudflare_url = await r2_service.upload_image(content, meaningful_filename)
            
            # 성공 시 Cloudflare R2 URL 반환
            image_url = cloudflare_url
            
        except Exception as r2_error:
            logger.error(f"Cloudflare R2 업로드 실패: {str(r2_error)}")
            raise HTTPException(status_code=500, detail=f"Cloudflare R2 업로드 실패: {str(r2_error)}")
        
        # 응답 데이터 생성
        image_metadata = {
            "id": file_id,
            "filename": meaningful_filename,
            "original_filename": file.filename,
            "cloudflare_id": meaningful_filename,
            "url": image_url,
            "size": file_size,
            "content_type": file.content_type,
            "checksum": checksum,
            "status": "active",
            "uploaded_at": datetime.now().isoformat(),
            "user_id": user_id,
            "origin_goods_code": origin_goods_code,
            "tags": tags,
            "category": category
        }
        
        logger.info(f"이미지 업로드 성공: {file.filename} -> {meaningful_filename}")
        
        return {
            "success": True,
            "message": "이미지가 성공적으로 업로드되었습니다",
            "data": image_metadata
        }
        
    except HTTPException:
        raise
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

@router.post("/test-upload", response_class=JSONResponse)
async def test_upload(file: UploadFile = File(...)):
    """간단한 업로드 테스트 (의존성 없이)"""
    try:
        # 파일 정보만 반환
        return {
            "success": True,
            "message": "테스트 업로드 성공",
            "data": {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": 0  # 실제 크기는 계산하지 않음
            }
        }
    except Exception as e:
        logger.error(f"테스트 업로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"테스트 업로드 실패: {str(e)}")

@router.get("/get-thumbnails/{goods_code}", response_class=JSONResponse)
async def get_thumbnails(goods_code: str):
    """상품 코드별 썸네일 메타데이터 조회 (MongoDB)"""
    try:
        from app.services.service_mongodb import mongodb_service
        from app.imagehost.models.thumbnail_odmantic import ThumbnailMetadata

        engine = mongodb_service.engine
        docs = await engine.find(ThumbnailMetadata, ThumbnailMetadata.origin_goods_code == goods_code)
        doc = None
        if docs:
            doc = max(docs, key=lambda d: d.saved_at or datetime.min)
        if not doc:
            return {"success": True, "data": None, "message": "썸네일 메타데이터가 없습니다"}
        return {"success": True, "data": {
            "origin_goods_code": doc.origin_goods_code,
            "thumbnail_images": doc.thumbnail_images,
            "user_id": doc.user_id,
            "tags": doc.tags,
            "category": doc.category,
            "saved_at": doc.saved_at.isoformat()
        }}
    except Exception as e:
        logger.error(f"썸네일 메타데이터 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"썸네일 메타데이터 조회 실패: {str(e)}")

@router.post("/save-thumbnail", response_class=JSONResponse)
async def save_thumbnail(
    origin_goods_code: str = Form(...),
    thumbnail_images: str = Form(...),  # JSON 문자열로 받음
    user_id: str = Form(None),
    tags: str = Form("[]"),  # JSON 문자열로 받음
    category: str = Form("thumbnail")
):
    """썸네일 메타데이터 저장 (MongoDB + 로컬 백업)"""
    try:
        import json
        
        # JSON 문자열을 파싱
        try:
            thumbnail_images_list = json.loads(thumbnail_images)
            tags_list = json.loads(tags) if tags else []
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"잘못된 JSON 형식: {str(e)}")
        
        # 썸네일 데이터 검증
        if not origin_goods_code:
            raise HTTPException(status_code=400, detail="상품 코드가 필요합니다")
        
        if not thumbnail_images_list:
            raise HTTPException(status_code=400, detail="썸네일 이미지가 필요합니다")
        
        # MongoDB에 저장 (향후 구현)
        # try:
        #     from motor.motor_asyncio import AsyncIOMotorClient
        #     client = AsyncIOMotorClient("mongodb://localhost:27017")
        #     db = client.imagehost
        #     collection = db.thumbnails
        #     
        #     metadata = {
        #         "origin_goods_code": origin_goods_code,
        #         "thumbnail_images": thumbnail_images_list,
        #         "user_id": user_id,
        #         "tags": tags_list,
        #         "category": category,
        #         "saved_at": datetime.now().isoformat(),
        #         "total_images": len(thumbnail_images_list),
        #         "status": "active"
        #     }
        #     
        #     result = await collection.insert_one(metadata)
        #     logger.info(f"MongoDB에 썸네일 메타데이터 저장 성공: {result.inserted_id}")
        #     
        # except Exception as db_error:
        #     logger.warning(f"MongoDB 저장 실패, 로컬 저장으로 대체: {str(db_error)}")
        
        # MongoDB 저장
        from app.services.service_mongodb import mongodb_service
        from app.imagehost.models.thumbnail_odmantic import ThumbnailMetadata
        engine = mongodb_service.engine
        doc = ThumbnailMetadata(
            origin_goods_code=origin_goods_code,
            thumbnail_images=thumbnail_images_list,
            user_id=user_id,
            tags=tags_list,
            category=category,
        )
        await engine.save(doc)
        logger.info(f"썸네일 메타데이터 MongoDB 저장 성공: {origin_goods_code}")

        return {
            "success": True,
            "message": "썸네일 메타데이터가 성공적으로 저장되었습니다",
            "data": {
                "goods_code": origin_goods_code,
                "total_images": len(thumbnail_images_list),
                "saved_at": doc.saved_at.isoformat(),
                "cloudflare_urls": thumbnail_images_list
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"썸네일 메타데이터 저장 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"썸네일 메타데이터 저장 실패: {str(e)}")
