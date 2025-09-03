# path: app/services/service_price_setting.py
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.services.service_mongodb import mongodb_service
from app.config.mongodb import MONGO_DB_NAME_SETTINGS
from app.models.pydantics.model_pydantic_price_setting import ExchangeRateInfo
from app.models.odmantics.model_odmantic_price_setting import (
    BasePriceSettingODM, 
    ModifiedGoodsDetailODM
)
from app.models import (
    PriceSettingRequest,
    PriceSettingResponse,
    ExchangeRateInfo,
    BasePriceSettingODM,
)
from app.exceptions import (
    ExchangeRateError,
    DatabaseError,
    ValidationError,
    ModelValidationError,
    DataIntegrityError,
    ExchangeRateValidationError
)

# 상수 정의
SUPPORTED_CURRENCIES = ['KRW', 'USD', 'CNY', 'JPY', 'EUR']
DEFAULT_EXCHANGE_RATE = 1.0
DEFAULT_CURRENCY = 'KRW'

# 로거 설정
logger = logging.getLogger(__name__)

class PriceSettingService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.setting_db = db[MONGO_DB_NAME_SETTINGS]
        self.scrapmarket_db = db["scrapmarket"]
    
    async def update_modified_goods_detail(self, origin_goods_code: str, request_data: PriceSettingRequest) -> bool:
        """ModifiedGoodsDetail 컬렉션을 업데이트합니다."""
        try:
            if not origin_goods_code:
                raise ValidationError("상품 코드가 비어있습니다")
            
            # base_price_setting 컬렉션에서 데이터 조회
            # base_price_collection = self.setting_db.base_price_setting
            
            # base_data = await base_price_collection.find_one(
            #     {"_id": "base_price_setting"}  # 고정된 ID로 조회
            # )

            # if not base_data:
            #     print(f"⚠️ base_price_setting 데이터를 찾을 수 없습니다")
            #     return False
            
            # ModifiedGoodsDetail 컬렉션에서 originGoodsCode 기준으로 검색
            modified_goods_collection = self.scrapmarket_db.ModifiedGoodsDetail
            
            search_result = await modified_goods_collection.find_one(
                {"origin_goods_code": origin_goods_code}
            )
            
            if not search_result:
                print(f"⚠️ ModifiedGoodsDetail에서 상품을 찾을 수 없습니다: {origin_goods_code}")
                return False
            
            # 업데이트할 데이터 구성 (새로운 모델 구조에 맞게)
            update_doc = ModifiedGoodsDetailODM(
                exchangeRateInfo=[rate.dict() for rate in request_data.exchangeRatesInfo],  # 리스트를 딕셔너리로 변환
                sellingPriceFormulaInfo=request_data.sellingPriceFormulaInfo.dict(),  # Pydantic 모델을 딕셔너리로 변환
                platformMarginRateInfo=request_data.platformMarginRateInfo.dict(),  # Pydantic 모델을 딕셔너리로 변환
                marginListByItems=request_data.marginListByItems.items[origin_goods_code].dict(),  # Pydantic 모델을 딕셔너리로 변환
                updatedAt=datetime.now(timezone.utc)
            )
            # ODMantic 모델을 딕셔너리로 변환
            update_data = update_doc.dict()   
                         
            # None 값이 아닌 필드만 포함
            update_data = {k: v for k, v in update_data.items() if v is not None}

            print(f"🔍 ModifiedGoodsDetail 업데이트 데이터: {origin_goods_code}")
            print(f"📊 업데이트할 필드: {list(update_data.keys())}")

            # ModifiedGoodsDetail 컬렉션 업데이트
            result = await modified_goods_collection.update_one(
                {"origin_goods_code": origin_goods_code},
                {"$set": update_data}
            )
            print(f"✅ ModifiedGoodsDetail 업데이트 완료: {origin_goods_code}, 수정된 문서 수: {result.modified_count}")            
            return result.modified_count > 0
                
        except Exception as e:
            raise DatabaseError(
                message=f"ModifiedGoodsDetail 업데이트 중 오류: {str(e)}",
                operation="update",
                collection="ModifiedGoodsDetail"
            )
    
    async def save_exchange_rates(self, exchange_rates_info: List[ExchangeRateInfo]) -> List[Dict[str, Any]]:
        """환율 데이터를 base_price_setting 컬렉션에 저장 (중복 방지)."""
        try:
            if not exchange_rates_info:
                raise ExchangeRateValidationError(
                    message="환율 데이터가 비어있습니다",
                    currency_code=None
                )
            
            # 인덱스 기반 환율 구조로 변환
            manuel_rates = []
            saved_rates = []
            
            # 지원되는 통화별로 환율 데이터 구성
            for i, currency in enumerate(SUPPORTED_CURRENCIES):
                if currency == DEFAULT_CURRENCY:
                    # KRW는 항상 1.0
                    manuel_rates.append({
                        "currencyCode": currency,
                        "appliedRate": DEFAULT_EXCHANGE_RATE
                    })
                    saved_rates.append({
                        "currencyCode": currency,
                        "appliedRate": DEFAULT_EXCHANGE_RATE,
                        "id": f"manuel_{i}"
                    })
                else:
                    # 다른 통화는 실제 입력값 사용 (새로운 모델 구조)
                    rate_info = next((rate for rate in exchange_rates_info if rate.currencyCode == currency), None)
                    applied_rate = rate_info.appliedRate if rate_info and rate_info.appliedRate > 0 else 0
                    
                    manuel_rates.append({
                        "currencyCode": currency,
                        "appliedRate": applied_rate
                    })
                    saved_rates.append({
                        "currencyCode": currency,
                        "appliedRate": applied_rate,
                        "id": f"manuel_{i}"
                    })
            
            return saved_rates
        except Exception as e:
            raise ExchangeRateValidationError(
                message=f"환율 저장 중 오류 발생: {str(e)}",
                currency_code=exchange_rates_info[0].currencyCode if exchange_rates_info else None
            )
    
    async def save_price_setting_data(self, request_data: PriceSettingRequest) -> PriceSettingResponse:
        """가격 설정 데이터를 저장합니다. 새로운 모델 구조에 맞게 수정."""
        try:
            # 입력 데이터 검증
            if not request_data.marginListByItems or not request_data.marginListByItems.items:
                raise DataIntegrityError(
                    message="마진 목록이 비어있습니다",
                    missing_fields=["marginListByItems"]
                )
            
            # 1. 환율 저장 (중복 방지)
            try:
                saved_rates = await self.save_exchange_rates(request_data.exchangeRatesInfo)
            except Exception as e:
                raise ExchangeRateError(
                    message=f"환율 저장 중 오류 발생: {str(e)}",
                    exchange_rates=request_data.exchangeRatesInfo
                )

            # 2. base_price_setting 컬렉션에 공통 정보 저장
            base_price_collection = self.setting_db.base_price_setting
            
            try:
                # BasePriceSettingODM 모델을 사용하여 문서 생성 및 검증
                base_doc = BasePriceSettingODM(
                    exchangeRateInfo=[rate.dict() for rate in request_data.exchangeRatesInfo],
                    sellingPriceFormulaInfo=request_data.sellingPriceFormulaInfo,
                    platformMarginRateInfo=request_data.platformMarginRateInfo,
                    updatedAt=datetime.now(timezone.utc)
                )
                
            except Exception as validation_error:
                # �� 디버깅: 모델 검증 실패 시 상세 정보 로깅
                print(f"❌ BasePriceSettingODM 모델 검증 실패: {str(validation_error)}")
                print(f"🔍 검증 실패한 데이터: exchangeRatesInfo={len(request_data.exchangeRatesInfo)}개, sellingPriceFormulaInfo={request_data.sellingPriceFormulaInfo}, platformMarginRateInfo={request_data.platformMarginRateInfo}")
                raise ModelValidationError(
                    message="BasePriceSetting 데이터 검증 실패",
                    model_name="BasePriceSettingODM",
                    field_errors={"validation_error": str(validation_error)}
                )
            
            # upsert 방식으로 저장/업데이트
            try:
                search_criteria = {"_id": "base_price_setting"}  # 고유 ID 사용
                
                result = await base_price_collection.update_one(
                    search_criteria,
                    {"$set": base_doc.dict()},
                    upsert=True
                )
                
            except Exception as e:
                # 🔍 디버깅: 데이터베이스 저장 실패 시 상세 정보 로깅
                print(f"❌ base_price_setting 저장 실패: {str(e)}")
                print(f"�� 저장하려던 데이터: {base_doc.dict()}")
                raise DatabaseError(
                    message=f"BasePriceSetting 저장 중 오류 발생: {str(e)}",
                    operation="update_one",
                    collection="base_price_setting"
                )
            
            # 3. ModifiedGoodsDetail 컬렉션 업데이트
            modified_goods_updated = 0
            
            for origin_goods_code in request_data.marginListByItems.items.keys():
                try:
                    success = await self.update_modified_goods_detail(origin_goods_code, request_data)
                    if success:
                        modified_goods_updated += 1
                except Exception as e:
                    # 개별 상품 업데이트 실패는 전체 프로세스를 중단하지 않음
                    logger.warning(f"상품 {origin_goods_code} ModifiedGoodsDetail 업데이트 실패: {str(e)}")
            
            return PriceSettingResponse(
                success=True,
                message="가격 설정 데이터 저장/업데이트 완료",
                updated_products_count=modified_goods_updated,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        except (DataIntegrityError, ModelValidationError, ExchangeRateError, DatabaseError) as validation_error:
            raise validation_error
        except Exception as e:
            # �� 디버깅: 예상치 못한 오류 시 상세 정보 로깅
            print(f"❌ 예상치 못한 오류: {str(e)}")
            print(f"�� 오류 타입: {type(e).__name__}")
            import traceback
            print(f"🔍 스택 트레이스: {traceback.format_exc()}")
            raise DatabaseError(
                message=f"가격 설정 데이터 저장 중 예상치 못한 오류 발생: {str(e)}",
                operation="save_price_setting_data",
                collection="base_price_setting"
            )

    async def load_modified_goods_detail(self, origin_goods_code: str) -> Optional[Dict[str, Any]]:
        """ModifiedGoodsDetail 컬렉션에서 데이터를 조회합니다."""
        try:
            if not origin_goods_code:
                raise ValidationError("상품 코드가 비어있습니다")
            
            # ModifiedGoodsDetail 컬렉션에서 데이터 조회
            modified_goods_collection = self.scrapmarket_db.ModifiedGoodsDetail
            search_criteria = {"origin_goods_code": origin_goods_code}
            # print(f"🔍 검색 조건: {search_criteria}")
            result = await modified_goods_collection.find_one(search_criteria)
            # print(f"🔍 find_one 결과: {result}")
            
            if result:
                if '_id' in result and isinstance(result['_id'], ObjectId):
                    result['_id'] = str(result['_id'])
                if 'id' in result and isinstance(result['id'], ObjectId):
                    result['id'] = str(result['id'])
                result['id'] = str(result['id'])
                # MongoDB ObjectId 제거
                if '_id' in result:
                    del result['_id']
                return result
            else:
                return None
            
        except Exception as e:
            raise DatabaseError(
                message=f"ModifiedGoodsDetail 조회 중 오류: {str(e)}",
                operation="find_one",
                collection="ModifiedGoodsDetail"
            )

    async def load_base_price_setting_info(self) -> Optional[Dict[str, Any]]:
        """BasePriceSetting 컬렉션에서 공통 가격 설정 정보를 조회합니다."""
        # import time
        # start_time = time.time()
        
        try:
            # print(f"🕐 [타임아웃 디버깅] load_base_price_setting_info 시작")
            
            # base_price_setting 컬렉션에서 데이터 조회
            base_price_collection = self.setting_db.base_price_setting
            
            # query_start = time.time()
            result = await base_price_collection.find_one(
                {"_id": "base_price_setting"}
            )
            # query_time = time.time() - query_start
            # print(f"🕐 [타임아웃 디버깅] find_one 쿼리 시간: {query_time:.3f}초")
            
            if result:
                # MongoDB ObjectId 제거
                if 'id' in result:
                    del result['id']
                # total_time = time.time() - start_time
                # print(f"🕐 [타임아웃 디버깅] load_base_price_setting_info 완료 (데이터 있음): {total_time:.3f}초")
                return result
            else:
                # total_time = time.time() - start_time
                # print(f"🕐 [타임아웃 디버깅] load_base_price_setting_info 완료 (데이터 없음): {total_time:.3f}초")
                return None
            
        except Exception as e:
            raise DatabaseError(
                message=f"BasePriceSetting 조회 중 오류: {str(e)}",
                operation="find_one",
                collection="base_price_setting"
            )

    async def save_base_setting(self, setting_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """BasePriceSetting 컬렉션에 공통 설정을 저장합니다."""
        try:
            if setting_type not in ['exchangeRate', 'formulaAndMargin']:
                raise ValidationError(f"유효하지 않은 설정 타입: {setting_type}")
            
            # base_price_setting 컬렉션 접근
            base_price_collection = self.setting_db.base_price_setting
            
            # 기존 데이터 조회
            existing_data = await base_price_collection.find_one({"_id": "base_price_setting"})
            
            if existing_data:
                # 기존 데이터 업데이트
                if setting_type == 'formulaAndMargin':
                    # formulaAndMargin의 경우 formula와 platformMargin을 분리하여 저장
                    update_data = {
                        "$set": {
                            "sellingPriceFormulaInfo": data.sellingPriceFormulaInfo,
                            "platformMarginRateInfo": data.platformMarginRateInfo,
                            "updatedAt": datetime.utcnow()
                        }
                    }
                else:
                    update_data = {"$set": {f"{setting_type}Info": data, "updatedAt": datetime.utcnow()}}
                
                await base_price_collection.update_one(
                    {"_id": "base_price_setting"},
                    update_data
                )
            else:
                # 새 데이터 생성
                if setting_type == 'formulaAndMargin':
                    new_data = {
                        "_id": "base_price_setting",
                        "sellingPriceFormulaInfo": data.sellingPriceFormulaInfo,
                        "platformMarginRateInfo": data.platformMarginRateInfo,
                        "updatedAt": datetime.utcnow()
                    }
                else:
                    new_data = {
                        "_id": "base_price_setting",
                        f"{setting_type}Info": data,
                        "updatedAt": datetime.utcnow()
                    }
                await base_price_collection.insert_one(new_data)
            
            return {
                "success": True,
                "message": f"{setting_type} 설정이 BasePriceSetting에 성공적으로 저장되었습니다.",
                "settingType": setting_type
            }
            
        except Exception as e:
            raise DatabaseError(
                message=f"BasePriceSetting 저장 중 오류: {str(e)}",
                operation="update_one" if existing_data else "insert_one",
                collection="base_price_setting"
            )

# 서비스 인스턴스 생성 함수
async def get_price_setting_service() -> PriceSettingService:
    """가격 설정 서비스 인스턴스 반환"""
    from app.services.service_mongodb import ensure_mongodb_connection
    await ensure_mongodb_connection()
    return PriceSettingService(mongodb_service.client)
