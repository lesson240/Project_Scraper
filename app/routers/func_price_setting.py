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

@router.get("/health")
async def health_check():
    """가격 설정 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "price_setting",
        "timestamp": datetime.utcnow().isoformat()
    }

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



@router.get("/load/info")
async def load_base_price_setting_info():
    """BasePriceSetting 컬렉션에서 공통 가격 설정 정보를 조회합니다."""
    # import time
    # start_time = time.time()
    
    try:
        # print(f"🕐 [타임아웃 디버깅] API 시작 시간: {start_time}")
        
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        # connection_start = time.time()
        await ensure_mongodb_connection()
        # connection_time = time.time() - connection_start
        # print(f"🕐 [타임아웃 디버깅] MongoDB 연결 시간: {connection_time:.3f}초")
        
        # 가격 설정 서비스 인스턴스 생성
        # service_start = time.time()
        service = await get_price_setting_service()
        # service_time = time.time() - service_start
        # print(f"🕐 [타임아웃 디버깅] 서비스 생성 시간: {service_time:.3f}초")
        
        # BasePriceSetting 컬렉션에서 공통 정보 조회
        # query_start = time.time()
        base_info = await service.load_base_price_setting_info()
        # query_time = time.time() - query_start
        # print(f"🕐 [타임아웃 디버깅] 데이터베이스 쿼리 시간: {query_time:.3f}초")
        
        # total_time = time.time() - start_time
        # print(f"🕐 [타임아웃 디버깅] 총 응답 시간: {total_time:.3f}초")
        
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



@router.get("/load/{origin_goods_code}")
async def load_price_setting_data(origin_goods_code: str):
    """ModifiedGoodsDetail 컬렉션에서 가격 설정 데이터를 조회합니다."""
    # import time
    # start_time = time.time()
    
    try:
        # print(f"🕐 [타임아웃 디버깅] 개별 상품 데이터 조회 시작: {origin_goods_code}")
        
        if not origin_goods_code:
            raise HTTPException(
                status_code=400,
                detail="상품 코드가 비어있습니다."
            )
        
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        # connection_start = time.time()
        await ensure_mongodb_connection()
        # connection_time = time.time() - connection_start
        # print(f"🕐 [타임아웃 디버깅] MongoDB 연결 시간: {connection_time:.3f}초")
        
        # 가격 설정 서비스 인스턴스 생성
        # service_start = time.time()
        service = await get_price_setting_service()
        # service_time = time.time() - service_start
        # print(f"🕐 [타임아웃 디버깅] 서비스 생성 시간: {service_time:.3f}초")
        
        # ModifiedGoodsDetail 컬렉션에서 데이터 조회
        # query_start = time.time()
        saved_data = await service.load_modified_goods_detail(origin_goods_code)
        # query_time = time.time() - query_start
        # print(f"🕐 [타임아웃 디버깅] 개별 상품 데이터 쿼리 시간: {query_time:.3f}초")
        
        # total_time = time.time() - start_time
        # print(f"🕐 [타임아웃 디버깅] 개별 상품 데이터 총 응답 시간: {total_time:.3f}초")
        
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


@router.post("/save/info/{setting_type}")
async def save_base_setting(setting_type: str, request_data: Dict[str, Any]):
    """BasePriceSetting 컬렉션에 공통 설정을 저장합니다."""
    try:
        if setting_type not in ['exchangeRate', 'formulaAndMargin']:
            raise HTTPException(
                status_code=400,
                detail="유효하지 않은 설정 타입입니다. 'exchangeRate', 'formulaAndMargin' 중 하나여야 합니다."
            )
        
        service = await get_price_setting_service()
        result = await service.save_base_setting(setting_type, request_data)
        
        return result
        
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "데이터 검증에 실패했습니다.",
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
