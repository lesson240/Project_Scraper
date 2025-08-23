# path: app/models/model_exchange_rate.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# 기본 환율 데이터 모델
class ExchangeRateBase(BaseModel):
    currencyCode: str
    appliedRate: float
    source: str  # 'customs' | 'koreaexim' | 'manual'
    rateType: str  # 'daily' | 'weekly'
    baseDate: str  # YYYYMMDD 형식
    isActive: bool = True

# 동기화 요청 모델 추가
class ExchangeRateSyncRequest(BaseModel):
    force_sync: bool = False  # 강제 동기화 여부

# 기본 응답 모델
class BaseResponse(BaseModel):
    success: bool
    message: str

# 환율 정보 응답
class ExchangeRateResponse(BaseResponse):
    data: Optional[List[ExchangeRateBase]] = None

# 동기화 응답 (기본 응답 확장)
class ExchangeRateSyncResponse(BaseResponse):
    data: Optional[List[Dict[str, Any]]] = None
    source: str  # 'cache' | 'api' | 'initialized'
    lastUpdated: datetime
    dailyRateDate: str
    weeklyTariffDate: str
    isDailyRateValid: bool
    isWeeklyTariffValid: bool

# 통합 환율 데이터 모델 (combined 엔드포인트용)
class CombinedExchangeRateData(BaseModel):
    currencyCode: str
    customs: Optional[Dict[str, Any]] = None
    koreaexim: Optional[Dict[str, Any]] = None

# 통합 환율 응답
class CombinedExchangeRateResponse(BaseResponse):
    data: Optional[List[CombinedExchangeRateData]] = None

# 가격 설정 모달용 환율 저장 모델
class PriceSettingExchangeRate(BaseModel):
    currency: str
    value: float
    datetime: datetime
    source: str = "price_setting_modal"
    isActive: bool = True

# 가격 설정 모달용 상품 업데이트 모델
class PriceSettingProductUpdate(BaseModel):
    originGoodsCode: str
    settingPrice: float
    calculatedPrice: Optional[Dict[str, Any]] = None
    exchangeRate: Optional[float] = None

# 가격 설정 모달 저장 요청 모델
class PriceSettingSaveRequest(BaseModel):
    exchangeRates: List[PriceSettingExchangeRate]
    updatedProducts: List[PriceSettingProductUpdate]
    formulaSettings: Optional[Dict[str, Any]] = None
    platformMargins: Optional[Dict[str, Any]] = None

# 가격 설정 모달 저장 응답 모델
class PriceSettingSaveResponse(BaseResponse):
    saved_exchange_rates: List[Dict[str, Any]]
    updated_products_count: int
    timestamp: datetime