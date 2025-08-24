# path: app/routers/func_price_setting.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service

router = APIRouter(prefix="/api/price-setting", tags=["PriceSetting"])

# 데이터베이스 의존성
async def get_db() -> AsyncIOMotorClient:
    return mongodb_service.client

# 가격 설정 모달에서 환율 저장 및 상품 가격 업데이트
@router.post("/save")
async def save_price_setting_data(
    request_data: dict,
    db: AsyncIOMotorClient = Depends(get_db)
):
    """가격 설정 모달에서 환율 저장 및 상품 가격 업데이트"""
    try:
        # MongoDB 연결 확인
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        client = mongodb_service.client
        
        # 1. setting_value.exchange_rate 컬렉션에 환율 저장
        setting_db = client["setting_value"]
        
        # setting_value 데이터베이스와 exchange_rate 컬렉션 존재 확인 및 생성
        if "setting_value" not in await client.list_database_names():
            print("setting_value 데이터베이스가 존재하지 않습니다. 새로 생성합니다.")
        
        if "exchange_rate" not in await setting_db.list_collection_names():
            print("exchange_rate 컬렉션을 생성합니다.")
        
        exchange_rate_collection = setting_db.exchange_rate
        
        # 환율 데이터 저장
        exchange_rates = request_data.get("exchangeRates", [])
        saved_rates = []
        
        for rate in exchange_rates:
            if rate.get("appliedRate") and rate.get("currencyCode"):
                rate_doc = {
                    "currency": rate["currencyCode"],
                    "value": rate["appliedRate"],
                    "datetime": datetime.utcnow(),
                    "source": "price_setting_modal",
                    "isActive": True
                }
                
                # 기존 데이터 비활성화
                await exchange_rate_collection.update_many(
                    {"currency": rate["currencyCode"], "isActive": True},
                    {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
                )
                
                # 새 데이터 저장
                result = await exchange_rate_collection.insert_one(rate_doc)
                saved_rates.append({
                    "currency": rate["currencyCode"],
                    "value": rate["appliedRate"],
                    "id": str(result.inserted_id)
                })
                print(f"환율 저장 완료: {rate['currencyCode']} = {rate['appliedRate']}")
        
        # 2. ModifiedGoodsDetail 컬렉션에서 상품 가격 업데이트
        scrapmarket_db = client["scrapmarket"]
        modified_goods_collection = scrapmarket_db.ModifiedGoodsDetail
        
        updated_products = request_data.get("updatedProducts", [])
        updated_count = 0
        
        for product in updated_products:
            if product.get("originGoodsCode") and product.get("settingPrice"):
                # origin_goods_code로 상품 찾기
                result = await modified_goods_collection.update_one(
                    {"origin_goods_code": product["originGoodsCode"]},
                    {
                        "$set": {
                            "selling_price": product["settingPrice"],
                            "updated_at": datetime.utcnow(),
                            "price_setting_source": "price_setting_modal"
                        }
                    }
                )
                
                if result.modified_count > 0:
                    updated_count += 1
                    print(f"상품 가격 업데이트 완료: {product['originGoodsCode']} = {product['settingPrice']}")
                else:
                    print(f"상품을 찾을 수 없음: {product['originGoodsCode']}")
        
        return {
            "success": True,
            "message": "가격 설정 데이터 저장 완료",
            "saved_exchange_rates": saved_rates,
            "updated_products_count": updated_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"가격 설정 데이터 저장 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"가격 설정 데이터 저장 실패: {str(e)}")

@router.get("/health")
async def health_check():
    """가격 설정 서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "price_setting",
        "timestamp": datetime.utcnow().isoformat()
    }
