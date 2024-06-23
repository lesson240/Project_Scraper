# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.models.oliveyoung_model import (
    BrandListModel,
    BrandShopModel,
    OriginGoodsDetailModel,
)
from app.models.records_model import CollectionRecordsModel
from app.scrapers.scraper_oliveyoung import BrandList, BrandShop, BrandGoodsDetail
from app.services.mongodb import mongodb_service
from app.utils.router_utils import set_version

# 라이브러리 불러오기
from fastapi import APIRouter, Request, HTTPException, Query, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
import asyncio
from typing import List, Dict
from pymongo import UpdateOne
from pydantic import BaseModel
import time
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


@router.get("/product-collect", response_class=HTMLResponse)
async def product_collect(request: Request):
    return templates.TemplateResponse(
        "product-collect.html",
        {
            "request": request,
            "title": "올리브영 수집기",
            "api_version": set_version(),
        },
    )


@router.get("/manager/brandlist", response_class=HTMLResponse)
async def collect_brand_list(request: Request):
    try:
        # 로깅: 요청이 도착했음을 로그에 남깁니다.
        logger.info("Request received to /manager/brandlist")

        # BRAND_LIST 수집
        brands = await asyncio.to_thread(BrandList().run)

        # DB에 이미 있는 데이터인지 확인
        try:
            existing_codes = {
                item.code for item in await mongodb_service.engine.find(BrandListModel)
            }
        except Exception as e:
            logger.error(f"An error occurred while finding existing codes: {e}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while finding existing codes.",
            )

        # 새로운 데이터만 저장할 모델 리스트
        new_oliveyoung_models = []
        for brand in brands:
            if brand["code"] not in existing_codes:
                oliveyoung_model = BrandListModel(
                    idx=brand["idx"],
                    code=brand["code"],
                    brand=brand["brand"],
                    collection_time=brand["time"],
                    status=brand["status"],
                )
                new_oliveyoung_models.append(oliveyoung_model)

        # 새로운 데이터가 있을 경우에만 저장
        try:
            if new_oliveyoung_models:
                await mongodb_service.engine.save_all(new_oliveyoung_models)
        except Exception as e:
            logging.error(
                f"An error occurred while saving new models_/manager/brandlist: {e}"
            )
            raise HTTPException(
                status_code=500, detail="An error occurred while saving new models."
            )

        # HTML BODY에 표시
        return templates.TemplateResponse(
            "./index.html",
            {"request": request, "title": "올리브영 수집기", "brands": brands},
        )

    except Exception as e:
        logger.error(f"An error occurred while collecting brand list: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brand list."
        )


