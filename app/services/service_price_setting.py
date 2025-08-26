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
                        "main_expected_margin": product.mainExpectedMargin,  # 🆕 mainExpectedMargin 필드
                        "main_expected_margin_rate": product.mainExpectedMarginRate,  # 🆕 mainExpectedMarginRate 필드
                        "updated_at": datetime.now(timezone.utc)
                    }
                }

                # 🆕 마진 정보가 있으면 추가 (null 값은 제외)
                if hasattr(product, 'mainExpectedMargin') and product.mainExpectedMargin is not None:
                    update_data["$set"]["margin_amount"] = product.mainExpectedMargin
                    print(f"💰 마진 금액 설정: {product.mainExpectedMargin}")
                
                if hasattr(product, 'mainExpectedMarginRate') and product.mainExpectedMarginRate is not None:
                    update_data["$set"]["margin_rate"] = product.mainExpectedMarginRate
                    print(f"📈 마진율 설정: {product.mainExpectedMarginRate}%")

                # 상품 업데이트 실행
                result = await modified_goods_collection.update_one(
                    {"origin_goods_code": product.originGoodsCode},
                    update_data
                )

                if result.modified_count > 0:
                    updated_count += 1
                    print(f"✅ 상품 마진 정보 업데이트 완료: {product.originGoodsCode}")
                    print(f"   - selling_price: {product.salesPrice or product.settingPrice}")
                    print(f"   - margin_amount: {product.mainExpectedMargin}")
                    print(f"   - margin_rate: {product.mainExpectedMarginRate}%")
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
        """가격 설정 데이터를 저장합니다. 각 상품별로 개별 문서로 저장."""
        try:
            print(f"🚀 가격 설정 데이터 저장 시작: {request_data.originGoodsCode}")
            
            # 1. 환율 저장 (중복 방지)
            print("📊 1단계: 환율 데이터 저장 중...")
            saved_rates = await self.save_exchange_rates(request_data.exchangeRates)
            print(f"✅ 환율 저장 완료: {len(saved_rates)}개")

            # 🆕 2. 각 상품별로 개별 문서로 저장
            print("📊 2단계: 상품별 가격 설정 데이터 저장 중...")
            
            base_price_collection = self.setting_db.base_price_setting
            saved_products = []
            
            for i, product in enumerate(request_data.calculatedProducts):
                print(f"\n🔄 상품 {i+1} 처리 시작...")
                
                # 🆕 각 상품의 실제 originGoodsCode 사용
                actual_origin_goods_code = product.originGoodsCode  # 🆕 상품별 실제 originGoodsCode
                print(f"🆔 상품 {i+1}의 실제 originGoodsCode: {actual_origin_goods_code}")
                
                # 🆕 각 상품별로 개별 문서 구성 (실제 originGoodsCode 기준으로 구분)
                product_doc = {
                    "originGoodsCode": actual_origin_goods_code,  # 🆕 실제 originGoodsCode 사용
                    "exchangeRates": {
                        "manuel": saved_rates,  # 🆕 manuel로 통합된 환율 데이터
                    },
                    "formulaSettings": {
                        "base": request_data.baseSellingPriceFormula or {},  # 기본 판매가 공식
                        "additional": request_data.additionalSellingPriceFormula or {}  # 추가 판매가 공식
                    },
                    "platformMargins": request_data.platformMargins,  # 🆕 플랫폼별 마진 설정
                    
                    # 🆕 상품별 계산된 데이터
                    "basePrice": product.basePrice,
                    "originalPrice": product.originalPrice,
                    "exchangeRate": product.exchangeRate,
                    
                    # 🆕 marginList 구조로 변경
                    "marginList": {
                        "main": {
                            "ExpectedMargin": round(product.marginList["main"].ExpectedMargin, 2),
                            "ExpectedMarginRate": round(product.marginList["main"].ExpectedMarginRate, 2),
                            "selling_price": getattr(product.marginList["main"], "selling_price", product.basePrice) # 🆕 selling_price 추가 (기본값: basePrice)
                        },
                        "coupang": {
                            "ExpectedMargin": round(product.marginList["coupang"].ExpectedMargin, 2),
                            "ExpectedMarginRate": round(product.marginList["coupang"].ExpectedMarginRate, 2),
                            "selling_price": getattr(product.marginList["coupang"], "selling_price", product.basePrice) # 🆕 selling_price 추가 (기본값: basePrice)
                        },
                        "auction": {
                            "ExpectedMargin": round(product.marginList["auction"].ExpectedMargin, 2),
                            "ExpectedMarginRate": round(product.marginList["auction"].ExpectedMarginRate, 2),
                            "selling_price": getattr(product.marginList["auction"], "selling_price", product.basePrice) # 🆕 selling_price 추가 (기본값: basePrice)
                        },
                        "gmarket": {
                            "ExpectedMargin": round(product.marginList["gmarket"].ExpectedMargin, 2),
                            "ExpectedMarginRate": round(product.marginList["gmarket"].ExpectedMarginRate, 2),
                            "selling_price": getattr(product.marginList["gmarket"], "selling_price", product.basePrice) # 🆕 selling_price 추가 (기본값: basePrice)
                        },
                        "elevenst": {
                            "ExpectedMargin": round(product.marginList["elevenst"].ExpectedMargin, 2),
                            "ExpectedMarginRate": round(product.marginList["elevenst"].ExpectedMarginRate, 2),
                            "selling_price": getattr(product.marginList["elevenst"], "selling_price", product.basePrice) # 🆕 selling_price 추가 (기본값: basePrice)
                        }
                    },
                    
                    "updatedAt": datetime.now(timezone.utc)
                    # 🆕 createdAt 필드 완전 제거
                }
                
                print(f"📄 생성된 상품 문서: {actual_origin_goods_code}")
                print(f"   - basePrice: {product_doc['basePrice']}")
                print(f"   - originalPrice: {product_doc['originalPrice']}")
                print(f"   - exchangeRate: {product_doc['exchangeRate']}")
                
                # 🆕 marginList 디버깅 로그 추가
                print(f"   - marginList 구조:")
                for platform, margins in product_doc['marginList'].items():
                    print(f"     {platform}: ExpectedMargin={margins['ExpectedMargin']}, ExpectedMarginRate={margins['ExpectedMarginRate']}, selling_price={margins['selling_price']}")
                
                # 🆕 upsert 방식으로 저장/업데이트 (실제 originGoodsCode로 구분)
                search_criteria = {"originGoodsCode": actual_origin_goods_code}  # 🆕 실제 originGoodsCode로 검색
                print(f"🔍 MongoDB 검색 조건: {search_criteria}")
                
                result = await base_price_collection.update_one(
                    search_criteria,  # 검색 조건 (실제 originGoodsCode 사용)
                    {
                        "$set": product_doc
                        # 🆕 createdAt 필드 제거
                    },
                    upsert=True  # 🆕 upsert 옵션으로 업데이트/생성
                )
                
                print(f"📊 MongoDB 업데이트 결과:")
                print(f"   - matched_count: {result.matched_count}")
                print(f"   - modified_count: {result.modified_count}")
                print(f"   - upserted_id: {result.upserted_id}")
                
                if result.upserted_id:
                    print(f"✅ 새로운 상품 가격 설정 데이터 생성 완료: {actual_origin_goods_code} (ID: {result.upserted_id})")
                else:
                    print(f"✅ 기존 상품 가격 설정 데이터 업데이트 완료: {actual_origin_goods_code}")
                
                saved_products.append(actual_origin_goods_code)
                print(f"💾 상품 {i+1} 저장 완료: {actual_origin_goods_code}")
            
            print(f"📋 저장된 상품 데이터: {len(saved_products)}개")
            for product_id in saved_products:
                print(f"  - {product_id}")

            # 3. 상품 가격 업데이트 (updatedProducts가 있을 때만)
            print("📊 3단계: 상품 가격 및 마진 정보 업데이트 중...")
            updated_count = 0
            if hasattr(request_data, 'updatedProducts') and request_data.updatedProducts and len(request_data.updatedProducts) > 0:
                updated_count = await self.update_product_prices(request_data.updatedProducts)
                print(f"✅ {len(request_data.updatedProducts)}개 상품 가격 및 마진 정보 업데이트 완료")
            else:
                print("⚠️ updatedProducts가 없거나 비어있어 상품 가격 업데이트를 건너뜁니다.")

            print(f"🎉 모든 데이터 저장/업데이트 완료! 총 {len(saved_rates)}개 환율, {len(saved_products)}개 상품 저장, {updated_count}개 상품 업데이트")

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
            
            # 🆕 모든 상품 데이터 조회 (상품별로 개별 문서로 저장됨)
            all_products = await base_price_collection.find(
                {"originGoodsCode": origin_goods_code}
            ).to_list(length=None)
            
            if all_products and len(all_products) > 0:
                print(f"✅ 저장된 데이터 발견: {origin_goods_code}")
                
                # 첫 번째 상품의 공통 데이터 추출
                first_product = all_products[0]
                print(f"📊 환율 데이터: {first_product.get('exchangeRates', {})}")
                print(f"📊 공식 설정: {first_product.get('formulaSettings', {})}")
                print(f"📊 플랫폼 마진: {first_product.get('platformMargins', {})}")
                print(f"📊 총 상품 수: {len(all_products)}개")
                
                # 🆕 각 상품별 상세 정보 출력
                for i, product in enumerate(all_products):
                    print(f"  📦 상품 {i+1}: {product.get('originGoodsCode', 'N/A')}")
                    print(f"    - 기본가격: {product.get('basePrice', 'N/A')}")
                    print(f"    - 원본가격: {product.get('originalPrice', 'N/A')}")
                    print(f"    - 환율: {product.get('exchangeRate', 'N/A')}")
                    
                    # 🆕 marginList 구조 출력
                    marginList = product.get('marginList', {})
                    if marginList:
                        print(f"    - 마진 목록:")
                        for platform, margins in marginList.items():
                            expectedMargin = margins.get('ExpectedMargin', 'N/A')
                            expectedMarginRate = margins.get('ExpectedMarginRate', 'N/A')
                            
                            # ExpectedMarginRate가 숫자인 경우 소수점 2자리로 표시
                            if isinstance(expectedMarginRate, (int, float)):
                                expectedMarginRate = f"{expectedMarginRate:.2f}%"
                            else:
                                expectedMarginRate = f"{expectedMarginRate}%"
                                
                            print(f"      {platform}: 마진 {expectedMargin}, 마진율 {expectedMarginRate}")
                    else:
                        print(f"    - 마진 목록: 없음")
                
                # MongoDB ObjectId 제거 및 데이터 정리
                for product in all_products:
                    if '_id' in product:
                        del product['_id']
                
                # 🆕 통합된 데이터 구조로 반환
                integrated_data = {
                    "originGoodsCode": origin_goods_code,
                    "exchangeRates": first_product.get('exchangeRates', {}),
                    "formulaSettings": first_product.get('formulaSettings', {}),
                    "platformMargins": first_product.get('platformMargins', {}),
                    "calculatedProducts": all_products,  # 🆕 모든 상품 데이터 포함
                    "updatedAt": first_product.get('updatedAt', None)
                }
                
                return integrated_data
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
