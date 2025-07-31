# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.services.service_mongodb import mongodb_service
from app.services.service_upload import (
    FilterSectionInquiry,
    ButtonSectionSyncCollect,
    ButtonSectionDeleteGoods,
)
from app.models.model_pydantic_table import (
    InputGoodsTableRequestModel,
    BrandCodeRequestModel,
    MatchingOptionIdModel,
    OriginGoodsCodeModel,
    GoodsPriceUpdateModel,
    GoodsNameUpdateModel,
    GoodsMemoUpdateModel,
)
from app.models.model_odmantic_oliveyoung import OriginGoodsDetailModel
from app.models.model_odmantic_table import InputGoodsManagementTableModel
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
async def get_product_data(request: Request, input_data: BrandCodeRequestModel):
    logger.info(f"Received data: {input_data.json()}")
    filter_section_inquiry = FilterSectionInquiry(
        **input_data.dict()
)

    try:
        result = await filter_section_inquiry.run()
        logger.info(f"FilterSectionInquiry completed successfully: {result}")
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"FilterSectionInquiry failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
async def synch_collect_market(input_data: List[OriginGoodsCodeModel]):
    origin_goods_codes = [data.origin_goods_code for data in input_data]
    logger.info(f"Parsed origin goods codes: {origin_goods_codes}")
    button_section_sync_collect = ButtonSectionSyncCollect(origin_goods_codes)
    try:
        result = await button_section_sync_collect.run()
        logger.info(f"ButtonSectionSyncCollect completed successfully: {result}")
        return JSONResponse(
            content={"message": "Collect data synchronized", "data": result}
        )
    except Exception as e:
        logger.error(f"ButtonSectionSyncCollect failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to ButtonSectionSyncCollect: {str(e)}"
        )


@router.post("/delete-goods-table", response_class=JSONResponse)
async def delete_goods_table(input_data: List[OriginGoodsCodeModel]):
    origin_goods_codes = [data.origin_goods_code for data in input_data]
    logger.info(f"Parsed origin goods codes: {origin_goods_codes}")
    button_section_delete_goods = ButtonSectionDeleteGoods(origin_goods_codes)
    try:
        result = await button_section_delete_goods.run()
        logger.info(f"ButtonSectionDeleteGoods completed successfully: {result}")
        return JSONResponse(
            content={"message": "Data successfully deleted"}, status_code=200
        )

    except Exception as e:
        logger.error(f"ButtonSectionDeleteGoods failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to ButtonSectionDeleteGoods: {str(e)}"
        )


@router.post("/save-goods-price", response_class=JSONResponse)
async def save_goods_price(data: List[GoodsPriceUpdateModel]):
    try:
        for item in data:
            query = {"origin_goods_code": item.origin_goods_code}
            update_data = {
                "selling_price": item.selling_price,
            }
            await mongodb_service.engine.get_collection(
                InputGoodsManagementTableModel
            ).update_one(query, {"$set": update_data}, upsert=True)
        return {"message": "가격이 성공적으로 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"가격 저장 오류: {str(e)}")


@router.post("/save-goods-tag", response_class=JSONResponse)
async def save_goods_tag(data: List[InputGoodsTableRequestModel]):
    return {"message": "업로드 설정 API - 구현 예정"}


@router.post("/save-goods-page", response_class=JSONResponse)
async def save_goods_page():
    return {"message": "페이지 설정 API - 구현 예정"}


@router.post("/save-goods-name", response_class=JSONResponse)
async def save_goods_name(data: List[GoodsNameUpdateModel]):
    try:
        for item in data:
            query = {"origin_goods_code": item.origin_goods_code}
            update_data = {"modified_goods_name": item.modified_goods_name}
            await mongodb_service.engine.get_collection(
                InputGoodsManagementTableModel
            ).update_one(query, {"$set": update_data}, upsert=True)
        return {"message": "상품명이 성공적으로 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상품명 저장 오류: {str(e)}")


@router.post("/save-goods-memo", response_class=JSONResponse)
async def save_goods_memo(data: List[GoodsMemoUpdateModel]):
    try:
        for item in data:
            query = {"origin_goods_code": item.origin_goods_code}
            update_data = {"memo": item.memo}
            await mongodb_service.engine.get_collection(
                InputGoodsManagementTableModel
            ).update_one(query, {"$set": update_data}, upsert=True)
        return {"message": "메모가 성공적으로 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메모 저장 오류: {str(e)}")


@router.post("/save-goods-attribute", response_class=JSONResponse)
async def save_goods_attribute():
    return {"message": "속성 설정 API - 구현 예정"}


@router.post("/save-goods-detail", response_class=JSONResponse)
async def save_goods_detail():
    return {"message": "상세 설정 API - 구현 예정"}


@router.post("/save-goods-thumb", response_class=JSONResponse)
async def save_goods_thumb():
    return {"message": "썸네일 설정 API - 구현 예정"}


@router.post("/save-goods-upload", response_class=JSONResponse)
async def save_goods_upload():
    return {"message": "업로드 설정 API - 구현 예정"}
