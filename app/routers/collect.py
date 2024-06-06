from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime
import asyncio
import logging
from pathlib import Path
from app.models.oliveyoung_model import (
    BrandListModel,
    BrandShopModel,
    OriginGoodsDetailModel,
)
from app.oliveyoung_scraper import BrandList, BrandShop, BrandGoodsDetail
from app.services.mongodb import mongodb_service
from fastapi.responses import JSONResponse, Response
import json
from typing import List, Dict
from pymongo import UpdateOne
from pydantic import BaseModel


router = APIRouter()

# Jinja2 템플릿 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# 로깅 설정
logging.basicConfig(
    filename="log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# logger 객체 생성
logger = logging.getLogger(__name__)


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
            # 오류 처리
            logging.error(f"An error occurred while finding existing codes: {e}")
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
            # 오류 처리
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
        logging.error(f"An error occurred while collecting brand list: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brand list."
        )


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
            logging.error(
                f"No goods found for brand code_/collect/brandshop: {input_code}"
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
            logging.error(
                f"An error occurred while finding existing codes_/collect/brandshop: {e}"
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
                        logging.error(
                            f"An error occurred while creating model instance/manager/brandlist: {e}"
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
                logging.info(f"Bulk write result: {result.bulk_api_result}")
            except Exception as e:
                logging.error(
                    f"An error occurred while saving new models/manager/brandlist: {e}"
                )
                raise HTTPException(
                    status_code=500, detail="An error occurred while saving new models."
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
            logging.error(
                f"An error occurred while fetching saved goods_/collect/brandshop: {e}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching saved goods.",
            )

    except Exception as e:
        logging.error(f"An error occurred while collecting /collect/brandshop: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brandshop."
        )


class InputData(BaseModel):
    goodsCodes: List[str]
    brandCode: str
    brandName: str


@router.post("/collect/brandgoodsdetail", response_class=HTMLResponse)
async def collect_brand_goods_detail(request: Request, input_data: InputData):

    try:
        goods_codes = input_data.goodsCodes
        brand_code = input_data.brandCode
        brand_name = input_data.brandName

        # 결과를 저장할 리스트
        all_goods = []

        for goodscode in goods_codes:
            brand_goods_code = BrandGoodsDetail(goodscode)
            goods = await brand_goods_code.run()
            all_goods.append(goods)

        # MongoDB collection 가져오기
        engine = mongodb_service.engine

        new_oliveyoung_models = []
        for good in all_goods:
            if isinstance(good, dict):
                total_price = (
                    0
                    if good.get("totalprice") is None
                    or good.get("totalprice") == "null"
                    else int(good.get("totalprice"))
                )
                goods_origin = (
                    0
                    if good.get("goodsorigin") is None
                    or good.get("goodsorigin") == "null"
                    else int(good.get("goodsorigin"))
                )
                sale_start = (
                    "null" if good.get("salestart") is None else good.get("salestart")
                )
                sale_end = (
                    "null" if good.get("saleend") is None else good.get("saleend")
                )
                sale_price = (
                    0
                    if good.get("saleprice") is None or good.get("saleprice") == "null"
                    else int(good.get("saleprice"))
                )
                coupon_start = (
                    "null"
                    if good.get("couponstart") is None
                    else good.get("couponstart")
                )
                coupon_end = (
                    "null" if good.get("couponend") is None else good.get("couponend")
                )
                coupon_price = (
                    0
                    if good.get("couponprice") is None
                    or good.get("couponprice") == "null"
                    else int(good.get("couponprice"))
                )
                soldout = (
                    "null" if good.get("sold_out") is None else good.get("sold_out")
                )

                # Sale and coupon values
                sale = (
                    "세일"
                    if good.get("saleprice", "null") not in ["null", None, ""]
                    else "없음"
                )
                coupon = (
                    "쿠폰"
                    if good.get("couponprice", "null") not in ["null", None, ""]
                    else "없음"
                )

                # thumb 필드가 딕셔너리인 경우 문자열로 변환하지 않고 그대로 사용
                thumb = good.get("thumb", {})

                # if isinstance(thumb, dict):
                #     thumb = ", ".join(f"{key}: {value}" for key, value in thumb.items())

                model = OriginGoodsDetailModel(
                    market="올리브영",
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
                    delivery=good["delivery"],
                    sold_out=soldout,
                    thumb=thumb,
                    collection_time=good["collectiontime"],
                    sale=sale,
                    coupon=coupon,
                )

                new_oliveyoung_models.append(model)

        # Save all models to MongoDB using Odmantic
        if new_oliveyoung_models:
            try:
                await engine.save_all(new_oliveyoung_models)
                logging.info("Successfully saved all new models to MongoDB")
            except Exception as e:
                logging.error(
                    f"An error occurred while saving new models_/collect/brandgoodsdetail: {e}"
                )
                raise HTTPException(
                    status_code=500, detail="An error occurred while saving new models."
                )

        # 템플릿 렌더링 및 응답 반환
        return templates.TemplateResponse(
            "./index.html",
            {"request": request, "title": "올리브영 수집기", "goods": goods},
        )

    except Exception as e:
        logging.error(f"An error occurred while collecting brandgoodsdetail: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while collecting brandgoodsdetail.",
        )
