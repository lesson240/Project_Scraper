# path: app/services/service_price_setting.py
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service
from app.config.mongodb import MONGO_DB_NAME_SETTINGS
from app.models.model_exchange_rate import PriceSettingExchangeRate, PriceSettingProductUpdate
from app.models.model_price_setting import (
    ProductPriceData, 
    PriceSettingRequest,
    PriceSettingResponse
)
from app.exceptions.price_setting_exceptions import (
    ExchangeRateError,
    ProductUpdateError,
    DatabaseError,
    ValidationError
)

class PriceSettingService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.setting_db = db[MONGO_DB_NAME_SETTINGS]  # "settings" 데이터베이스
        self.scrapmarket_db = db["scrapmarket"]        # "scrapmarket" 데이터베이스
    
    async def save_exchange_rates(self, exchange_rates: List[PriceSettingExchangeRate]) -> List[Dict[str, Any]]:
        """환율 데이터를 base_price_setting 컬렉션에 저장 (중복 방지)."""
        try:
            # 🆕 인덱스 기반 환율 구조로 변환
            manuel_rates = []
            saved_rates = []
            
            # KRW (인덱스 0)
            krw_rate = next((rate for rate in exchange_rates if rate.currencyCode == 'KRW'), None)
            if krw_rate:
                manuel_rates.append({
                    "currencyCode": "KRW",
                    "appliedRate": 1.0
                })
                saved_rates.append({
                    "currencyCode": "KRW",
                    "appliedRate": 1.0,
                    "id": "manuel_0"
                })
            else:
                # KRW가 없으면 기본값 추가
                manuel_rates.append({
                    "currencyCode": "KRW",
                    "appliedRate": 1.0
                })
                saved_rates.append({
                    "currencyCode": "KRW",
                    "appliedRate": 1.0,
                    "id": "manuel_0"
                })

            # USD (인덱스 1)
            usd_rate = next((rate for rate in exchange_rates if rate.currencyCode == 'USD'), None)
            if usd_rate and usd_rate.appliedRate > 0:
                manuel_rates.append({
                    "currencyCode": "USD",
                    "appliedRate": usd_rate.appliedRate
                })
                saved_rates.append({
                    "currencyCode": "USD",
                    "appliedRate": usd_rate.appliedRate,
                    "id": "manuel_1"
                })
            else:
                manuel_rates.append({
                    "currencyCode": "USD",
                    "appliedRate": 0
                })
                saved_rates.append({
                    "currencyCode": "USD",
                    "appliedRate": 0,
                    "id": "manuel_1"
                })

            # CNY (인덱스 2)
            cny_rate = next((rate for rate in exchange_rates if rate.currencyCode == 'CNY'), None)
            if cny_rate and cny_rate.appliedRate > 0:
                manuel_rates.append({
                    "currencyCode": "CNY",
                    "appliedRate": cny_rate.appliedRate
                })
                saved_rates.append({
                    "currencyCode": "CNY",
                    "appliedRate": cny_rate.appliedRate,
                    "id": "manuel_2"
                })
            else:
                manuel_rates.append({
                    "currencyCode": "CNY",
                    "appliedRate": 0
                })
                saved_rates.append({
                    "currencyCode": "CNY",
                    "appliedRate": 0,
                    "id": "manuel_2"
                })

            # JPY (인덱스 3)
            jpy_rate = next((rate for rate in exchange_rates if rate.currencyCode == 'JPY'), None)
            if jpy_rate and jpy_rate.appliedRate > 0:
                manuel_rates.append({
                    "currencyCode": "JPY",
                    "appliedRate": jpy_rate.appliedRate
                })
                saved_rates.append({
                    "currencyCode": "JPY",
                    "appliedRate": jpy_rate.appliedRate,
                    "id": "manuel_3"
                })
            else:
                manuel_rates.append({
                    "currencyCode": "JPY",
                    "appliedRate": 0
                })
                saved_rates.append({
                    "currencyCode": "JPY",
                    "appliedRate": 0,
                    "id": "manuel_3"
                })

            # EUR (인덱스 4)
            eur_rate = next((rate for rate in exchange_rates if rate.currencyCode == 'EUR'), None)
            if eur_rate and eur_rate.appliedRate > 0:
                manuel_rates.append({
                    "currencyCode": "EUR",
                    "appliedRate": eur_rate.appliedRate
                })
                saved_rates.append({
                    "currencyCode": "EUR",
                    "appliedRate": eur_rate.appliedRate,
                    "id": "manuel_4"
                })
            else:
                manuel_rates.append({
                    "currencyCode": "EUR",
                    "appliedRate": 0
                })
                saved_rates.append({
                    "currencyCode": "EUR",
                    "appliedRate": 0,
                    "id": "manuel_4"
                })

            print(f"✅ 환율 구조 변환 완료: {len(manuel_rates)}개 통화")
            for i, rate in enumerate(manuel_rates):
                print(f"  [{i}] {rate['currencyCode']}: {rate['appliedRate']}")
            
            return saved_rates
        except Exception as e:
            print(f"❌ 환율 저장 중 오류: {str(e)}")
            raise ExchangeRateError(
                message=f"환율 저장 중 오류 발생: {str(e)}",
                currency=exchange_rates[0].currencyCode if exchange_rates else None
            )
    
    async def update_product_prices(self, updated_products: List[ProductPriceData]) -> int:
        """상품 가격을 업데이트합니다. 마진 정보를 ModifiedGoodsDetail에 직접 저장."""
        try:
            # 🆕 scrapmarket 데이터베이스의 ModifiedGoodsDetail 컬렉션 사용
            modified_goods_collection = self.scrapmarket_db.ModifiedGoodsDetail
            updated_count = 0

            for product in updated_products:
                # 🆕 요청된 필드명으로 업데이트 데이터 구성
                update_data = {
                    "$set": {
                        "selling_price": product.salesPrice or product.settingPrice,  # 🆕 selling_price 필드
                        "margin_amount": product.expectedMargin,  # 🆕 margin_amount 필드
                        "margin_rate": product.expectedMarginRate,  # 🆕 margin_rate 필드
                        "updated_at": datetime.now(timezone.utc)
                    }
                }

                # 🆕 마진 정보가 있으면 추가 (null 값은 제외)
                if hasattr(product, 'expectedMargin') and product.expectedMargin is not None:
                    update_data["$set"]["margin_amount"] = product.expectedMargin
                    print(f"💰 마진 금액 설정: {product.expectedMargin}")
                
                if hasattr(product, 'expectedMarginRate') and product.expectedMarginRate is not None:
                    update_data["$set"]["margin_rate"] = product.expectedMarginRate
                    print(f"📈 마진율 설정: {product.expectedMarginRate}%")

                # 상품 업데이트 실행
                result = await modified_goods_collection.update_one(
                    {"origin_goods_code": product.originGoodsCode},
                    update_data
                )

                if result.modified_count > 0:
                    updated_count += 1
                    print(f"✅ 상품 마진 정보 업데이트 완료: {product.originGoodsCode}")
                    print(f"   - selling_price: {product.salesPrice or product.settingPrice}")
                    print(f"   - margin_amount: {product.expectedMargin}")
                    print(f"   - margin_rate: {product.expectedMarginRate}%")
                else:
                    print(f"⚠️ 상품을 찾을 수 없음: {product.originGoodsCode}")

            return updated_count
        except Exception as e:
            print(f"❌ 상품 가격 업데이트 중 오류: {str(e)}")
            raise ProductUpdateError(
                message=f"상품 가격 업데이트 중 오류 발생: {str(e)}",
                product_code=updated_products[0].originGoodsCode if updated_products else None
            )
    
    async def save_price_setting_data(self, request_data: PriceSettingRequest) -> PriceSettingResponse:
        """가격 설정 데이터를 저장합니다. 통합된 컬렉션 사용 및 업데이트 방식."""
        try:
            print(f"🚀 가격 설정 데이터 저장 시작: {request_data.originGoodsCode}")
            
            # 1. 환율 저장 (중복 방지)
            print("📊 1단계: 환율 데이터 저장 중...")
            saved_rates = await self.save_exchange_rates(request_data.exchangeRates)
            print(f"✅ 환율 저장 완료: {len(saved_rates)}개")

            # 🆕 2. 통합된 base_price_setting 컬렉션에 데이터 저장/업데이트
            print("📊 2단계: 통합 가격 설정 데이터 저장/업데이트 중...")
            
            base_price_collection = self.setting_db.base_price_setting
            
            # 통합된 문서 구성
            base_price_doc = {
                "originGoodsCode": request_data.originGoodsCode,
                "exchangeRates": {
                    "manuel": saved_rates,  # 🆕 manuel로 통합된 환율 데이터
                },
                "formulaSettings": {
                    "base": request_data.baseSellingPriceFormula or {},  # 기본 판매가 공식
                    "additional": request_data.additionalSellingPriceFormula or {}  # 추가 판매가 공식
                },
                # platformMargins 제거
                # calculatedProducts 제거
                "updatedAt": datetime.now(timezone.utc)
            }
            
            # 🆕 upsert 방식으로 저장/업데이트 (기존 데이터가 있으면 업데이트, 없으면 새로 생성)
            result = await base_price_collection.update_one(
                {"originGoodsCode": request_data.originGoodsCode},  # 검색 조건
                {
                    "$set": base_price_doc,
                    "$setOnInsert": {"createdAt": datetime.now(timezone.utc)}  # 새로 생성될 때만 설정
                },
                upsert=True  # 🆕 upsert 옵션으로 업데이트/생성
            )
            
            if result.upserted_id:
                print(f"✅ 새로운 가격 설정 데이터 생성 완료 (ID: {result.upserted_id})")
            else:
                print(f"✅ 기존 가격 설정 데이터 업데이트 완료 (수정된 문서: {result.modified_count}개)")
            
            print(f"📋 저장된 통합 데이터: {base_price_doc}")

            # 3. 상품 가격 업데이트 (updatedProducts가 있을 때만)
            print("📊 3단계: 상품 가격 및 마진 정보 업데이트 중...")
            updated_count = 0
            if hasattr(request_data, 'updatedProducts') and request_data.updatedProducts and len(request_data.updatedProducts) > 0:
                updated_count = await self.update_product_prices(request_data.updatedProducts)
                print(f"✅ {len(request_data.updatedProducts)}개 상품 가격 및 마진 정보 업데이트 완료")
            else:
                print("⚠️ updatedProducts가 없거나 비어있어 상품 가격 업데이트를 건너뜁니다.")

            print(f"🎉 모든 데이터 저장/업데이트 완료! 총 {len(saved_rates)}개 환율, {updated_count}개 상품 업데이트")

            return PriceSettingResponse(
                success=True,
                message="가격 설정 데이터 저장/업데이트 완료",
                saved_exchange_rates=saved_rates,
                updated_products_count=updated_count,
                timestamp=datetime.now(timezone.utc)
            )
        except Exception as e:
            print(f"❌ 가격 설정 데이터 저장 중 오류: {str(e)}")
            raise e

    async def load_price_setting_data(self, origin_goods_code: str) -> Optional[Dict[str, Any]]:
        """저장된 가격 설정 데이터를 조회합니다."""
        try:
            print(f"🔍 가격 설정 데이터 조회 시작: {origin_goods_code}")
            
            # base_price_setting 컬렉션에서 데이터 조회
            base_price_collection = self.setting_db.base_price_setting
            
            saved_data = await base_price_collection.find_one(
                {"originGoodsCode": origin_goods_code}
            )
            
            if saved_data:
                print(f"✅ 저장된 데이터 발견: {origin_goods_code}")
                print(f"📊 환율 데이터: {saved_data.get('exchangeRates', {})}")
                print(f"📊 공식 설정: {saved_data.get('formulaSettings', {})}")
                print(f"📊 업데이트 시간: {saved_data.get('updatedAt', 'N/A')}")
                
                # MongoDB ObjectId 제거 및 데이터 정리
                if '_id' in saved_data:
                    del saved_data['_id']
                
                return saved_data
            else:
                print(f"⚠️ 저장된 데이터가 없음: {origin_goods_code}")
                return None
                
        except Exception as e:
            print(f"❌ 가격 설정 데이터 조회 중 오류: {str(e)}")
            raise e

# 서비스 인스턴스 생성 함수
async def get_price_setting_service() -> PriceSettingService:
    """가격 설정 서비스 인스턴스 반환"""
    from app.services.service_mongodb import ensure_mongodb_connection
    await ensure_mongodb_connection()
    return PriceSettingService(mongodb_service.client)
