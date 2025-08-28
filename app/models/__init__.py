# path: app/models/__init__.py
# 🆕 Pydantic 모델들
from .pydantics.model_pydantic_price_setting import (
    BasePriceSettingDocument,
    PriceSettingRequest,
    PriceSettingResponse,
    CalculatedItemInfo,
    SellingPriceFormulaInfo,
    PlatformMarginRateInfo,
    ExchangeRateInfo,
    PlatformMargins,
    MarginListByItems,
    ModifiedGoodsDetailUpdate
)

# 🆕 ODMantic 모델들
from .odmantics.model_odmantic_price_setting import (
    BasePriceSettingODM,
    ModifiedGoodsDetailODM,
    ExchangeRateODM
)

# 🆕 기존 모델들 (하위 호환성 유지)
from .model_exchange_rate import (
    PriceSettingExchangeRate,
    PriceSettingProductUpdate
)

__all__ = [
    # Pydantic 모델
    'BasePriceSettingDocument',
    'PriceSettingRequest', 
    'PriceSettingResponse',
    'CalculatedItemInfo',
    'SellingPriceFormulaInfo',
    'PlatformMarginRateInfo',
    'ExchangeRateInfo',
    'PlatformMargins',
    'MarginListByItems',
    'ModifiedGoodsDetailUpdate',
    
    # ODMantic 모델
    'BasePriceSettingODM',
    'ModifiedGoodsDetailODM',
    'ExchangeRateODM',
    
    # 기존 모델
    'PriceSettingExchangeRate',
    'PriceSettingProductUpdate'
]
