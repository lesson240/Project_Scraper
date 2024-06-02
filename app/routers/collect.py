from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime
import asyncio
import logging
from pathlib import Path
from app.models.oliveyoung_model import BrandListModel, BrandShopModel, GoodsDetailModel
from app.oliveyoung_scraper import BrandList, BrandShop, BrandGoodsDetail
from app.services.mongodb import mongodb_service
from fastapi.responses import JSONResponse, Response
import json


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
            logging.error(f"An error occurred while saving new models: {e}")
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
    input_code: str = Query(..., description="The brand code")
):
    try:
        # 로깅: 요청이 도착했음을 로그에 남깁니다.
        logger.info(
            f"Request received to /collect/brandshop with input_code: {input_code}"
        )
        brand_shop = BrandShop(input_code)
        goods = await brand_shop.run()
        if not goods:
            logging.error(f"No goods found for brand code: {input_code}")
            raise HTTPException(
                status_code=404,
                detail=f"No goods found for brand code: {input_code}",
            )

        # 수집된 상품 정보 로깅
        logging.info(f"Goods collected: {goods}")

        # DB에 이미 있는 데이터인지 확인
        try:
            existing_codes = {
                item.code for item in await mongodb_service.engine.find(BrandShopModel)
            }
        except Exception as e:
            logging.error(f"An error occurred while finding existing codes: {e}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while finding existing codes.",
            )

        # 새로운 데이터만 저장할 모델 리스트
        new_oliveyoung_models = []
        for good in goods:
            # value 값이 None 일 경우 "null"로 처리
            price = "null" if good.get("price") is None else good.get("price")
            sold_out = "판매" if good.get("sold_out") is None else good.get("sold_out")
            sale = "없음" if good.get("sale") is None else good.get("sale")
            coupon = "없음" if good.get("coupon") is None else good.get("coupon")

            if good["code"] not in existing_codes:
                oliveyoung_model = BrandShopModel(
                    idx=good["idx"],
                    code=good["code"],
                    name=good["name"],
                    price=price,
                    sold_out=sold_out,
                    sale=sale,
                    coupon=coupon,
                    collection_time=good.get("time"),
                )
                new_oliveyoung_models.append(oliveyoung_model)

        # 새로운 데이터가 있을 경우에만 저장
        if new_oliveyoung_models:
            try:
                await mongodb_service.engine.save_all(new_oliveyoung_models)
            except Exception as e:
                logging.error(f"An error occurred while saving new models: {e}")
                raise HTTPException(
                    status_code=500, detail="An error occurred while saving new models."
                )

        # MongoDB에서 데이터 가져오기
        try:
            saved_goods = await mongodb_service.engine.find(
                BrandShopModel, {"code": {"$in": [good["code"] for good in goods]}}
            )
            saved_goods_list = []
            for item in saved_goods:
                item_dict = item.dict()
                # '_id' 및 'id' 필드 제거
                item_dict.pop("_id", None)
                item_dict.pop("id", None)
                saved_goods_list.append(item_dict)

            # JSON 응답 생성
            return JSONResponse(content={"saved_goods_list": saved_goods_list})

        except Exception as e:
            logging.error(f"An error occurred while fetching saved goods: {e}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching saved goods.",
            )

    except Exception as e:
        logging.error(f"An error occurred while collecting brand shop: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brand shop."
        )


@router.get("/collect/brandgoodsdetail/{goodscode}", response_class=HTMLResponse)
async def collect_brand_goods_detail(request: Request, input_goodscode: str):
    try:
        brand_goods_code = BrandGoodsDetail(input_goodscode)
        goods = await brand_goods_code.run()
        # DB에 이미 있는 데이터인지 확인
        try:
            existing_codes = {
                item.goods_code
                for item in await mongodb_service.engine.find(GoodsDetailModel)
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
        for good in goods:
            # value 값이 None 일 경우 "null"로 처리
            total_price = (
                "null" if good.get("totalprice") is None else good.get("totalprice")
            )
            goods_origin = (
                "null" if good.get("goodsorigin") is None else good.get("goodsorigin")
            )
            sale_start = (
                "null" if good.get("salestart") is None else good.get("salestart")
            )
            sale_end = "null" if good.get("saleend") is None else good.get("saleend")
            sale_price = (
                "null" if good.get("saleprice") is None else good.get("saleprice")
            )
            coupon_start = (
                "null" if good.get("couponstart") is None else good.get("couponstart")
            )
            coupon_end = (
                "null" if good.get("couponend") is None else good.get("couponend")
            )
            coupon_price = (
                "null" if good.get("couponprice") is None else good.get("couponprice")
            )
            soldout = "null" if good.get("sold_out") is None else good.get("sold_out")

            if good["code"] not in existing_codes:
                oliveyoung_model = GoodsDetailModel(
                    goods_code=good["code"],
                    name=good["name"],
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
                    thumb=good["thum"],
                    collection_time=good.get("time"),
                )
                new_oliveyoung_models.append(oliveyoung_model)

        # 새로운 데이터가 있을 경우에만 저장
        if new_oliveyoung_models:
            try:
                await mongodb_service.engine.save_all(new_oliveyoung_models)
            except Exception as e:
                # 오류 처리
                logging.error(f"An error occurred while saving new models: {e}")
                raise HTTPException(
                    status_code=500, detail="An error occurred while saving new models."
                )

        # 템플릿 렌더링 및 응답 반환
        return templates.TemplateResponse(
            "./index.html",
            {"request": request, "title": "올리브영 수집기", "goods": goods},
        )

    except Exception as e:
        logging.error(f"An error occurred while collecting brand shop: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while collecting brand shop."
        )
