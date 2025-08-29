from app.models.model_odmantic_table import InputGoodsManagementTableModel
from app.models.model_odmantic_oliveyoung import OriginGoodsDetailModel
from datetime import datetime
import os
from app.utils.util_logging import setup_logger
# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]
# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

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
    """전체 상품 조회 (관리 테이블 + 상세 테이블)"""
    try:
        from app.services.service_upload import mongodb_service
        from datetime import datetime
        
        # InputGoodsManagementTableModel에서 데이터 조회
        mg = await mongodb_service.engine.find(InputGoodsManagementTableModel, {})
        
        # ✅ 수정: 타입을 확인하고 안전하게 처리
        codes = set()
        mg_list = []
        
        if mg and len(mg) > 0:
            for item in mg:
                try:
                    # ODMantic 모델인지 확인
                    if hasattr(item, 'dict'):
                        # ODMantic 모델인 경우
                        item_dict = item.dict(exclude={"_id", "id"})
                        # ✅ datetime 객체를 문자열로 변환
                        item_dict = _convert_datetime_to_string(item_dict)
                        mg_list.append(item_dict)
                        if item_dict.get('origin_goods_code'):
                            codes.add(item_dict['origin_goods_code'])
                    else:
                        # 이미 딕셔너리인 경우
                        item_copy = item.copy()
                        # ✅ datetime 객체를 문자열로 변환
                        item_copy = _convert_datetime_to_string(item_copy)
                        mg_list.append(item_copy)
                        if item_copy.get('origin_goods_code'):
                            codes.add(item_copy['origin_goods_code'])
                except Exception as e:
                    logger.warning(f"mg 항목 처리 실패: {str(e)}")
                    continue
        
        # OriginGoodsDetailModel에서 데이터 조회 (중복 제외)
        detail = await mongodb_service.engine.find(
            OriginGoodsDetailModel,
            {"origin_goods_code": {"$nin": list(codes)}}
        )
        
        detail_list = []
        if detail and len(detail) > 0:
            for item in detail:
                try:
                    if hasattr(item, 'dict'):
                        item_dict = item.dict(exclude={"_id", "id"})
                        # ✅ datetime 객체를 문자열로 변환
                        item_dict = _convert_datetime_to_string(item_dict)
                        detail_list.append(item_dict)
                    else:
                        item_copy = item.copy()
                        # ✅ datetime 객체를 문자열로 변환
                        item_copy = _convert_datetime_to_string(item_copy)
                        detail_list.append(item_copy)
                except Exception as e:
                    logger.warning(f"detail 항목 처리 실패: {str(e)}")
                    continue
        
        return mg_list + detail_list
        
    except Exception as e:
        logger.error(f"query_all_goods 에러: {str(e)}")
        return []

def _convert_datetime_to_string(data):
    """딕셔너리 내의 datetime 객체를 문자열로 변환"""
    if isinstance(data, dict):
        converted = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                converted[key] = value.isoformat()
            elif isinstance(value, dict):
                converted[key] = _convert_datetime_to_string(value)
            elif isinstance(value, list):
                converted[key] = [_convert_datetime_to_string(item) if isinstance(item, (dict, datetime)) else item for item in value]
            else:
                converted[key] = value
        return converted
    elif isinstance(data, list):
        return [_convert_datetime_to_string(item) if isinstance(item, (dict, datetime)) else item for item in data]
    else:
        return data
