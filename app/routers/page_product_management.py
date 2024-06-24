# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import OriginGoodsDetailModel
from app.models.table_model import (
    InputGoodsTableRequestModel,
    InputGoodsManagementTableModel,
    BrandCodeRequestModel,
    MatchingOptionIdModel,
)
from app.scrapers.scraper_coupang import WinnerPriceInquiry
from app.utils.router_utils import set_version

# 라이브러리 불러오기
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, List, Dict
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

router = APIRouter()

# Jinja2 템플릿 경로 설정
templates_directory = BASE_DIR / "app" / "templates"
logger.info(f"Templates directory: {templates_directory}")
templates = Jinja2Templates(directory=templates_directory)


@router.get("/product-manage", response_class=HTMLResponse)
async def product_manage(request: Request):
    return templates.TemplateResponse(
        "product-manage.html",
        {
            "request": request,
            "title": "올리브영 수집기",
            "api_version": set_version(),
        },
    )


@router.post("/product-data", response_class=HTMLResponse)
async def get_product_data(request: Request, brand_code_request: BrandCodeRequestModel):
    brandCode = brand_code_request.brandCode
    saved_goods_list = []

    try:
        # InputGoodsManagementTableModel에서 데이터 가져오기
        saved_goods_management = await mongodb_service.engine.find(
            InputGoodsManagementTableModel,
            {"brand_code": {"$in": [brandCode]}},
        )
        management_codes = set()
        for item in saved_goods_management:
            item_dict = item.dict()
            # '_id' 및 'id' 필드 제거
            item_dict.pop("_id", None)
            item_dict.pop("id", None)
            saved_goods_list.append(item_dict)
            management_codes.add(item.origin_goods_code)
        # OriginGoodsDetailModel에서 동일하지 않은 origin_goods_code의 데이터 가져오기
        saved_goods_detail = await mongodb_service.engine.find(
            OriginGoodsDetailModel,
            {
                "brand_code": {"$in": [brandCode]},
                "origin_goods_code": {"$nin": list(management_codes)},
            },
        )
        for item in saved_goods_detail:
            item_dict = item.dict()
            # '_id' 및 'id' 필드 제거
            item_dict.pop("_id", None)
            item_dict.pop("id", None)
            saved_goods_list.append(item_dict)

        logger.info(f"{saved_goods_list}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

    return JSONResponse(content=saved_goods_list)


@router.post("/save-goods-table", response_class=JSONResponse)
async def save_goods_table(request: Request, data: List[InputGoodsTableRequestModel]):
    try:
        for item in data:
            query = {"origin_goods_code": item.origin_goods_code}
            # 데이터 변환 로직 최소화
            update_data = item.dict(exclude_unset=True)
            # 기존 문서를 찾아서 업데이트 데이터에 추가
            try:
                existing_document = await mongodb_service.engine.find_one(
                    InputGoodsManagementTableModel, query
                )
                if existing_document:
                    update_data["winner_delivery"] = existing_document.winner_delivery
                    update_data["winner_deliveryday"] = (
                        existing_document.winner_deliveryday
                    )
            except Exception as e:
                print(
                    f"Error finding document for origin_goods_code {item.origin_goods_code}: {str(e)}"
                )

            # MongoDB 업데이트
            try:
                result = await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(query, {"$set": update_data}, upsert=True)
                logger.info(
                    f"Upsert result for {item.origin_goods_code}: {result.raw_result}"
                )  # 결과 로그 추가

            except Exception as e:
                logger.error(
                    f"Error updating MongoDB for origin_goods_code {item.origin_goods_code}: {str(e)}"
                )
                raise HTTPException(
                    status_code=500,
                    detail=f"Error updating MongoDB for origin_goods_code {item.origin_goods_code}: {str(e)}",
                )
        return {"message": "Data successfully saved"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while saving data: {str(e)}"
        )


@router.post("/sync-winner-price", response_class=JSONResponse)
async def synch_winner_price(request: Request, data: List[MatchingOptionIdModel]):
    try:
        origin_goods_codes = [item.origin_goods_code for item in data]
        matching_option_ids = [item.matching_option_id for item in data]
        # WinnerPriceInquiry 호출
        winner_prices = {}
        for matching_option_id, origin_goods_code in zip(
            matching_option_ids, origin_goods_codes
        ):
            scrap_func = WinnerPriceInquiry(matching_option_id, "coupang")
            result = await scrap_func.run()
            if result:
                winner_prices[origin_goods_code] = result
            else:
                logger.warning(
                    f"No data found for origin_goods_code: {origin_goods_code}"
                )
        # MongoDB 업데이트
        for code, price_info in winner_prices.items():
            price_info.pop("id", None)
            price_info.pop("_id", None)
            update_data = {
                "winner_price": price_info.get("total_price"),
                "winner_delivery": price_info.get("delivery"),
                "winner_deliveryday": price_info.get("deliveryday"),
            }
            try:
                await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(
                    {"origin_goods_code": code}, {"$set": update_data}, upsert=True
                )
            except Exception as e:
                logger.error(
                    f"Error updating MongoDB for origin_goods_code {code}: {str(e)}"
                )
        return JSONResponse(
            content={"message": "Winner price synchronized", "data": winner_prices}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")
