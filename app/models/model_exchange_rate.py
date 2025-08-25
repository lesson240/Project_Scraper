# path: app/models/model_exchange_rate.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

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
    currencyCode: str = Field(..., description="통화 코드 (예: USD, EUR, KRW)", min_length=1)
    appliedRate: float = Field(..., description="적용할 환율", gt=0)
    lastUpdated: str = Field(..., description="마지막 업데이트 시간 (YYYY-MM-DD 형식)")
    source: str = Field(..., description="데이터 소스 (manual, customs, koreaexim)")
    
    @validator('currencyCode')
    def validate_currency_code(cls, v):
        if not v or not v.strip() or v == 'undefined':
            raise ValueError('통화 코드는 비어있을 수 없습니다 (undefined 값 불가)')
        return v.strip().upper()
    
    @validator('appliedRate')
    def validate_applied_rate(cls, v):
        if v is None or v == 'undefined' or v <= 0:
            raise ValueError('환율은 0보다 큰 숫자여야 합니다 (undefined 값 불가)')
        return float(v)
    
    @validator('lastUpdated')
    def validate_last_updated(cls, v):
        # YYYY-MM-DD 형식 검증
        import re
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError(f'lastUpdated는 YYYY-MM-DD 형식이어야 합니다. 현재 값: {v}')
        return v
    
    @validator('source')
    def validate_source(cls, v):
        allowed_sources = ['manual', 'customs', 'koreaexim']
        if v not in allowed_sources:
            raise ValueError(f'소스는 다음 중 하나여야 합니다: {", ".join(allowed_sources)}')
        return v

# 가격 설정 모달용 상품 업데이트 모델
class PriceSettingProductUpdate(BaseModel):
    originGoodsCode: str = Field(..., description="원본 상품 코드", min_length=1)
    settingPrice: float = Field(..., description="설정할 가격", gt=0)
    calculatedPrice: Optional[Dict[str, Any]] = Field(None, description="계산된 가격 정보")
    exchangeRate: Optional[float] = Field(None, description="적용된 환율")
    
    @validator('originGoodsCode')
    def validate_origin_goods_code(cls, v):
        if not v or not v.strip():
            raise ValueError('상품 코드는 비어있을 수 없습니다')
        return v.strip()
    
    @validator('settingPrice')
    def validate_setting_price(cls, v):
        if v <= 0:
            raise ValueError('가격은 0보다 커야 합니다')
        return v

# 가격 설정 모달 저장 요청 모델
class PriceSettingSaveRequest(BaseModel):
    exchangeRates: List[PriceSettingExchangeRate] = Field(..., description="환율 데이터 목록")
    updatedProducts: List[PriceSettingProductUpdate] = Field(..., description="업데이트할 상품 가격 목록")
    formulaSettings: Optional[Dict[str, Any]] = Field(None, description="수식 설정")
    platformMargins: Optional[Dict[str, Any]] = Field(None, description="플랫폼 마진 설정")

# 가격 설정 모달 저장 응답 모델
class PriceSettingSaveResponse(BaseResponse):
    saved_exchange_rates: List[Dict[str, Any]] = Field(..., description="저장된 환율 정보")
    updated_products_count: int = Field(..., description="업데이트된 상품 수")
    timestamp: datetime = Field(..., description="처리 완료 시간")