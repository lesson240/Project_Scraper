# path: app/routers/func_price_setting.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from datetime import datetime
from app.services.service_price_setting import get_price_setting_service
from app.models import (
    PriceSettingRequest, 
    PriceSettingResponse, 
    CalculatedItemInfo,
    SellingPriceFormulaInfo,
    PlatformMarginRateInfo,
    ExchangeRateInfo,
    PlatformMargins,
    MarginListByItems,
    ModifiedGoodsDetailUpdate
)
from app.exceptions.price_setting_exceptions import (
    PriceSettingError,
    ExchangeRateError,
    ProductUpdateError,
    ValidationError,
    DatabaseError
)

router = APIRouter(prefix="/api/price-setting", tags=["PriceSetting"])

@router.post("/save")
async def save_price_setting(request_data: PriceSettingRequest):
    """가격 설정 데이터를 저장합니다."""
    try:
        # PriceSettingRequest는 이미 올바른 구조를 가지고 있으므로 직접 사용
        service = await get_price_setting_service()
        result = await service.save_price_setting_data(request_data)
        
        return result
        
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "데이터 검증에 실패했습니다. 필수 필드를 확인해주세요.",
                "details": str(e),
                "required_fields": [
                    "exchangeRatesInfo[].currencyCode",
                    "exchangeRatesInfo[].appliedRate",
                    "exchangeRatesInfo[].lastUpdated",
                    "exchangeRatesInfo[].source"
                ]
            }
        )
    except ExchangeRateError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "EXCHANGE_RATE_ERROR",
                "message": "환율 데이터 처리 중 오류가 발생했습니다.",
                "details": str(e)
            }
        )
    except DatabaseError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "DATABASE_ERROR",
                "message": "데이터베이스 처리 중 오류가 발생했습니다.",
                "details": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "서버 내부 오류가 발생했습니다.",
                "details": str(e)
            }
        )

@router.get("/load/{origin_goods_code}")
async def load_price_setting_data(origin_goods_code: str):
    """ModifiedGoodsDetail 컬렉션에서 가격 설정 데이터를 조회합니다."""
    try:
        if not origin_goods_code:
            raise HTTPException(
                status_code=400,
                detail="상품 코드가 비어있습니다."
            )
        
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        # 가격 설정 서비스 인스턴스 생성
        service = await get_price_setting_service()
        
        # ModifiedGoodsDetail 컬렉션에서 데이터 조회
        saved_data = await service.load_modified_goods_detail(origin_goods_code)
        
        if saved_data:
            return {
                "success": True,
                "data": saved_data,
                "message": "ModifiedGoodsDetail 데이터를 성공적으로 조회했습니다."
            }
        else:
            return {
                "success": False,
                "data": None,
                "message": "저장된 ModifiedGoodsDetail 데이터가 없습니다."
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ModifiedGoodsDetail 데이터 조회 실패: {str(e)}"
        )

@router.get("/load/info")
async def load_base_price_setting_info():
    """BasePriceSetting 컬렉션에서 공통 가격 설정 정보를 조회합니다."""
    try:
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        # 가격 설정 서비스 인스턴스 생성
        service = await get_price_setting_service()
        
        # BasePriceSetting 컬렉션에서 공통 정보 조회
        base_info = await service.load_base_price_setting_info()
        
        if base_info:
            return {
                "success": True,
                "data": base_info,
                "message": "BasePriceSetting 정보를 성공적으로 조회했습니다."
            }
        else:
            return {
                "success": False,
                "data": None,
                "message": "저장된 BasePriceSetting 정보가 없습니다."
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"BasePriceSetting 정보 조회 실패: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """가격 설정 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "price_setting",
        "timestamp": datetime.utcnow().isoformat()
    }
