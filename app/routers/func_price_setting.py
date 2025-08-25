# path: app/routers/func_price_setting.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime
from app.services.service_price_setting import get_price_setting_service, PriceSettingService
from app.models.model_price_setting import PriceSettingRequest, PriceSettingResponse
from app.exceptions.price_setting_exceptions import (
    PriceSettingError,
    ExchangeRateError,
    ProductUpdateError,
    ValidationError,
    DatabaseError
)

router = APIRouter(prefix="/api/price-setting", tags=["PriceSetting"])

# 가격 설정 모달에서 환율 저장 및 상품 가격 업데이트
@router.post("/save")
async def save_price_setting(request: PriceSettingRequest):
    """가격 설정 데이터를 저장합니다."""
    try:
        print(f"🚀 가격 설정 저장 요청 받음: {request.originGoodsCode}")
        print(f"📊 요청 데이터 상세 분석:")
        print(f"  - exchangeRates: {len(request.exchangeRates)}개")
        print(f"  - baseSellingPriceFormula: {request.baseSellingPriceFormula}")
        print(f"  - additionalSellingPriceFormula: {request.additionalSellingPriceFormula}")
        print(f"  - updatedProducts: {len(request.updatedProducts) if request.updatedProducts else 0}개")
        print(f"  - originGoodsCode: {request.originGoodsCode}")
        
        service = await get_price_setting_service()
        result = await service.save_price_setting_data(request)
        
        print(f"✅ 가격 설정 저장 완료: {result.message}")
        return result
        
    except ValidationError as e:
        print(f"데이터 검증 오류: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "데이터 검증에 실패했습니다. 필수 필드를 확인해주세요.",
                "details": str(e),
                "required_fields": [
                    "exchangeRates[].currencyCode",
                    "exchangeRates[].appliedRate",
                    "exchangeRates[].lastUpdated",
                    "exchangeRates[].source"
                ]
            }
        )
    except Exception as e:
        print(f"❌ 가격 설정 저장 중 오류: {str(e)}")
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
    """저장된 가격 설정 데이터를 조회합니다."""
    try:
        print(f"🔍 가격 설정 데이터 조회 요청: {origin_goods_code}")
        
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        # 가격 설정 서비스 인스턴스 생성
        from app.services.service_price_setting import get_price_setting_service
        service = await get_price_setting_service()
        
        # 저장된 데이터 조회
        saved_data = await service.load_price_setting_data(origin_goods_code)
        
        if saved_data:
            print(f"✅ 가격 설정 데이터 조회 성공: {origin_goods_code}")
            return {
                "success": True,
                "data": saved_data,
                "message": "가격 설정 데이터를 성공적으로 조회했습니다."
            }
        else:
            print(f"⚠️ 저장된 가격 설정 데이터가 없음: {origin_goods_code}")
            return {
                "success": False,
                "data": None,
                "message": "저장된 가격 설정 데이터가 없습니다."
            }
            
    except Exception as e:
        print(f"❌ 가격 설정 데이터 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"가격 설정 데이터 조회 실패: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """가격 설정 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "price_setting",
        "timestamp": datetime.utcnow().isoformat()
    }