@router.get("/endpoint/brandlist")
async def endpoint_collect_brand_list(request: Request):
    try:
        logger.info("Request received to /endpoint/brandlist")

        # 서버에서 데이터 가져오기
        data = await mongodb_service.engine.find(BrandListModel)

        # 데이터가 없을 경우 collect.py의 함수 호출
        if not data:
            logger.info("Data not found in database. Calling collect.py function.")
            await collect_brand_list(request)

        # 데이터 처리
        processed_data = []
        for item in data:
            item_dict = item.dict()
            # '_id' 필드 제거
            item_dict.pop("_id", None)  # 수정된 부분
            # ObjectId를 문자열로 변환하여 'id' 필드로 추가
            item_dict["id"] = str(item.id)
            processed_data.append(item_dict)
        # JSONResponse를 사용하여 JSON 형식으로 데이터 반환
        return JSONResponse(content=processed_data)
    except Exception as e:
        # 로깅: 예외가 발생했음을 로그에 남깁니다.
        logger.error(f"An error occurred: {e}")

        # 오류 처리
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.get("/collect/brandshop", response_class=JSONResponse)
async def collect_brand_shop(
    input_code: str = Query(..., description="The brand code"),
    input_brand: str = Query(..., description="The brand"),
):
    try:
        # BrandShop 데이터를 수집하여 MongoDB에 적재합니다.
        brand_shop = BrandShop(input_code, input_brand)
        goods = await brand_shop.run()

        if not goods:
            logger.error(
                f"collect_brand_shop, No goods found for brand code_/collect/brandshop: {input_code}"
            )
            raise HTTPException(
                status_code=404,
                detail=f"No goods found for brand code: {input_code}",
            )
        # DB에 이미 있는 데이터인지 확인
        try:
            existing_codes = {
                item.code for item in await mongodb_service.engine.find(BrandShopModel)
            }
        except Exception as e:
            logger.error(
                f"collect_brand_shop, An error occurred while finding existing codes_/collect/brandshop: {e}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while finding existing codes.",
            )

        # 새로운 데이터만 저장할 모델 리스트
        new_oliveyoung_models = []
        for good in goods:
            if isinstance(good, dict):
                # value 값이 None 일 경우 기본 값으로 처리
                price = 0 if good.get("price") is None else good.get("price")
                sold_out = (
                    "판매" if good.get("sold_out") is None else good.get("sold_out")
                )
                sale = "없음" if good.get("sale") is None else good.get("sale")
                coupon = "없음" if good.get("coupon") is None else good.get("coupon")

                if good["code"] not in existing_codes:
                    try:
                        oliveyoung_model = BrandShopModel(
                            idx=good["idx"],
                            market="올리브영",
                            brand=good["brand"],
                            brand_code=good["brand_code"],
                            code=good["code"],
                            name=good["name"],
                            price=price,
                            sold_out=sold_out,
                            collection_time=good["time"],
                            sale=sale,
                            coupon=coupon,
                        )
                        new_oliveyoung_models.append(oliveyoung_model)
                    except Exception as e:
                        logger.error(
                            f"collect_brand_shop, An error occurred while creating model instance/manager/brandlist: {e}"
                        )
                        raise HTTPException(
                            status_code=500,
                            detail="An error occurred while creating model instance.",
                        )

        # MongoDB collection 가져오기
        collection = mongodb_service.engine.get_collection(BrandShopModel)

        # bulk update operations 생성
        bulk_operations = []
        for model in new_oliveyoung_models:
            model_dict = model.dict(exclude={"id"})
            bulk_operations.append(
                UpdateOne(
                    {"code": model.code},
                    {"$set": model_dict},
                    upsert=True,
                )
            )

        # bulk update 실행
        if bulk_operations:
            try:
                result = await collection.bulk_write(bulk_operations)
                logger.info(
                    f"collect_brand_shop, Bulk write result: {result.bulk_api_result}"
                )
            except Exception as e:
                logger.error(
                    f"collect_brand_shop, An error occurred while saving new models/manager/brandlist: {e}"
                )
                raise HTTPException(
                    status_code=500,
                    detail="collect_brand_shop, An error occurred while saving new models.",
                )

        # MongoDB에서 데이터 가져오기
        try:
            saved_goods = await mongodb_service.engine.find(
                BrandShopModel,
                {"code": {"$in": [model.code for model in new_oliveyoung_models]}},
            )
            saved_goods_list = []
            for item in saved_goods:
                item_dict = item.dict()
                # '_id' 및 'id' 필드 제거
                item_dict.pop("_id", None)
                item_dict.pop("id", None)
                saved_goods_list.append(item_dict)
            logger.info(f"{saved_goods_list}")

            # JSON 응답 생성
            return JSONResponse(content={"saved_goods_list": saved_goods_list})

        except Exception as e:
            logger.error(
                f"collect_brand_shop, An error occurred while fetching saved goods_/collect/brandshop: {e}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching saved goods.",
            )

    except Exception as e:
        logger.error(
            f"collect_brand_shop, An error occurred while collecting /collect/brandshop: {e}"
        )
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brandshop."
        )


class CollectRequest(BaseModel):
    goodsCodes: List[str]
    brandCode: str
    brandName: str


@router.post("/collect/brandgoodsdetail", response_class=JSONResponse)
async def send_goods_detail(
    input_data: CollectRequest, background_tasks: BackgroundTasks
):
    try:
        logger.info(
            f"Starting post.brandgoodsdetail:{input_data.goodsCodes},{input_data.brandCode},{input_data.brandName}"
        )

        record = CollectionRecordsModel(
            goodsCodes=input_data.goodsCodes,
            brandCode=input_data.brandCode,
            brandName=input_data.brandName,
            status="pending",
            request_count=len(input_data.goodsCodes),
            success_count=0,
            start_date=time.strftime("%Y-%m-%d %H:%M:%S"),
            end_date=None,  # 기본값으로 None 설정
        )

        await mongodb_service.records_engine.save(record)
        logger.info(f"Record saved to MongoDB: {record.id}")

        # 저장 후 일정 시간 대기
        await asyncio.sleep(1)  # 1초 대기 (필요에 따라 시간 조절)

        # 저장 후 다시 조회하여 백그라운드 작업에 전달
        saved_record = await mongodb_service.records_engine.find_one(
            CollectionRecordsModel, CollectionRecordsModel.id == record.id
        )
        if not saved_record:
            logger.error(f"Record with id {record.id} not found after saving")
            raise HTTPException(
                status_code=500,
                detail=f"Record with id {record.id} not found after saving",
            )

        background_tasks.add_task(process_collect_data, saved_record.id)

        return {"record_id": str(saved_record.id)}

    except Exception as e:
        logger.error(
            f"collect_brand_goods_detail,An error occurred: {e}", exc_info=True
        )
        raise HTTPException(status_code=500, detail=str(e))


