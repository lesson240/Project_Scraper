# ImageHost 라우터 초기화
from .image_upload import router as upload_router
from .image_management import router as management_router
from .image_delivery import router as delivery_router

# 메인 라우터 생성
from fastapi import APIRouter

imagehost_router = APIRouter()

# 각 라우터를 메인 라우터에 포함 (접두사 제거하여 직접 경로 사용)
imagehost_router.include_router(upload_router, tags=["Image Upload"])
imagehost_router.include_router(management_router, prefix="/management", tags=["Image Management"])
# 프런트가 호출하는 경로(/v1/imagehost/delivery/...)와 맞추기 위해 접두사 정정
imagehost_router.include_router(delivery_router, prefix="/imagehost/delivery", tags=["Image Delivery"])

__all__ = [
    "imagehost_router"
]
