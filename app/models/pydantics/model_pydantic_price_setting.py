# path: app/models/pydantic/model_pydantic_price_setting.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# 🆕 1. 수동 환율 정보 모델
class ExchangeRateInfo(BaseModel):
    """환율 데이터 모델 - API 요청과 내부 모델 모두에서 사용"""
    currencyCode: str = Field(..., description="통화 코드 (예: USD, EUR, JPY)")
    appliedRate: float = Field(..., description="적용 환율", gt=0)
    lastUpdated: str = Field(..., description="마지막 업데이트 날짜 (ISO 8601 형식)")
    source: str = Field(..., description="데이터 소스 (예: manual, api)")

# 🆕 2. 판매가 공식 정보 모델
class SellingPriceFormulaInfo(BaseModel):
    """공식 설정 모델 - 기본 마진율, 추가 마진, 배송비 등"""
    baseMarginRate: float = Field(..., description="기본 마진율 (%)", ge=0, le=100)
    additionalMargin: float = Field(..., description="추가 마진", ge=0)
    baseShippingFee: float = Field(default=0, description="기본 배송비", ge=0)
    returnShippingFee: float = Field(default=0, description="반품 배송비", ge=0)
    exchangeShippingFee: float = Field(default=0, description="교환 배송비", ge=0)
    internationalShippingFee: float = Field(default=0, description="국제 운송료", ge=0)
    freeShipping: bool = Field(default=False, description="무료 배송 여부")
    optimizeShippingFee: bool = Field(default=False, description="배송비 최적화 여부")

# 🆕 3. 플랫폼별 마진율 모델
class PlatformMarginRateInfo(BaseModel):
    """플랫폼별 마진율 모델 - 각 플랫폼의 마진율 설정"""
    smartstore: float = Field(..., description="스마트스토어 마진율 (%)", ge=0, le=100)
    coupang: float = Field(..., description="쿠팡 마진율 (%)", ge=0, le=100)
    auction: float = Field(..., description="옥션 마진율 (%)", ge=0, le=100)
    gmarket: float = Field(..., description="지마켓 마진율 (%)", ge=0, le=100)
    elevenst: float = Field(..., description="11번가 마진율 (%)", ge=0, le=100)
    openmarket: float = Field(..., description="오픈마켓 마진율 (%)", ge=0, le=100)


# 🆕 4. 플랫폼별 계산된 마진 정보 모델 (ModifiedGoodsDetail 컬렉션 업데이트용)
# Item별 > Platform별 > CalculatedItemInfo 순으로 dict화
class CalculatedItemInfo(BaseModel):
    """플랫폼별 계산된 마진 정보 - 예상 마진, 마진율, 판매가"""
    ExpectedMargin: float = Field(..., description="예상 마진", ge=0)
    ExpectedMarginRate: float = Field(..., description="예상 마진율 (%)", ge=0, le=100)
    selling_price: float = Field(..., description="판매가", gt=0)

    @validator('ExpectedMargin', 'ExpectedMarginRate', 'selling_price')
    def validate_positive_values(cls, v):
        if v < 0:
            raise ValueError('값은 0 이상이어야 합니다')
        return v

    @validator("ExpectedMarginRate", pre=True, always=True)
    def coerce_rate(cls, v):
        return float(v)

# 🆕 5. 플랫폼별 마진 정보를 Dict화
class PlatformMargins(BaseModel):
    # 플랫폼 → CalculatedItemInfo 매핑
    smartstore: CalculatedItemInfo = Field(..., description="스마트스토어 마진 정보")
    coupang: CalculatedItemInfo = Field(..., description="쿠팡 마진 정보")
    auction: CalculatedItemInfo = Field(..., description="옥션 마진 정보")
    gmarket: CalculatedItemInfo = Field(..., description="지마켓 마진 정보")
    elevenst: CalculatedItemInfo = Field(..., description="11번가 마진 정보")
    openmarket: CalculatedItemInfo = Field(..., description="오픈마켓 마진 정보")