async def process_collect_data(record_id: str):
    record = await mongodb_service.records_engine.find_one(
        CollectionRecordsModel, CollectionRecordsModel.id == record_id
    )

    if not record:
        logger.error(f"Record with id {record_id} not found")
        return

    goods_codes = record.goodsCodes
    brand_code = record.brandCode
    brand_name = record.brandName
    all_goods = []

    for goodscode in goods_codes:
        logger.info(f"Process_message, Processing goodscode: {goodscode}")
        brand_goods_code = BrandGoodsDetail(goodscode)
        goods = await brand_goods_code.run()
        all_goods.append(goods)

    logger.info(
        f"Process_message, Completed task.goods_detail_task with record ID: {record_id}"
    )

    new_oliveyoung_models = []
    for good in all_goods:
        if isinstance(good, dict):
            total_price = (
                0
                if good.get("total_price") is None or good.get("total_price") == "null"
                else int(good.get("total_price"))
            )
            goods_origin = (
                0
                if good.get("goods_origin") is None
                or good.get("goods_origin") == "null"
                else int(good.get("goods_origin"))
            )
            sale_start = (
                "null" if good.get("sale_start") is None else good.get("sale_start")
            )
            sale_end = "null" if good.get("sale_end") is None else good.get("sale_end")
            sale_price = (
                0
                if good.get("sale_price") is None or good.get("sale_price") == "null"
                else int(good.get("sale_price"))
            )
            coupon_start = (
                "null" if good.get("coupon_start") is None else good.get("coupon_start")
            )
            coupon_end = (
                "null" if good.get("coupon_end") is None else good.get("coupon_end")
            )
            coupon_price = (
                0
                if good.get("coupon_price") is None
                or good.get("coupon_price") == "null"
                else int(good.get("coupon_price"))
            )

            sold_out = "null" if good.get("sold_out") is None else good.get("sold_out")

            sale = (
                "세일"
                if good.get("sale_price", "null") not in ["null", None, ""]
                else "없음"
            )
            coupon = (
                "쿠폰"
                if good.get("coupon_price", "null") not in ["null", None, ""]
                else "없음"
            )

            thumb = good.get("thumb", {})
            option = good.get("option", {})
            delivery = good.get("delivery", {})
            # goods_promotion = good.get("goods_promotion", {})

            model = OriginGoodsDetailModel(
                market="올리브영",
                # goods_url=["goods_url"],
                brand=brand_name,
                brand_code=brand_code,
                origin_goods_code=good["code"],
                origin_goods_name=good["name"],
                total_price=total_price,
                goods_origin=goods_origin,
                sale_start=sale_start,
                sale_end=sale_end,
                sale_price=sale_price,
                coupon_start=coupon_start,
                coupon_end=coupon_end,
                coupon_price=coupon_price,
                # goods_promotion=goods_promotion,
                delivery=delivery,
                option=option,
                sold_out=sold_out,
                thumb=thumb,
                collection_time=good["collection_time"],
                sale=sale,
                coupon=coupon,
            )

            new_oliveyoung_models.append(model)
            logger.info(
                f"Process_message, Model prepared for goodscode: {goodscode}, model: {model}"
            )

        # Save models to MongoDB using Odmantic
    try:
        await mongodb_service.engine.save_all(new_oliveyoung_models)
        logger.info(f"Process_message, Successfully saved models to MongoDB")
        record.status = "completed"
        record.success_count = len(new_oliveyoung_models)
        record.end_date = time.strftime("%Y-%m-%d %H:%M:%S")
        await mongodb_service.records_engine.save(record)
        logger.info(f"Record updated to completed: {record.id}")
    except Exception as e:
        logger.error(
            f"Process_message, An error occurred while saving models: {e}",
            exc_info=True,
        )
        record.status = "failed"
        record.end_date = time.strftime("%Y-%m-%d %H:%M:%S")
        await mongodb_service.records_engine.save(record)
        raise Exception(f"Process_message, An error occurred while saving models: {e}")

    # MongoDB에서 데이터 가져오기
    try:
        saved_goods = await mongodb_service.engine.find(
            OriginGoodsDetailModel,
            {"code": {"$in": [model.code for model in new_oliveyoung_models]}},
        )
        saved_goods_list = []
        for item in saved_goods:
            item_dict = item.dict()
            # '_id' 및 'id' 필드 제거
            item_dict.pop("_id", None)
            item_dict.pop("id", None)
            saved_goods_list.append(item_dict)
        logger.info(f"{saved_goods_list}")

        # JSON 응답 생성
        return JSONResponse(content={"saved_goods_list": saved_goods_list})
    except Exception as e:
        logger.error(
            f"collect_brand_shop, An error occurred while fetching saved goods_/collect/brandshop: {e}"
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching saved goods.",
        )
