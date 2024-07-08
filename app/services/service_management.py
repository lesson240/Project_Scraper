import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.models.model_oliveyoung import OriginGoodsDetailModel
from app.models.model_table import InputGoodsManagementTableModel
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


class FilterSectionInquiry:
    def __init__(
        self,
        brand_code,
        brand_name,
        group_name,
        memo_name,
        origin_goods_code,
        origin_goods_name,
    ):
        self.brand_code = brand_code
        self.brand_name = brand_name
        self.group_name = group_name
        self.memo_name = memo_name
        self.origin_goods_code = origin_goods_code
        self.origin_goods_name = origin_goods_name
        self.mongodb_service = mongodb_service
        if mongodb_service and mongodb_service.engine is None:
            raise ValueError("MongoDB engine is not initialized")

    async def fetch_inquiry(self):
        print("01")
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

        try:
            print("02")
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
            print("00")
            inquiry = self.fetch_inquiry()
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


if __name__ == "__main__":
    pass
