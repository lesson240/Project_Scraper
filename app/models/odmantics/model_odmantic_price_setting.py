# path: app/models/odmantic/model_odmantic_price_setting.py
from odmantic import Model, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.pydantics.model_pydantic_price_setting import ExchangeRateInfo, PlatformMarginRateInfo, SellingPriceFormulaInfo

class BasePriceSettingODM(Model):
    """base_price_setting 컬렉션용 ODMantic 모델"""
    exchangeRateInfo: List[Dict[str, Any]] = Field(..., description="환율 정보 리스트")
    sellingPriceFormulaInfo: SellingPriceFormulaInfo = Field(..., description="공식 설정")
    platformMarginRateInfo: PlatformMarginRateInfo = Field(..., description="플랫폼별 마진율")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, description="업데이트 시간")

class ModifiedGoodsDetailODM(Model):
    """ModifiedGoodsDetail 컬렉션용 ODMantic 모델"""
    exchangeRateInfo: List[Dict[str, Any]] = Field(..., description="환율 정보 리스트")
    sellingPriceFormulaInfo: SellingPriceFormulaInfo = Field(..., description="공식 설정")
    platformMarginRateInfo: PlatformMarginRateInfo = Field(..., description="플랫폼별 마진율")
    marginListByItems: Dict[str, Any] = Field(..., description="플랫폼별 계산된 마진 정보")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, description="업데이트 시간")

class ExchangeRateODM(Model):
    """환율 데이터용 ODMantic 모델"""
    currencyCode: str = Field(..., description="통화 코드")
    appliedRate: float = Field(..., description="적용 환율", gt=0)
    lastUpdated: str = Field(..., description="마지막 업데이트 날짜")
    source: str = Field(..., description="데이터 소스")

