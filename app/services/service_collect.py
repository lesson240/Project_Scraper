import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.models.model_odmantic_oliveyoung import OriginGoodsDetailModel
from app.scrapers.scraper_oliveyoung import SpecialToday, BrandGoodsDetail
from app.services.service_mongodb import mongodb_service

# 라이브러리 불러오기
from fastapi import HTTPException
import asyncio
from typing import List, Dict, Any, Set, Optional
from pymongo import UpdateOne
import os
from pydantic import BaseModel, Field

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)


class ExecuteSpecialToday:
    def __init__(self, site_key, redundant, group_name, memo):
        self.site_key = site_key
        self.redundant = redundant
        self.group_name = group_name
        self.memo = memo
        self.mongodb_service = mongodb_service
        if mongodb_service and mongodb_service.engine is None:
            raise ValueError("MongoDB engine is not initialized")

    def fetch_goods(self):
        special_today = SpecialToday(self.site_key)
        try:
            goods = special_today.run()
            if not goods:
                logger.error("No goods of special_today fetched.")
                return []
            # logger.info(f"Fetched goods: {goods}")
            return goods
        except Exception as e:
            logger.error(f"Error fetching goods: {e}")
            return []

    async def fetch_existing_codes(self, origin_goods_codes: List) -> Set[str]:
        if not self.mongodb_service:
            return set()  # MongoDB 연결이 없을 때 빈 집합 반환

        try:
            items = await self.mongodb_service.engine.find(
                OriginGoodsDetailModel,
                OriginGoodsDetailModel.origin_goods_code.in_(origin_goods_codes),
            )
            if not items:
                return set(
                    origin_goods_codes
                )  # MongoDB에 해당 코드들이 없을 때 origin_goods_codes 반환
            existing_codes_in_db = {
                item.origin_goods_code
                for item in items
                if item.origin_goods_code in origin_goods_codes
            }
            existing_codes = set(origin_goods_codes) - existing_codes_in_db
            return existing_codes
        except Exception as e:
            logger.error(f"Error fetching existing codes: {e}")
            return set(origin_goods_codes)  # 오류 발생 시 origin_goods_codes 반환

    async def fetch_and_update_details(self, existing_codes):
        goods_detail = BrandGoodsDetail(existing_codes)
        try:
            goods = await goods_detail.run()
            if not goods:
                logger.error("No goods of goods_detail fetched.")
                return []
            # logger.info(f"Fetched goods: {goods}")
            return goods
        except Exception as e:
            logger.error(f"Error fetch_and_update_details: {e}")
            return []

    async def create_models(self, existing_codes):
        details = await self.fetch_and_update_details(existing_codes)
        # logger.debug(f"Details: {details}")  # Add this line to debug details
        new_oliveyoung_models = []
        # print(detail)
        for detail in details:
            if detail:  # None이 아닌 경우에만 처리
                origin_goods_detail_model = OriginGoodsDetailModel(
                    origin_goods_code=detail.get("origin_goods_code"),
                    group_name=self.group_name,
                    memo=self.memo,
                    market=self.site_key,
                    brand_name=detail.get("brand_name", ""),
                    brand_code=detail.get("brand_code", ""),
                    origin_goods_name=detail.get("origin_goods_name", ""),
                    total_price=detail.get("total_price", 0),
                    goods_origin=detail.get("goods_origin", 0),
                    sale_start=detail.get("sale_start", ""),
                    sale_end=detail.get("sale_end", ""),
                    sale_price=detail.get("sale_price", 0),
                    coupon_start=detail.get("coupon_start", ""),
                    coupon_end=detail.get("coupon_end", ""),
                    coupon_price=detail.get("coupon_price", 0),
                    delivery=detail.get("delivery", {}),
                    sold_out=detail.get("sold_out", ""),
                    option=detail.get("option", {}),
                    thumb=detail.get("thumb", {}),
                    collection_time=detail.get("collection_time", ""),
                    sale=detail.get("sale", ""),
                    coupon=detail.get("coupon", ""),
                )
                new_oliveyoung_models.append(origin_goods_detail_model)
        return new_oliveyoung_models

    async def bulk_update(self, new_oliveyoung_models: List[OriginGoodsDetailModel]):
        if not self.mongodb_service:
            logger.warning(
                "MongoDB service is not available. Skipping database update."
            )
            return  # MongoDB 연결이 없을 때 업데이트를 건너뜀

        bulk_operations = []
        for model in new_oliveyoung_models:
            model_dict = model.dict(exclude={"id"})
            bulk_operations.append(
                UpdateOne(
                    {"origin_goods_code": model.origin_goods_code},
                    {"$set": model_dict},
                    upsert=True,
                )
            )
            # logger.debug(f"Prepared bulk operation for model: {model_dict}")

        if bulk_operations:
            try:
                collection = self.mongodb_service.engine.get_collection(
                    OriginGoodsDetailModel
                )
                result = await collection.bulk_write(bulk_operations)
                # logger.info(f"Bulk write result: {result.bulk_api_result}")
                return result.bulk_api_result
            except Exception as e:
                logger.error(f"An error occurred while saving new models: {e}")
                raise HTTPException(
                    status_code=500, detail="An error occurred while saving new models."
                )
        else:
            logger.info("No bulk operations to perform.")

    async def run(self):
        try:
            goods = self.fetch_goods()
            if not goods:
                logger.error("No goods found for /collect/specialtoday")
                return

            if self.redundant == "skip":
                origin_goods_codes = [good["origin_goods_code"] for good in goods]
                existing_codes = await self.fetch_existing_codes(origin_goods_codes)
                print("skip:", existing_codes)
            elif self.redundant == "update":
                existing_codes = [good["origin_goods_code"] for good in goods]
                print("update:", existing_codes)
            new_oliveyoung_models = await self.create_models(existing_codes)
            bulk_update_result = await self.bulk_update(new_oliveyoung_models)
            return bulk_update_result
        except Exception as e:
            logger.error(f"An error occurred while collecting: {e}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while collecting special_today.",
            )


if __name__ == "__main__":

    async def main(redundant, group_name, memo, site_key):
        execute_func = ExecuteSpecialToday(site_key, redundant, group_name, memo)
        products = await execute_func.run()
        print(products)

    redundant = "update"  # or "skip"
    group_name = "example_group"
    memo = "example_memo"
    site_key = "oliveyoung"

    asyncio.run(main(redundant, group_name, memo, site_key))
