import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.models.model_odmantic_oliveyoung import OriginGoodsDetailModel
from app.models.model_pydantic_table import DatetimeParseModel
from app.models.model_odmantic_table import InputGoodsManagementTableModel
from app.scrapers.scraper_oliveyoung import BrandGoodsDetail
from app.services.service_mongodb import mongodb_service
from app.services.query_logic import handle_fetch_inquiry
from app.services.query_helpers import query_all_goods


# 라이브러리 불러오기
from fastapi import HTTPException
import asyncio
import os
from typing import Optional

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)


class FilterSectionInquiry:
    def __init__(self, **kwargs):
        self.brand_code = kwargs.get("brand_code", "")
        self.brand_name = kwargs.get("brand_name", "")
        self.group_name = kwargs.get("group_name", "")
        self.memo_name = kwargs.get("memo_name", "")
        self.origin_goods_code = kwargs.get("origin_goods_code", "")
        self.modified_goods_name = kwargs.get("modified_goods_name", "")
        self.promotion_period = kwargs.get("promotion_period", "")
        self.origin_goods_name = kwargs.get("origin_goods_name", "")
        # 프론트엔드에서 추가로 보내는 필드들
        self.un_uploaded_market = kwargs.get("un_uploaded_market", "")
        self.sold_out = kwargs.get("sold_out", "")

        self.mongodb_service = mongodb_service
        if self.mongodb_service and self.mongodb_service.client is None:
            raise ValueError("MongoDB client is not initialized")

    # async def fetch_inquiry(self):
    #     """상품 데이터를 DB에서 조회"""
    #     base_filters = self._build_base_filters()
    #     saved_goods_list = []

    #     # 1. modified_goods_name 우선 검색
    #     if self.modified_goods_name and str(self.modified_goods_name).strip():
    #         filters = {**base_filters, "modified_goods_name": {"$regex": self.modified_goods_name, "$options": "i"}}

    #         management_goods = await self._search_in_management(filters)
    #         management_codes = {item.get("origin_goods_code") for item in management_goods}

    #         # 결과 없으면 OriginGoodsDetailModel에서 modified_goods_name을 origin_goods_name으로 검색
    #         if not management_goods:
    #             filters = {**base_filters, "origin_goods_name": {"$regex": self.modified_goods_name, "$options": "i"}}
    #             detail_goods = await self._search_in_origin_detail(filters)
    #             return detail_goods
            
    #         # 두 테이블 모두 결과가 없으면 전체 조회
    #         additional_filters = filters.copy()
    #         if management_codes:
    #             additional_filters["origin_goods_code"] = {"$nin": list(management_codes)}

    #         detail_goods = await self._search_in_origin_detail(additional_filters)
    #         return management_goods + detail_goods

    #     # 2. origin_goods_name 검색 (modified_goods_name이 없는 경우)
    #     if self.origin_goods_name and str(self.origin_goods_name).strip():
    #         filters = {**base_filters, "origin_goods_name": {"$regex": self.origin_goods_name, "$options": "i"}}

    #         management_goods = await self._search_in_management(filters)
    #         management_codes = {item.get("origin_goods_code") for item in management_goods}

    #         additional_filters = filters.copy()
    #         if management_codes:
    #             additional_filters["origin_goods_code"] = {"$nin": list(management_codes)}

    #         detail_goods = await self._search_in_origin_detail(additional_filters)
    #         return management_goods + detail_goods

    #     # 3. 다른 인자(brand_code, brand_name 등)에 맞춰 조회
    #     if base_filters:
    #         management_goods = await self._search_in_management(base_filters)
    #         management_codes = {item.get("origin_goods_code") for item in management_goods}

    #         additional_filters = base_filters.copy()
    #         if management_codes:
    #             additional_filters["origin_goods_code"] = {"$nin": list(management_codes)}

    #         detail_goods = await self._search_in_origin_detail(additional_filters)
    #         return management_goods + detail_goods

    #     # 4. 모든 인자가 비어있으면 전체 조회
    #     return await self._search_all_goods()


    # async def _search_all_goods(self):
    #     """전체 상품 조회 (관리 테이블 + 상세 테이블)"""
    #     management_goods = await self._search_in_management({})
    #     management_codes = {item.get("origin_goods_code") for item in management_goods}

    #     additional_filters = {}
    #     if management_codes:
    #         additional_filters["origin_goods_code"] = {"$nin": list(management_codes)}

    #     detail_goods = await self._search_in_origin_detail(additional_filters)
    #     return management_goods + detail_goods

    # def _build_base_filters(self):
    #     """공통 필터 생성"""
    #     filters = {}
    #     if self.brand_code and str(self.brand_code).strip():
    #         filters["brand_code"] = {"$regex": self.brand_code, "$options": "i"}
    #     if self.brand_name and str(self.brand_name).strip():
    #         filters["brand_name"] = {"$regex": self.brand_name, "$options": "i"}
    #     if self.group_name and str(self.group_name).strip():
    #         filters["group_name"] = {"$regex": self.group_name, "$options": "i"}
    #     if self.memo_name and str(self.memo_name).strip():
    #         filters["memo"] = {"$regex": self.memo_name, "$options": "i"}
    #     if self.origin_goods_code and str(self.origin_goods_code).strip():
    #         filters["origin_goods_code"] = {"$regex": self.origin_goods_code, "$options": "i"}
    #     if self.promotion_period and self.promotion_period.strip():
    #         parse_promotion_period = DatetimeParseModel(
    #             inquiry_datetime=self.promotion_period
    #         )
    #         filters["promotion_period"] = {
    #             "$gte": [parse_promotion_period.inquiry_datetime]
    #         }
    #     return filters

    async def _search_in_management(self, filters):
        """InputGoodsManagementTableModel에서 데이터 검색"""
        try:
            logger.info(f"🔍 InputGoodsManagementTableModel 검색 시작 - 필터: {filters}")
            
            results = await self.mongodb_service.engine.find(InputGoodsManagementTableModel, filters)
            logger.info(f"📊 검색 결과 수: {len(results)}개")
            
            converted_results = []
            for i, item in enumerate(results):
                try:
                    # ODMantic 모델을 딕셔너리로 변환
                    item_dict = item.dict(exclude={"_id", "id"})
                    converted_results.append(item_dict)
                    logger.info(f"✅ 항목 {i+1} 변환 성공: {len(item_dict)}개 필드")
                    
                except Exception as item_error:
                    logger.error(f"❌ 항목 {i+1} 변환 실패: {str(item_error)}")
                    # 수동 변환 시도
                    manual_dict = {
                        "origin_goods_code": getattr(item, 'origin_goods_code', ''),
                        "origin_goods_name": getattr(item, 'origin_goods_name', ''),
                        "modified_goods_name": getattr(item, 'modified_goods_name', ''),
                        # ... 다른 필드들
                    }
                    converted_results.append(manual_dict)
            
            return converted_results
            
        except Exception as e:
            logger.error(f"❌ InputGoodsManagementTableModel 검색 중 전체 에러: {str(e)}")
            logger.error(f"�� 에러 타입: {type(e).__name__}")
            import traceback
            logger.error(f"🔍 스택 트레이스: {traceback.format_exc()}")
            return []

    async def _search_in_origin_detail(self, filters):
        """OriginGoodsDetailModel에서 데이터 검색"""
        try:
            logger.info(f"🔍 OriginGoodsDetailModel 검색 시작 - 필터: {filters}")
            
            results = await self.mongodb_service.engine.find(OriginGoodsDetailModel, filters)
            logger.info(f"📊 OriginGoodsDetailModel 검색 결과 수: {len(results)}개")
            
            converted_results = []
            for i, item in enumerate(results):
                try:
                    item_dict = item.dict(exclude={"_id", "id"})
                    converted_results.append(item_dict)
                    logger.info(f"✅ OriginGoodsDetailModel 항목 {i+1} 변환 성공")
                except Exception as item_error:
                    logger.error(f"❌ OriginGoodsDetailModel 항목 {i+1} 변환 실패: {str(item_error)}")
                    # 수동 변환 시도
                    try:
                        manual_dict = {
                            "origin_goods_code": getattr(item, 'origin_goods_code', ''),
                            "origin_goods_name": getattr(item, 'origin_goods_name', ''),
                            "modified_goods_name": getattr(item, 'modified_goods_name', ''),
                            "brand_code": getattr(item, 'brand_code', ''),
                            "brand_name": getattr(item, 'brand_name', ''),
                            "market": getattr(item, 'market', ''),
                            "group_name": getattr(item, 'group_name', ''),
                            "memo": getattr(item, 'memo', ''),
                            "thumb": getattr(item, 'thumb', {}),
                            "exchangeRateInfo": None,
                            "sellingPriceFormulaInfo": None,
                            "platformMarginRateInfo": None,
                            "marginListByItems": None,
                            "updatedAt": None
                        }
                        converted_results.append(manual_dict)
                        logger.info(f"✅ OriginGoodsDetailModel 항목 {i+1} 수동 변환 성공")
                    except Exception as manual_error:
                        logger.error(f"❌ OriginGoodsDetailModel 항목 {i+1} 수동 변환도 실패: {str(manual_error)}")
                        converted_results.append({
                            "origin_goods_code": str(getattr(item, 'origin_goods_code', f"error_item_{i}")),
                            "error": f"변환 실패: {str(item_error)}"
                        })
            
            return converted_results
            
        except Exception as e:
            logger.error(f"❌ OriginGoodsDetailModel 검색 중 전체 에러: {str(e)}")
            logger.error(f"�� 에러 타입: {type(e).__name__}")
            import traceback
            logger.error(f"🔍 스택 트레이스: {traceback.format_exc()}")
            return []

    async def _search_all_goods(self):
        """전체 상품 조회 (관리 테이블 + 상세 테이블)"""
        return await query_all_goods()


    async def run(self):
        try:
            logger.info("🚀 FilterSectionInquiry 실행 시작")
            logger.info(f"📋 검색 조건: brand_code={self.brand_code}, brand_name={self.brand_name}, origin_goods_code={self.origin_goods_code}")
            
            result = await handle_fetch_inquiry(self)
            logger.info(f"✅ FilterSectionInquiry 실행 완료 - 결과 수: {len(result) if result else 0}개")
            return result
            
        except Exception as e:
            logger.error(f"❌ FilterSectionInquiry 실행 실패: {str(e)}")
            logger.error(f"�� 에러 타입: {type(e).__name__}")
            import traceback
            logger.error(f"🔍 스택 트레이스: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=str(e))


class ButtonSectionSyncCollect:
    def __init__(self, origin_goods_codes) -> None:
        self.origin_goods_codes = origin_goods_codes
        self.mongodb_service = mongodb_service
        if mongodb_service and mongodb_service.engine is None:
            raise ValueError("MongoDB engine is not initialized")

    async def fetch_sync_collect(self):
        goods_detail = BrandGoodsDetail(self.origin_goods_codes)
        results = await goods_detail.run()

        goods_detail_list = {
            code: result
            for code, result in zip(self.origin_goods_codes, results)
            if result
        }

        # MongoDB 업데이트 및 데이터 결합
        combined_data_list = []
        for code, price_info in goods_detail_list.items():
            price_info.pop("id", None)
            price_info.pop("_id", None)
            # print(f"price_info:{price_info}")  # 순수 수집 data
            if isinstance(price_info, dict):
                sale = (
                    "세일"
                    if price_info.get("sale_price", "null") not in ["null", None, ""]
                    else "없음"
                )
                coupon = (
                    "쿠폰"
                    if price_info.get("coupon_price", "null") not in ["null", None, ""]
                    else "없음"
                )
            update_data = {
                "sold_out": price_info.get("sold_out"),
                "total_price": price_info.get("total_price"),
                "goods_origin": price_info.get("goods_origin"),
                "sale_start": price_info.get("sale_start"),
                "sale_end": price_info.get("sale_end"),
                "sale_price": price_info.get("sale_price"),
                "coupon_start": price_info.get("coupon_start"),
                "coupon_end": price_info.get("coupon_end"),
                "coupon_price": price_info.get("coupon_price"),
                "sale": sale,
                "coupon": coupon,
            }

            # print(f"update_data:{update_data}")  # 1차 여과된 수집 data

            # 기존 데이터 조회
            existing_data = await self.mongodb_service.engine.find_one(
                InputGoodsManagementTableModel, {"origin_goods_code": code}
            )

            if existing_data:
                existing_data_dict = existing_data.dict()
                existing_data_dict.pop("id", None)
                existing_data_dict.pop("_id", None)
                existing_data_dict.update(
                    update_data
                )  # 기존 데이터에 새로운 데이터 업데이트
                update_data = existing_data_dict

            elif not existing_data:
                # 기존 데이터가 없으면 OriginGoodsDetailModel에서 데이터 가져오기
                origin_goods_detail = await self.mongodb_service.engine.find_one(
                    OriginGoodsDetailModel, {"origin_goods_code": code}
                )
                if origin_goods_detail:
                    origin_goods_detail_dict = origin_goods_detail.dict()
                    origin_goods_detail_dict.pop("id", None)
                    origin_goods_detail_dict.pop("_id", None)
                    origin_goods_detail_dict.update(update_data)
                    update_data = origin_goods_detail_dict

            try:
                await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(
                    {"origin_goods_code": code}, {"$set": update_data}, upsert=True
                )
                # combined_data_list에 합친 데이터 추가
                # combined_data = {**price_info, **update_data}
                combined_data_list.append(update_data)
            except Exception as e:
                logger.error(
                    f"Error updating MongoDB for origin_goods_code {code}: {str(e)}"
                )
        return combined_data_list

    async def run(self):
        try:
            sync_collect = await self.fetch_sync_collect()
            if not sync_collect:
                logger.error("No inquiry found from sync_collect")
                return
            return sync_collect
        except Exception as e:
            logger.error(f"An error occurred during sync_collect: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred occurred during sync_collect: {str(e)}",
            )


class ButtonSectionDeleteGoods:
    def __init__(self, origin_goods_codes) -> None:
        self.origin_goods_codes = origin_goods_codes
        self.mongodb_service = mongodb_service
        if mongodb_service and mongodb_service.engine is None:
            raise ValueError("MongoDB engine is not initialized")

    async def run(self):
        try:
            for code in self.origin_goods_codes:
                query = {"origin_goods_code": code}
                # InputGoodsManagementTableModel에서 문서 삭제
                await self.mongodb_service.engine.remove(
                    InputGoodsManagementTableModel, query
                )
                # OriginGoodsDetailModel에서 문서 삭제
                await self.mongodb_service.engine.remove(OriginGoodsDetailModel, query)
            return {"message": "Data successfully deleted"}
        except Exception as e:
            logger.error(f"An error occurred during delete_goods: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred occurred during delete_goods: {str(e)}",
            )


if __name__ == "__main__":
    pass