# 🆕 6. 전체 마진 목록을 originGoodsCode 기준으로 Dict화
class MarginListByItems(BaseModel):
    """상품별 플랫폼 마진 목록 - originGoodsCode → 플랫폼별 마진 정보"""
    items: Dict[str, PlatformMargins] = Field(
        ..., description="상품별 플랫폼 마진 목록: originGoodsCode → 플랫폼별 마진 정보"
    )

    @validator("items")
    def must_have_items(cls, v):
        if not v:
            raise ValueError("최소 1개 이상의 상품 마진 결과가 필요합니다")
        return v

MarginList = Dict[str, Dict[str, CalculatedItemInfo]]


# 🆕 7. 1~3 priceSettingInfo를 모델링 (base_price_setting 컬렉션 업데이트용)
class BasePriceSettingDocument(BaseModel):
    """base_price_setting 컬렉션 문서 모델 - MongoDB 저장용"""
    exchangeRateInfo: ExchangeRateInfo = Field(..., description="환율 데이터")
    sellingPriceFormulaInfo: SellingPriceFormulaInfo = Field(..., description="공식 설정")
    platformMarginRateInfo: PlatformMarginRateInfo = Field(..., description="플랫폼별 마진")
    updatedAt: datetime = Field(..., description="업데이트 시간")

    @validator('exchangeRateInfo')
    def validate_exchange_rate_info(cls, v):
        if not v:
            raise ValueError('환율 정보는 비어있을 수 없습니다')
        return v

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        # 🆕 추가 검증 활성화
        validate_assignment = True
        extra = "forbid"  # 추가 필드 금지


# 🆕 8. 가격 설정 요청 모델 (API 요청과 내부 모델 모두에서 사용)
class PriceSettingRequest(BaseModel):
    """가격 설정 요청 모델 - API 요청과 내부 서비스 모두에서 사용"""
    exchangeRatesInfo: List[ExchangeRateInfo] = Field(..., description="환율 데이터 목록", min_items=1)
    sellingPriceFormulaInfo: SellingPriceFormulaInfo = Field(..., description="공식 설정")
    platformMarginRateInfo: PlatformMarginRateInfo = Field(..., description="플랫폼별 마진 설정")
    marginListByItems: MarginListByItems = Field(..., description="상품별 플랫폼 마진 목록")

    @validator('marginListByItems')
    def validate_margin_list(cls, v):
        if not v or not v.items:
            raise ValueError('마진 목록은 비어있을 수 없습니다')
        return v
    
    @validator('exchangeRatesInfo')
    def validate_exchange_rates(cls, v):
        if not v:
            raise ValueError('환율 데이터는 비어있을 수 없습니다')
        # 통화 코드 중복 검사
        currency_codes = [rate.currencyCode for rate in v]
        if len(currency_codes) != len(set(currency_codes)):
            raise ValueError('중복된 통화 코드가 있습니다')
        return v

# 🆕 9. 가격 설정 응답 모델
class PriceSettingResponse(BaseModel):
    """가격 설정 응답 모델 - API 응답용"""
    success: bool = Field(..., description="처리 성공 여부")
    message: str = Field(..., description="처리 결과 메시지")
    updated_products_count: int = Field(..., description="업데이트된 상품 수", ge=0)
    timestamp: str = Field(..., description="처리 완료 시간")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# 🆕 10. ModifiedGoodsDetail 컬렉션 업데이트용 모델
class ModifiedGoodsDetailUpdate(BaseModel):
    """ModifiedGoodsDetail 컬렉션 업데이트용 모델"""
    exchangeRateInfo: ExchangeRateInfo = Field(..., description="업데이트할 환율 정보")
    sellingPriceFormulaInfo: SellingPriceFormulaInfo = Field(..., description="업데이트할 공식 설정")
    platformMarginRateInfo: PlatformMarginRateInfo = Field(..., description="업데이트할 플랫폼별 마진율")
    platformMargins: PlatformMargins = Field(..., description="업데이트할 플랫폼별 계산된 마진 정보")
    updatedAt: datetime = Field(..., description="업데이트 시간")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }