from odmantic import Model


class BrandListModel(Model):
    idx: int
    code: str
    brand: str
    status: str
    collection_time: str

    model_config = {"collection": "OYBrandList"}


class BrandShopModel(Model):
    idx: int
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

    model_config = {"collection": "OYGoodsDetail"}
