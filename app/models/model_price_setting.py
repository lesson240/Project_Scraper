# path: app/models/model_price_setting.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.model_exchange_rate import PriceSettingExchangeRate, PriceSettingProductUpdate

# 🆕 플랫폼별 마진 데이터 구조 정의
class PlatformMarginInfo(BaseModel):
    """플랫폼별 마진 정보"""
    ExpectedMargin: float = Field(..., description="예상 마진")
    ExpectedMarginRate: float = Field(..., description="예상 마진율 (%)")
    selling_price: float = Field(..., description="판매가")

class ProductPriceData(BaseModel):
    originGoodsCode: str = Field(..., description="원본 상품 코드", min_length=1)
    settingPrice: float = Field(..., description="설정할 가격", gt=0)
    
    # 🆕 마진 관련 필드들 (ModifiedGoodsDetail 업데이트용)
    mainExpectedMargin: Optional[float] = Field(default=None, description="메인 예상 마진")
    mainExpectedMarginRate: Optional[float] = Field(default=None, description="메인 예상 마진율 (%)")
    salesPrice: Optional[float] = Field(default=None, description="판매가 (sale_price 필드에 저장)")

    @validator('originGoodsCode')
    def validate_origin_goods_code(cls, v):
        if not v or not v.strip():
            raise ValueError('상품 코드는 비어있을 수 없습니다')
        return v.strip()

class PlatformMarginData(BaseModel):
    """플랫폼별 마진 데이터"""
    expectedMargin: float = Field(..., description="플랫폼별 예상 마진")
    expectedMarginRate: float = Field(..., description="플랫폼별 예상 마진율 (%)")

class CalculatedProductData(BaseModel):
    """계산된 상품 데이터"""
    originGoodsCode: str = Field(..., description="원본 상품 코드")
    basePrice: float = Field(..., description="기본 가격")
    originalPrice: float = Field(..., description="원본 가격")
    exchangeRate: float = Field(..., description="환율")
    
    # 🆕 marginList 구조를 구체적으로 정의 (selling_price 포함)
    marginList: Dict[str, PlatformMarginInfo] = Field(..., description="마진 목록 (main, coupang, auction, gmarket, elevenst) - ExpectedMargin, ExpectedMarginRate, selling_price 포함")
    
    # 🆕 각 플랫폼별 마진 정보를 marginList로 통합
    # mainExpectedMargin, mainExpectedMarginRate는 marginList.main에서 관리
    # 기존 개별 플랫폼 필드들은 제거하고 marginList로 통합

class PriceSettingRequest(BaseModel):
    exchangeRates: List[PriceSettingExchangeRate] = Field(..., description="환율 데이터 목록 (currencyCode, appliedRate, lastUpdated, source)")
    formulaSettings: Dict[str, Any] = Field(..., description="수식 설정 (필수)")
    platformMargins: Dict[str, float] = Field(..., description="플랫폼별 마진 설정")
    calculatedProducts: List[CalculatedProductData] = Field(..., description="계산된 상품 가격 목록")
    updatedProducts: Optional[List[ProductPriceData]] = Field(default=[], description="업데이트할 상품 가격 목록 (선택적)")
    originGoodsCode: str = Field(..., description="원본 상품 코드")
    
    # 🆕 통합된 필드들 (base_price_setting 컬렉션용)
    baseSellingPriceFormula: Optional[Dict[str, Any]] = Field(default={}, description="기본 판매가 공식 설정")
    additionalSellingPriceFormula: Optional[Dict[str, Any]] = Field(default={}, description="추가 판매가 공식 설정")

class PriceSettingResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    message: str = Field(..., description="처리 결과 메시지")
    saved_exchange_rates: List[dict] = Field(..., description="저장된 환율 정보")
    updated_products_count: int = Field(..., description="업데이트된 상품 수")
    timestamp: datetime = Field(..., description="처리 완료 시간")