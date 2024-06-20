from odmantic import Model
from typing import Dict, Optional


class BrandListModel(Model):
    idx: int
    code: str
    brand: str
    status: str
    collection_time: str

    model_config = {"collection": "OYBrandList"}


class BrandShopModel(Model):
    idx: int
    market: str
    brand: str
    brand_code: str
    code: str
    name: str
    price: int
    sold_out: str
    sale: str
    coupon: str
    collection_time: str

    model_config = {"collection": "OYBrandShop"}


class OriginGoodsDetailModel(Model):  # naming에 따른 연동된 코드 수정필요
    market: str
    brand: str
    brand_code: str
    # goods_url: str
    origin_goods_code: str
    origin_goods_name: str
    total_price: int
    goods_origin: int
    sale_start: Optional[str]
    sale_end: Optional[str]
    sale_price: Optional[int]
    coupon_start: Optional[str]
    coupon_end: Optional[str]
    coupon_price: Optional[int]
    # goods_promotion: Dict[str, str]
    delivery: Dict[str, str]
    sold_out: str
    option: Dict[str, str]
    thumb: Dict[str, str]
    collection_time: str
    sale: str
    coupon: str

    model_config = {"collection": "OriginGoodsDetail"}


class GoodsDetailModel(Model):
    goods_code: str
    name: str
    total_price: int
    goods_origin: int
    sale_start: str
    sale_end: str
    sale_price: int
    coupon_start: int
    coupon_end: int
    coupon_price: str
    delivery: str
    sold_out: str
    thumb: str
    collection_time: str

    model_config = {"collection": "OriginGoodsDetail"}
