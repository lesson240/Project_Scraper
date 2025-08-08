from app.models.model_odmantic_table import InputGoodsManagementTableModel
from app.models.model_odmantic_oliveyoung import OriginGoodsDetailModel


def build_base_filters(inquiry):
    def expr(field, value):
        return {
            "$expr": {
                "$regexMatch": {
                    "input": {"$toString": f"${field}"},
                    "regex": value,
                    "options": "i"
                }
            }
        }
    filters = {}
    if inquiry.brand_code: filters.update(expr("brand_code", inquiry.brand_code))
    if inquiry.brand_name: filters.update(expr("brand_name", inquiry.brand_name))
    if inquiry.group_name: filters.update(expr("group_name", inquiry.group_name))
    if inquiry.memo_name:  filters.update(expr("memo", inquiry.memo_name))
    if inquiry.origin_goods_code: filters.update(expr("origin_goods_code", inquiry.origin_goods_code))
    if inquiry.origin_goods_name: filter.update(expr("origin_goods_name", inquiry.origin_goods_name))
    return filters

async def merge_results(inquiry, management_goods, base_filters):
    codes = {item.get("origin_goods_code") for item in management_goods}
    extra_filter = base_filters.copy()
    if codes:
        extra_filter["origin_goods_code"] = {"$nin": list(codes)}
    detail_goods = await inquiry._search_in_origin_detail(extra_filter)
    return management_goods + detail_goods

async def query_all_goods():
    from app.services.service_upload import mongodb_service
    mg = await mongodb_service.engine.find(InputGoodsManagementTableModel)
    codes = {item.origin_goods_code for item in mg}
    detail = await mongodb_service.engine.find(
        OriginGoodsDetailModel,
        {"origin_goods_code": {"$nin": list(codes)}}
    )
    return [i.dict(exclude={"_id", "id"}) for i in mg] + [i.dict(exclude={"_id", "id"}) for i in detail]
