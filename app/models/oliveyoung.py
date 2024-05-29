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
    code: str
    name: str
    price: int
    sold_out: str
    sale: str
    coupon: str
    collection_time: str

    model_config = {"collection": "OYBrandShop"}


class GoodsDetailModel(Model):
    code: str
    name: str
    goods_origin: int
    sale_price: int
    total_price: int
    sale_start: str
    sale_end: str
    delivery: str
    sold_out: str
    thumb: str
    collection_time: str

    model_config = {"collection": "OYGoodsDetail"}
