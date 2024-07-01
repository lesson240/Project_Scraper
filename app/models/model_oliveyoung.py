from odmantic import Model, Field
from typing import Dict, Optional
from pydantic import BaseModel


class BrandListModel(Model):
    idx: Optional[int]
    code: Optional[str]
    brand: Optional[str]
    status: Optional[str]
    collection_time: Optional[str]

    model_config = {"collection": "OYBrandList"}


class BrandShopModel(Model):
    idx: Optional[int]
    market: Optional[str]
    brand: Optional[str]
    brand_code: Optional[str]
    origin_goods_code: Optional[str]
    origin_goods_name: Optional[str]
    total_price: Optional[int]
    sold_out: Optional[str]
    sale: Optional[str]
    coupon: Optional[str]
    collection_time: Optional[str]

    model_config = {"collection": "OYBrandShop"}


class OriginGoodsDetailModel(Model):  # naming에 따른 연동된 코드 수정필요
    market: Optional[str] = Field(None)
    brand: Optional[str] = Field(None)
    brand_code: Optional[str] = Field(None)
    # goods_url: str
    origin_goods_code: Optional[str] = Field(None)
    origin_goods_name: Optional[str] = Field(None)
    total_price: Optional[int] = Field(None)
    goods_origin: Optional[int] = Field(None)
    sale_start: Optional[str] = Field(None)
    sale_end: Optional[str] = Field(None)
    sale_price: Optional[int] = Field(None)
    coupon_start: Optional[str] = Field(None)
    coupon_end: Optional[str] = Field(None)
    coupon_price: Optional[int] = Field(None)
    # goods_promotion: Dict[str, str]
    delivery: Dict[str, str] = Field(None)
    sold_out: Optional[str] = Field(None)
    option: Dict[str, str] = Field(None)
    thumb: Dict[str, str] = Field(None)
    collection_time: Optional[str] = Field(None)
    sale: Optional[str] = Field(None)
    coupon: Optional[str] = Field(None)

    model_config = {"collection": "OriginGoodsDetail"}


class GoodsDetailModel(Model):
    goods_code: Optional[str]
    name: Optional[str]
    total_price: Optional[int]
    goods_origin: Optional[int]
    sale_start: Optional[str]
    sale_end: Optional[str]
    sale_price: Optional[int]
    coupon_start: Optional[int]
    coupon_end: Optional[int]
    coupon_price: Optional[str]
    delivery: Optional[str]
    sold_out: Optional[str]
    thumb: Optional[str]
    collection_time: Optional[str]

    model_config = {"collection": "OriginGoodsDetail"}


class SpecialTodayModel(BaseModel):
    origin_goods_name: Optional[str]
    total_price: Optional[int]
    goods_origin: Optional[int]
