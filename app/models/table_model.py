# 라이브러리 불러오기
from odmantic import Model
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


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
    winner_delivery: Optional[str]
    winner_deliveryday: Optional[int]
    sale: Optional[str]
    sold_out: Optional[str]
    goods_origin: Optional[int]
    sale_start: Optional[str]
    sale_end: Optional[str]
    sale_price: Optional[int]
    coupon_start: Optional[str]
    coupon_end: Optional[str]
    coupon_price: Optional[int]

    # options: Optional[List[Dict[str, str]]] = None

    model_config = {"collection": "ModifiedGoodsDetail"}


# 판매동기화 버튼 클릭 시 get BaseModel
class MatchingOptionIdModel(BaseModel):
    origin_goods_code: Optional[str]
    matching_option_id: Optional[str]
    brand_code: Optional[str]


# 수집동기화 버튼 클릭 시 get BaseModel
class OriginGoodsCodeModel(BaseModel):
    origin_goods_code: Optional[str]
