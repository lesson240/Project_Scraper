# 라이브러리 불러오기
from odmantic import Model
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class InputGoodsTableRequest(BaseModel):
    market: str
    origin_goods_code: str
    origin_goods_name: str
    stock_option: str
    total_price: int
    selling_price: Optional[int]
    winner_price: Optional[int]
    lowest_price: Optional[int]
    maximum_price: Optional[int]
    stock_status: Optional[str]
    promotion_period: Optional[str]
    options: Optional[List[Dict[str, str]]] = None


# 작성중
class InputGoodsManagementTable(Model):
    market: str
    origin_goods_code: str
    origin_goods_name: str
    stock_option: str
    total_price: int
    selling_price: Optional[int]
    winner_price: Optional[int]
    lowest_price: Optional[int]
    maximum_price: Optional[int]
    stock_status: Optional[str]
    promotion_period: Optional[str]
    options: Optional[List[Dict[str, str]]] = None

    model_config = {"collection": "ModifiedGoodsDetail"}
