# 라이브러리 불러오기
from odmantic import Model
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class BrandCodeRequestModel(BaseModel):
    brandCode: str


class InputGoodsTableRequestModel(BaseModel):
    market: str
    brand: str
    brand_code: str
    origin_goods_code: str
    origin_goods_name: str
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
    market: str
    brand: str
    brand_code: str
    origin_goods_code: str
    origin_goods_name: str
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
    winner_deliveryday: int

    # options: Optional[List[Dict[str, str]]] = None

    model_config = {"collection": "ModifiedGoodsDetail"}


class MatchingOptionIdModel(BaseModel):
    origin_goods_code: str
    matching_option_id: str
