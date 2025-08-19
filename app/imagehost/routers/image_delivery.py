# 이미지 전송 API
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, Response, StreamingResponse
from typing import Dict, Any
import logging
import os
import httpx

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """이미지 전송 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "Image Delivery",
        "message": "서비스가 정상적으로 실행 중입니다"
    }

@router.get("/images/{image_id}", response_class=JSONResponse)
async def get_image_info(image_id: str):
    """이미지 정보 조회"""
    try:
        # 임시 구현 - 실제로는 데이터베이스에서 조회
        logger.info(f"이미지 정보 조회: {image_id}")
        return {
            "success": True,
            "message": "이미지 정보 조회 성공",
            "data": {
                "id": image_id,
                "filename": f"image_{image_id}.jpg",
                "size": 0,
                "url": f"https://example.com/images/{image_id}",
                "status": "active"
            }
        }
    except Exception as e:
        logger.error(f"이미지 정보 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail="이미지 정보 조회 실패")

@router.get("/images/{image_id}/download")
async def download_image(image_id: str):
    """이미지 다운로드"""
    try:
        # 임시 구현 - 실제로는 Cloudflare R2에서 다운로드
        logger.info(f"이미지 다운로드 요청: {image_id}")
        # 임시 응답 - 실제로는 이미지 파일 반환
        return {
            "success": True,
            "message": f"이미지 {image_id} 다운로드 준비 완료",
            "download_url": f"https://example.com/download/{image_id}"
        }
    except Exception as e:
        logger.error(f"이미지 다운로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail="이미지 다운로드 실패")


@router.get("/proxy")
async def proxy_image(url: str = Query(..., description="절대 이미지 URL")):
    """교차 출처 이미지를 서버를 통해 프록시하여 CORS/캔버스 오염 문제를 회피.
    - 허용된 도메인만 프록시: CLOUDFLARE_R2_PUBLIC_URL 또는 CLOUDFLARE_R2_PUBLIC_BASE_URL
    """
    try:
        allow1 = os.getenv("CLOUDFLARE_R2_PUBLIC_URL", "")
        allow2 = os.getenv("CLOUDFLARE_R2_PUBLIC_BASE_URL", "")
        allowed_prefixes = [p.rstrip("/") for p in [allow1, allow2] if p]
        
        # 허용된 외부 이미지 도메인들
        allowed_external_domains = [
            "https://image.oliveyoung.co.kr",
            "https://image.coupang.com",
            "https://img.coupangcdn.com"
        ]

        if not (url.startswith("http://") or url.startswith("https://")):
            raise HTTPException(status_code=400, detail="절대 URL만 허용됩니다")

        # Cloudflare R2 도메인 또는 허용된 외부 도메인인지 확인
        is_allowed = False
        if allowed_prefixes and any(url.startswith(p) for p in allowed_prefixes):
            is_allowed = True
        elif any(url.startswith(domain) for domain in allowed_external_domains):
            is_allowed = True
            
        if not is_allowed:
            raise HTTPException(status_code=403, detail="허용되지 않은 도메인")

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return Response(status_code=resp.status_code)

            headers = {
                "Content-Type": resp.headers.get("Content-Type", "application/octet-stream"),
                "Access-Control-Allow-Origin": "*",
            }
            cache = resp.headers.get("Cache-Control")
            if cache:
                headers["Cache-Control"] = cache

            return StreamingResponse(resp.aiter_bytes(), headers=headers, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"이미지 프록시 실패: {str(e)}")
        raise HTTPException(status_code=500, detail="이미지 프록시 실패")
