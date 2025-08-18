# 이미지 관리 API
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging
from odmantic import AIOEngine
from app.services.service_mongodb import mongodb_service
from app.imagehost.models.thumbnail_odmantic import ThumbnailMetadata
from app.imagehost.models.policy_odmantic import StoragePolicy, UserPolicy, CleanupSchedule
from pydantic import BaseModel
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """이미지 관리 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "Image Management",
        "message": "서비스가 정상적으로 실행 중입니다"
    }

class PolicyIn(BaseModel):
    name: str
    retention_days: int
    archive_days: int
    soft_delete: bool = True
    is_active: bool = True

class CleanupRequest(BaseModel):
    mode: str  # archive | delete
    older_than_days: int
    category: Optional[str] = None

@router.get("/images", response_class=JSONResponse)
async def list_images():
    """이미지 목록 조회"""
    try:
        engine = mongodb_service.engine
        docs = await engine.find(ThumbnailMetadata)
        return {"success": True, "data": [
            {
                "id": str(d.id),
                "origin_goods_code": d.origin_goods_code,
                "thumbnail_images": d.thumbnail_images,
                "status": d.status,
                "saved_at": d.saved_at.isoformat()
            } for d in docs
        ]}
    except Exception as e:
        logger.error(f"이미지 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail="이미지 목록 조회 실패")

@router.delete("/images/{image_id}", response_class=JSONResponse)
async def delete_image(image_id: str):
    """이미지 삭제"""
    try:
        engine = mongodb_service.engine
        doc = await engine.find_one(ThumbnailMetadata, ThumbnailMetadata.id == image_id)
        if not doc:
            raise HTTPException(status_code=404, detail="not found")
        doc.status = "deleted"
        doc.deleted_at = datetime.utcnow()
        await engine.save(doc)
        return {"success": True}
    except Exception as e:
        logger.error(f"이미지 삭제 실패: {str(e)}")
        raise HTTPException(status_code=500, detail="이미지 삭제 실패")

@router.post("/cleanup", response_class=JSONResponse)
async def cleanup(req: CleanupRequest):
    try:
        engine = mongodb_service.engine
        threshold = datetime.utcnow() - timedelta(days=req.older_than_days)
        docs = await engine.find(ThumbnailMetadata)
        changed = 0
        for d in docs:
            if d.saved_at <= threshold and (not req.category or d.category == req.category):
                if req.mode == "archive" and d.status == "active":
                    d.status = "archived"; d.archived_at = datetime.utcnow(); changed += 1; await engine.save(d)
                if req.mode == "delete" and d.status in {"active","archived"}:
                    d.status = "deleted"; d.deleted_at = datetime.utcnow(); changed += 1; await engine.save(d)
        return {"success": True, "changed": changed}
    except Exception as e:
        logger.error(f"cleanup failed: {e}")
        raise HTTPException(status_code=500, detail="cleanup failed")

# Policies CRUD
@router.get("/policies", response_class=JSONResponse)
async def list_policies():
    engine = mongodb_service.engine
    docs = await engine.find(StoragePolicy)
    return {"success": True, "data": [{"id": str(d.id), "name": d.name, "retention_days": d.retention_days, "archive_days": d.archive_days, "soft_delete": d.soft_delete, "is_active": d.is_active} for d in docs]}

@router.post("/policies", response_class=JSONResponse)
async def create_policy(p: PolicyIn):
    engine = mongodb_service.engine
    doc = StoragePolicy(name=p.name, retention_days=p.retention_days, archive_days=p.archive_days, soft_delete=p.soft_delete, is_active=p.is_active)
    await engine.save(doc)
    return {"success": True, "id": str(doc.id)}

@router.put("/policies/{policy_id}", response_class=JSONResponse)
async def update_policy(policy_id: str, p: PolicyIn):
    engine = mongodb_service.engine
    doc = await engine.find_one(StoragePolicy, StoragePolicy.id == policy_id)
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    doc.name = p.name; doc.retention_days = p.retention_days; doc.archive_days = p.archive_days; doc.soft_delete = p.soft_delete; doc.is_active = p.is_active
    await engine.save(doc)
    return {"success": True}

@router.delete("/policies/{policy_id}", response_class=JSONResponse)
async def delete_policy(policy_id: str):
    engine = mongodb_service.engine
    doc = await engine.find_one(StoragePolicy, StoragePolicy.id == policy_id)
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    await engine.delete(doc)
    return {"success": True}

# User-Policy mapping
@router.get("/users", response_class=JSONResponse)
async def list_user_policies():
    engine = mongodb_service.engine
    docs = await engine.find(UserPolicy)
    return {"success": True, "data": [{"id": str(d.id), "user_id": d.user_id, "policy_id": d.policy_id, "applied_at": d.applied_at.isoformat()} for d in docs]}

@router.put("/users/{user_id}/policy/{policy_id}", response_class=JSONResponse)
async def apply_user_policy(user_id: str, policy_id: str):
    engine = mongodb_service.engine
    doc = await engine.find_one(UserPolicy, UserPolicy.user_id == user_id)
    if not doc:
        doc = UserPolicy(user_id=user_id, policy_id=policy_id)
    else:
        doc.policy_id = policy_id
    await engine.save(doc)
    return {"success": True}

# Cleanup schedule CRUD (simple single record)
@router.get("/schedule", response_class=JSONResponse)
async def get_schedule():
    engine = mongodb_service.engine
    doc = await engine.find_one(CleanupSchedule)
    if not doc:
        doc = CleanupSchedule(); await engine.save(doc)
    return {"success": True, "data": {
        "enabled": doc.enabled, "frequency": doc.frequency, "time_utc": doc.time_utc,
        "mode": doc.mode, "older_than_days": doc.older_than_days, "category": doc.category, "policy_id": doc.policy_id
    }}

@router.post("/schedule", response_class=JSONResponse)
async def set_schedule(payload: Dict[str, Any]):
    engine = mongodb_service.engine
    doc = await engine.find_one(CleanupSchedule)
    if not doc:
        doc = CleanupSchedule()
    for k, v in payload.items():
        if hasattr(doc, k):
            setattr(doc, k, v)
    doc.updated_at = datetime.utcnow()
    await engine.save(doc)
    return {"success": True}
