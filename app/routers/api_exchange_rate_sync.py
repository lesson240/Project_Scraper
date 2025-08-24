# path: app/routers/api_exchange_rate_sync.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service
from app.services.service_customs import customs_service
from app.services.koreaexim_service import koreaexim_service
from app.services.service_exchange_rate import exchange_rate_service
# 공통 모델 import로 변경
from app.models.model_exchange_rate import (
    ExchangeRateBase,
    ExchangeRateSyncResponse,
    ExchangeRateSyncRequest
)

import logging

# 로깅 설정
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/exchange-rate-sync", tags=["ExchangeRateSync"])

# 데이터베이스 의존성
async def get_db() -> AsyncIOMotorClient:
    return mongodb_service.client

class ExchangeRateSyncService:
    def __init__(self):
        self.last_sync_date = ""
        self.daily_api_call_count = 0
        self.weekly_api_call_count = 0
        self.MAX_DAILY_API_CALLS = 1

    def get_today_date(self) -> str:
        """오늘 날짜를 YYYYMMDD 형식으로 반환"""
        return datetime.now().strftime("%Y%m%d")

    def validate_date(self, stored_date: str, today_date: str) -> bool:
        """날짜 유효성 검증"""
        return stored_date == today_date

    def can_call_api(self, rate_type: str) -> bool:
        """API 호출 가능 여부 확인"""
        today = self.get_today_date()
        
        # 날짜가 바뀌었으면 카운트 초기화
        if self.last_sync_date != today:
            self.last_sync_date = today
            self.daily_api_call_count = 0
            self.weekly_api_call_count = 0
        
        if rate_type == 'daily':
            return self.daily_api_call_count < self.MAX_DAILY_API_CALLS
        else:
            return self.weekly_api_call_count < self.MAX_DAILY_API_CALLS

    def increment_api_call_count(self, rate_type: str):
        """API 호출 카운트 증가"""
        if rate_type == 'daily':
            self.daily_api_call_count += 1
        else:
            self.weekly_api_call_count += 1

    async def ensure_collections_exist(self, db: AsyncIOMotorClient):
        """필요한 컬렉션들이 존재하는지 확인하고 없으면 생성"""
        try:
            # 공통 서비스 사용
            await exchange_rate_service.ensure_collections_exist(db)
            logger.info("필요한 컬렉션들이 확인/생성되었습니다.")
        except Exception as e:
            logger.error(f"컬렉션 생성 실패: {e}")
            raise

    async def initialize_exchange_rate_data(self, db: AsyncIOMotorClient):
        """초기 환율 데이터 생성 (MongoDB에 데이터가 전혀 없는 경우)"""
        try:
            logger.info("초기 환율 데이터 생성을 시작합니다...")
            
            today = self.get_today_date()
            
            # 기본 통화별 초기 환율 데이터
            default_rates = [
                {"currencyCode": "USD", "appliedRate": 1350, "source": "manual", "rateType": "daily", "baseDate": today, "isActive": True},
                {"currencyCode": "EUR", "appliedRate": 1350, "source": "manual", "rateType": "daily", "baseDate": today, "isActive": True},
                {"currencyCode": "JPY", "appliedRate": 9.2, "source": "manual", "rateType": "daily", "baseDate": today, "isActive": True},
                {"currencyCode": "CNY", "appliedRate": 185, "source": "manual", "rateType": "daily", "baseDate": today, "isActive": True},
                {"currencyCode": "USD", "appliedRate": 1350, "source": "manual", "rateType": "weekly", "baseDate": today, "isActive": True},
                {"currencyCode": "EUR", "appliedRate": 1480, "source": "manual", "rateType": "weekly", "baseDate": today, "isActive": True},
                {"currencyCode": "JPY", "appliedRate": 9.2, "source": "manual", "rateType": "weekly", "baseDate": today, "isActive": True},
                {"currencyCode": "CNY", "appliedRate": 185, "source": "manual", "rateType": "weekly", "baseDate": today, "isActive": True}
            ]
            
            # MongoDB에 저장
            await db.exchange_rates.insert_many(default_rates)
            
            logger.info("초기 환율 데이터 생성이 완료되었습니다.")
        except Exception as e:
            logger.error(f"초기 환율 데이터 생성 실패: {e}")
            raise

    async def sync_exchange_rates(self, db: AsyncIOMotorClient, force_sync: bool = False) -> ExchangeRateSyncResponse:
        """환율 데이터 동기화 (메인 메서드)"""
        try:
            today = self.get_today_date()
            
            # 1. 컬렉션 존재 여부 확인 및 생성
            await self.ensure_collections_exist(db)
            
            # 2. 기존 데이터 조회
            stored_rates = await db.exchange_rates.find({"isActive": True}).to_list(length=100)
            
            # 3. 데이터가 없으면 초기 데이터 생성
            if not stored_rates:
                await self.initialize_exchange_rate_data(db)
                stored_rates = await db.exchange_rates.find({"isActive": True}).to_list(length=100)
            
            # 4. 날짜 유효성 검증
            daily_rates = [r for r in stored_rates if r['rateType'] == 'daily']
            weekly_rates = [r for r in stored_rates if r['rateType'] == 'weekly']
            
            daily_date = daily_rates[0]['baseDate'] if daily_rates else ""
            weekly_date = weekly_rates[0]['baseDate'] if weekly_rates else ""
            
            is_daily_valid = self.validate_date(daily_date, today)
            is_weekly_valid = self.validate_date(weekly_date, today)
            
            # 5. 동기화 필요 여부 확인
            needs_daily_sync = not is_daily_valid or force_sync
            needs_weekly_sync = not is_weekly_valid or force_sync
            
            sync_messages = []
            
            # 6. 일일고시환율 동기화
            if needs_daily_sync and self.can_call_api('daily'):
                try:
                    new_daily_rates = await koreaexim_service.get_exchange_rates(today)
                    
                    # 기존 데이터 비활성화
                    await db.exchange_rates.update_many(
                        {"rateType": "daily", "isActive": True},
                        {"$set": {"isActive": False}}
                    )
                    
                    # 새 데이터 저장
                    for rate in new_daily_rates:
                        rate['baseDate'] = today
                        rate['isActive'] = True
                        await db.exchange_rates.insert_one(rate)
                    
                    self.increment_api_call_count('daily')
                    sync_messages.append('일일고시환율 동기화 완료')
                    
                    # 업데이트된 데이터 조회
                    daily_rates = await db.exchange_rates.find({"rateType": "daily", "isActive": True}).to_list(length=100)
                    is_daily_valid = True
                except Exception as e:
                    logger.error(f"일일고시환율 동기화 실패: {e}")
                    sync_messages.append('일일고시환율 동기화 실패')
            else:
                sync_messages.append('일일고시환율 캐시 사용')
            
            # 7. 관세주간환율 동기화
            if needs_weekly_sync and self.can_call_api('weekly'):
                try:
                    new_weekly_rates = await customs_service.get_exchange_rates(today)
                    
                    # 기존 데이터 비활성화
                    await db.exchange_rates.update_many(
                        {"rateType": "weekly", "isActive": True},
                        {"$set": {"isActive": False}}
                    )
                    
                    # 새 데이터 저장
                    for rate in new_weekly_rates:
                        rate['baseDate'] = today
                        rate['isActive'] = True
                        await db.exchange_rates.insert_one(rate)
                    
                    self.increment_api_call_count('weekly')
                    sync_messages.append('관세주간환율 동기화 완료')
                    
                    # 업데이트된 데이터 조회
                    weekly_rates = await db.exchange_rates.find({"rateType": "weekly", "isActive": True}).to_list(length=100)
                    is_weekly_valid = True
                except Exception as e:
                    logger.error(f"관세주간환율 동기화 실패: {e}")
                    sync_messages.append('관세주간환율 동기화 실패')
            else:
                sync_messages.append('관세주간환율 캐시 사용')
            
            # 8. 통합된 환율 데이터 생성
            integrated_rates = self.integrate_exchange_rates(daily_rates, weekly_rates)
            
            return ExchangeRateSyncResponse(
                success=True,
                data=integrated_rates,
                message=", ".join(sync_messages),
                source="api" if (needs_daily_sync or needs_weekly_sync) else "cache",
                lastUpdated=datetime.now(),
                dailyRateDate=daily_date,
                weeklyTariffDate=weekly_date,
                isDailyRateValid=is_daily_valid,
                isWeeklyTariffValid=is_weekly_valid
            )
            
        except Exception as e:
            logger.error(f"환율 데이터 동기화 실패: {e}")
            raise HTTPException(status_code=500, detail=f"환율 데이터 동기화 실패: {str(e)}")

    def integrate_exchange_rates(self, daily_rates: List[Dict], weekly_rates: List[Dict]) -> List[Dict[str, Any]]:
        """일일고시환율과 관세주간환율 데이터 통합"""
        currency_map = {}
        
        # 일일고시환율 데이터 매핑
        for rate in daily_rates:
            currency_map[rate['currencyCode']] = {
                "currency": rate['currencyCode'],
                "dailyRate": rate.get('exchangeRate', rate.get('appliedRate', 0)),
                "weeklyTariff": 0,
                "appliedRate": rate.get('exchangeRate', rate.get('appliedRate', 0))
            }
        
        # 관세주간환율 데이터 매핑
        for rate in weekly_rates:
            if rate['currencyCode'] in currency_map:
                existing = currency_map[rate['currencyCode']]
                existing['weeklyTariff'] = rate.get('exchangeRate', rate.get('appliedRate', 0))
                existing['appliedRate'] = rate.get('exchangeRate', rate.get('appliedRate', 0))
            else:
                currency_map[rate['currencyCode']] = {
                    "currency": rate['currencyCode'],
                    "dailyRate": 0,
                    "weeklyTariff": rate.get('exchangeRate', rate.get('appliedRate', 0)),
                    "appliedRate": rate.get('exchangeRate', rate.get('appliedRate', 0))
                }
        
        return list(currency_map.values())

# 서비스 인스턴스 생성
exchange_rate_sync_service = ExchangeRateSyncService()

@router.post("/sync", response_model=ExchangeRateSyncResponse)
async def sync_exchange_rates(
    request: ExchangeRateSyncRequest,
    db: AsyncIOMotorClient = Depends(get_db)
):
    """환율 데이터 동기화 엔드포인트"""
    return await exchange_rate_sync_service.sync_exchange_rates(db, request.force_sync)

@router.get("/status")
async def get_sync_status():
    """동기화 상태 조회"""
    service = exchange_rate_sync_service
    return {
        "dailyApiCallCount": service.daily_api_call_count,
        "weeklyApiCallCount": service.weekly_api_call_count,
        "maxDailyApiCalls": service.MAX_DAILY_API_CALLS,
        "lastSyncDate": service.last_sync_date,
        "today": service.get_today_date()
    }