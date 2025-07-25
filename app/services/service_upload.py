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

# 라이브러리 불러오기
from fastapi import HTTPException
import asyncio
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)


class FilterSectionInquiry:
    def __init__(
        self,
        brand_code,
        brand_name,
        group_name,
        memo_name,
        origin_goods_code,
        origin_goods_name,
        promotion_period,
    ):
        self.brand_code = brand_code
        self.brand_name = brand_name
        self.group_name = group_name
        self.memo_name = memo_name
        self.origin_goods_code = origin_goods_code
        self.origin_goods_name = origin_goods_name
        self.mongodb_service = mongodb_service
        self.promotion_period = promotion_period
        if mongodb_service and mongodb_service.engine is None:
            raise ValueError("MongoDB engine is not initialized")

    async def fetch_inquiry(self):
        saved_goods_list = []

        # 필터 조건 생성
        filters = {}
        if self.brand_code:
            filters["brand_code"] = {"$in": [self.brand_code]}
        if self.brand_name:
            filters["brand_name"] = {"$in": [self.brand_name]}
        if self.group_name:
            filters["group_name"] = {"$in": [self.group_name]}
        if self.memo_name:
            filters["memo_name"] = {"$in": [self.memo_name]}
        if self.origin_goods_code:
            filters["origin_goods_code"] = {"$in": [self.origin_goods_code]}
        if self.origin_goods_name:
            filters["origin_goods_name"] = {"$in": [self.origin_goods_name]}
        if self.promotion_period:
            parse_promotion_period = DatetimeParseModel(
                inquiry_datetime=self.promotion_period
            )
            print(parse_promotion_period.inquiry_datetime)
            filters["promotion_period"] = {
                "$gte": [parse_promotion_period.inquiry_datetime]
            }

        try:
            # 모든 인자가 없으면 모든 데이터를 가져옴
            if not filters:
                saved_goods_management = await self.mongodb_service.engine.find(
                    InputGoodsManagementTableModel, {}
                )
                management_codes = set()
                for item in saved_goods_management:
                    item_dict = item.dict()
                    item_dict.pop("_id", None)
                    item_dict.pop("id", None)
                    saved_goods_list.append(item_dict)
                    if "origin_goods_code" in item_dict:
                        management_codes.add(item_dict["origin_goods_code"])

                saved_goods_detail = await self.mongodb_service.engine.find(
                    OriginGoodsDetailModel,
                    {"origin_goods_code": {"$nin": list(management_codes)}},
                )
                for item in saved_goods_detail:
                    item_dict = item.dict()
                    item_dict.pop("_id", None)
                    item_dict.pop("id", None)
                    saved_goods_list.append(item_dict)

            else:
                saved_goods_management = await self.mongodb_service.engine.find(
                    InputGoodsManagementTableModel,
                    filters,
                )
                management_codes = set()
                if saved_goods_management:
                    for item in saved_goods_management:
                        item_dict = item.dict()
                        item_dict.pop("_id", None)
                        item_dict.pop("id", None)
                        saved_goods_list.append(item_dict)
                        if "origin_goods_code" in item_dict:
                            management_codes.add(item_dict["origin_goods_code"])

                if management_codes:
                    additional_filters = {
                        key: value
                        for key, value in filters.items()
                        if key != "origin_goods_code"
                    }
                    additional_filters["origin_goods_code"] = {
                        "$nin": list(management_codes)
                    }

                    saved_goods_detail = await self.mongodb_service.engine.find(
                        OriginGoodsDetailModel,
                        additional_filters,
                    )
                    for item in saved_goods_detail:
                        item_dict = item.dict()
                        item_dict.pop("_id", None)
                        item_dict.pop("id", None)
                        saved_goods_list.append(item_dict)
                else:
                    saved_goods_detail = await self.mongodb_service.engine.find(
                        OriginGoodsDetailModel,
                        filters,
                    )
                    for item in saved_goods_detail:
                        item_dict = item.dict()
                        item_dict.pop("_id", None)
                        item_dict.pop("id", None)
                        saved_goods_list.append(item_dict)

            logger.info(f"{saved_goods_list}")

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to fetch data: {str(e)}"
            )
        return saved_goods_list

    async def run(self):
        try:
            inquiry = await self.fetch_inquiry()
            if not inquiry:
                logger.error("No inquiry found from fetch_inquiry")
                return
            return inquiry
        except Exception as e:
            logger.error(f"An error occurred during fetch_inquiry: {e}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred occurred during fetch_inquiry from mongoDB",
            )


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
            print(f"price_info:{price_info}")  # 순수 수집 data
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

            print(f"update_data:{update_data}")  # 1차 여과된 수집 data

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
