# 라이브러리 불러오기
from odmantic import Model, Field
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel


class BrandCodeRequestModel(BaseModel):
    brandCode: Optional[str]


class InputGoodsTableRequestModel(BaseModel):
    market: Optional[str]
    brand: Optional[str]
    brand_code: Optional[str]
    origin_goods_code: Optional[str]
    origin_goods_name: Optional[str]
    exposure_product_id: Optional[str]
    option_id: Optional[str]
    matching_option_id: Optional[str]
    stock_option: Optional[str]
    total_price: Optional[int]
    selling_price: Optional[int]
    winner_price: Optional[int]
    lowest_price: Optional[int]
    maximum_price: Optional[int]
    stock_status: Optional[str]
    promotion_period: Optional[str]


# 작성중
class InputGoodsManagementTableModel(Model):
    market: Optional[str] = Field(None)
    brand: Optional[str] = Field(None)
    brand_code: Optional[str] = Field(None)
    origin_goods_code: Optional[str] = Field(None)
    origin_goods_name: Optional[str] = Field(None)
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

    # options: Optional[List[Dict[str, str]]] = None

    model_config = {"collection": "ModifiedGoodsDetail"}


# 판매동기화 버튼 클릭 시 get BaseModel
class MatchingOptionIdModel(BaseModel):
    origin_goods_code: Optional[str] = Field(None)
    matching_option_id: Optional[str] = Field(None)
    brand_code: Optional[str] = Field(None)


# 수집동기화 버튼 클릭 시 get BaseModel
class OriginGoodsCodeModel(BaseModel):
    origin_goods_code: Optional[str]
