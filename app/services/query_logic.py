from .query_helpers import build_base_filters, merge_results, query_all_goods

async def handle_fetch_inquiry(inquiry):
    base_filters = build_base_filters(inquiry)

    # 1. 모든 조건이 비어있으면 전체 조회
    if _is_all_empty(inquiry):
        return await query_all_goods()

    # 2. modified_goods_name이 있으면 우선 조회    
    if inquiry.modified_goods_name:
        filters = {
            **base_filters,
            "modified_goods_name": {
                "$regex": inquiry.modified_goods_name,
                "$options": "i"
            }
        }

        mg = await inquiry._search_in_management(filters)
        management_codes = {item.get("origin_goods_code") for item in mg}

        alt_filters = {
            **base_filters,
            "origin_goods_name": {
                "$regex": inquiry.modified_goods_name,
                "$options": "i"
            }
        }
        if management_codes:
            alt_filters["origin_goods_code"] = {"$nin": list(management_codes)}

        origin_result = await inquiry._search_in_origin_detail(alt_filters)
        return mg + origin_result

    mg = await inquiry._search_in_management(base_filters)
    if not mg:
        return []

    return await merge_results(inquiry, mg, base_filters)


def _is_all_empty(inquiry):
    return not any([
        inquiry.modified_goods_name,
        inquiry.brand_code,
        inquiry.brand_name,
        inquiry.group_name,
        inquiry.memo_name,
        inquiry.origin_goods_code,
        inquiry.promotion_period
    ])
