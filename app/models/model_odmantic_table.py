# 라이브러리 불러오기
from odmantic import Model, Field

# from datetime import datetime
from typing import Optional, List, Dict, Any


# class InputGoodsTableRequestModel(BaseModel):
#     market: Optional[str]
#     brand: Optional[str]
#     brand_code: Optional[str]
#     origin_goods_code: Optional[str]
#     origin_goods_name: Optional[str]
#     exposure_product_id: Optional[str]
#     option_id: Optional[str]
#     matching_option_id: Optional[str]
#     stock_option: Optional[str]
#     total_price: Optional[int]
#     selling_price: Optional[int]
#     winner_price: Optional[int]
#     lowest_price: Optional[int]
#     maximum_price: Optional[int]
#     stock_status: Optional[str]
#     promotion_period: Optional[str]


# 작성중
class InputGoodsManagementTableModel(Model):
    market: Optional[str] = Field(None)
    brand_name: Optional[str] = Field(None)
    brand_code: Optional[str] = Field(None)
    origin_goods_code: Optional[str] = Field(None)
    origin_goods_name: Optional[str] = Field(None)
    modified_goods_name: Optional[str] = Field(None)
    exposure_product_id: Optional[str] = Field(None)
    option_id: Optional[str] = Field(None)
    matching_option_id: Optional[str] = Field(None)
    stock_option: Optional[str] = Field(None)
    total_price: Optional[int] = Field(None)
    selling_price: Optional[int] = Field(None)
    winner_price: Optional[int] = Field(None)
    lowest_price: Optional[int] = Field(None)
    maximum_price: Optional[int] = Field(None)
    stock_status: Optional[str] = Field(None)
    promotion_period: Optional[str] = Field(None)
    winner_delivery: Optional[str] = Field(None)
    winner_deliveryday: Optional[int] = Field(None)
    sale: Optional[str] = Field(None)
    sold_out: Optional[str] = Field(None)
    goods_origin: Optional[int] = Field(None)
    sale_start: Optional[str] = Field(None)
    sale_end: Optional[str] = Field(None)
    sale_price: Optional[int] = Field(None)
    coupon_start: Optional[str] = Field(None)
    coupon_end: Optional[str] = Field(None)
    coupon_price: Optional[int] = Field(None)
    group_name: Optional[str] = Field(None)
    memo: Optional[str] = Field(None)
    thumb: Dict[str, str] = Field(None)

    # 🆕 가격 설정 관련 필드들 추가 (ModifiedGoodsDetail 업데이트용)
    basePrice: Optional[float] = Field(None, description="기본 가격")
    exchangeRate: Optional[float] = Field(None, description="환율")
    exchangeRates: Optional[Dict[str, Any]] = Field(None, description="환율 데이터")
    formulaSettings: Optional[Dict[str, Any]] = Field(None, description="공식 설정")
    marginList: Optional[Dict[str, Any]] = Field(None, description="마진 목록")
    platformMargins: Optional[Dict[str, Any]] = Field(None, description="플랫폼별 마진 설정")

    # options: Optional[List[Dict[str, str]]] = None

    model_config = {"collection": "ModifiedGoodsDetail"}
