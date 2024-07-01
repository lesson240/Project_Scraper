# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.services.service_mongodb import mongodb_service
from app.models.model_oliveyoung import OriginGoodsDetailModel
from app.models.model_table import (
    InputGoodsTableRequestModel,
    InputGoodsManagementTableModel,
    BrandCodeRequestModel,
    MatchingOptionIdModel,
    OriginGoodsCodeModel,
)
from app.scrapers.scraper_coupang import WinnerPriceInquiry
from app.scrapers.scraper_oliveyoung import BrandGoodsDetail
from app.utils.util_router import set_version

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
        if saved_goods_management:
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
        else:
            # InputGoodsManagementTableModel에서 데이터가 없는 경우 OriginGoodsDetailModel에서 데이터 가져오기
            saved_goods_detail = await mongodb_service.engine.find(
                OriginGoodsDetailModel,
                {"brand_code": {"$in": [brandCode]}},
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
                    update_data["id"] = existing_document.id  # 기존 문서의 ID를 유지
                    update_data["winner_delivery"] = existing_document.winner_delivery
                    update_data["winner_deliveryday"] = (
                        existing_document.winner_deliveryday
                    )

                else:
                    # OriginGoodsDetailModel에서 데이터 가져오기
                    origin_goods_detail = await mongodb_service.engine.find_one(
                        OriginGoodsDetailModel, query
                    )
                    if origin_goods_detail:
                        origin_goods_data = origin_goods_detail.dict(
                            exclude={"id", "_id"}
                        )
                        update_data = {
                            **origin_goods_data,
                            **update_data,
                        }  # OriginGoodsDetailModel 데이터와 병합
            except Exception as e:
                print(
                    f"Error finding document for origin_goods_code {item.origin_goods_code}: {str(e)}"
                )

            # MongoDB 업데이트
            try:
                result = await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(query, {"$set": update_data}, upsert=True)
                logger.info(f"Upsert result for {item.origin_goods_code}: {result}")

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
        winner_prices = {}

        # WinnerPriceInquiry 호출
        for item in data:
            scrap_func = WinnerPriceInquiry(item.matching_option_id, "coupang")
            result = await scrap_func.run()
            if result:
                result["brand_code"] = item.brand_code
                winner_prices[item.origin_goods_code] = result
            else:
                logger.warning(
                    f"No data found for origin_goods_code: {item.origin_goods_code}"
                )

        for origin_goods_code, price_info in winner_prices.items():
            query = {"origin_goods_code": origin_goods_code}
            update_data = {
                "winner_price": price_info.get("total_price"),
                "winner_delivery": price_info.get("delivery"),
                "winner_deliveryday": price_info.get("deliveryday"),
                "brand_code": price_info.get("brand_code"),
            }
            # update_data = {k: v for k, v in update_data.items() if v is not None}

            try:
                existing_document = await mongodb_service.engine.find_one(
                    InputGoodsManagementTableModel, query
                )
                if existing_document:
                    # 기존 문서에서 특정 필드 유지 및 ID 유지
                    update_data["id"] = existing_document.id  # 기존 문서의 ID를 유지
                    existing_data = existing_document.dict(exclude={"id", "_id"})
                    update_data = {**existing_data, **update_data}
                else:
                    # OriginGoodsDetailModel에서 데이터 가져오기
                    origin_goods_detail = await mongodb_service.engine.find_one(
                        OriginGoodsDetailModel, query
                    )
                    if origin_goods_detail:
                        origin_goods_data = origin_goods_detail.dict(
                            exclude={"id", "_id"}
                        )
                        update_data = {
                            **origin_goods_data,
                            **update_data,
                        }  # OriginGoodsDetailModel 데이터와 병합

                result = await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(query, {"$set": update_data}, upsert=True)
                logger.info(f"Upsert result for {origin_goods_code}")
            except Exception as e:
                logger.error(
                    f"Error updating MongoDB for origin_goods_code {origin_goods_code}: {str(e)}"
                )
                raise HTTPException(
                    status_code=500,
                    detail=f"Error updating MongoDB for origin_goods_code {origin_goods_code}: {str(e)}",
                )

        return JSONResponse(
            content={"message": "Winner price synchronized", "data": winner_prices}
        )
    except Exception as e:
        logger.error(f"Failed to fetch data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")


@router.post("/sync-collect-market", response_class=JSONResponse)
async def synch_collect_market(request: Request, data: List[OriginGoodsCodeModel]):
    try:
        origin_goods_codes = [item.origin_goods_code for item in data]
        # BrandGoodsDetail 호출
        goods_detail_list = {}
        for origin_goods_code in origin_goods_codes:
            scrap_func = BrandGoodsDetail(origin_goods_code)
            result = await scrap_func.run()
            if result:
                goods_detail_list[origin_goods_code] = result
            else:
                logger.warning(
                    f"No data found for origin_goods_code: {origin_goods_code}"
                )

        # MongoDB 업데이트 및 데이터 결합
        combined_data_list = []
        for code, price_info in goods_detail_list.items():
            price_info.pop("id", None)
            price_info.pop("_id", None)
            print(price_info)
            if isinstance(price_info, dict):
                sale = (
                    "세일"
                    if price_info.get("sale_price", "null") not in ["null", None, ""]
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
            }
            try:
                await mongodb_service.engine.get_collection(
                    InputGoodsManagementTableModel
                ).update_one(
                    {"origin_goods_code": code}, {"$set": update_data}, upsert=True
                )
                # combined_data_list에 합친 데이터 추가
                combined_data = {**price_info, **update_data}
                combined_data_list.append(combined_data)
            except Exception as e:
                logger.error(
                    f"Error updating MongoDB for origin_goods_code {code}: {str(e)}"
                )
        return JSONResponse(
            content={"message": "Collect data synchronized", "data": combined_data_list}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")
