# path: app/models/model_price_setting.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.model_exchange_rate import PriceSettingExchangeRate, PriceSettingProductUpdate

class ProductPriceData(BaseModel):
    originGoodsCode: str = Field(..., description="원본 상품 코드", min_length=1)
    settingPrice: float = Field(..., description="설정할 가격", gt=0)
    
    # 🆕 마진 관련 필드들 (ModifiedGoodsDetail 업데이트용)
    expectedMargin: Optional[float] = Field(default=None, description="예상 마진")
    expectedMarginRate: Optional[float] = Field(default=None, description="예상 마진율 (%)")
    salesPrice: Optional[float] = Field(default=None, description="판매가 (sale_price 필드에 저장)")

    @validator('originGoodsCode')
    def validate_origin_goods_code(cls, v):
        if not v or not v.strip():
            raise ValueError('상품 코드는 비어있을 수 없습니다')
        return v.strip()

class PriceSettingRequest(BaseModel):
    exchangeRates: List[PriceSettingExchangeRate] = Field(..., description="환율 데이터 목록 (currencyCode, appliedRate, lastUpdated, source)")
    formulaSettings: Dict[str, Any] = Field(..., description="수식 설정 (필수)")
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