from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime
import asyncio
import logging
from pathlib import Path
from app.models.oliveyoung import BrandListModel, BrandShopModel
from app.oliveyoung_scraper import BrandList, BrandShop
from app.services.mongodb import mongodb_service

router = APIRouter()

# Jinja2 템플릿 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@router.get("/collect/brandlist", response_class=HTMLResponse)
async def collect_brand_list(request: Request):
    try:
        # 입력 받은 코드를 사용하여 BrandShop 생성
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


@router.get("/collect/brandshop", response_class=HTMLResponse)
async def collect_brand_shop(request: Request, input_code: str):
    try:
        # 입력 받은 코드를 사용하여 BrandShop 생성
        brand_shop = BrandShop(input_code)
        # BrandShop을 이용하여 상품 정보 수집
        goods = await brand_shop.run()
        # DB에 이미 있는 데이터인지 확인
        try:
            existing_codes = {
                item.code for item in await mongodb_service.engine.find(BrandShopModel)
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
            price = "null" if good.get("price") is None else good.get("price")
            soldout = "null" if good.get("sold_out") is None else good.get("sold_out")
            sale = "null" if good.get("sale") is None else good.get("sale")
            coupon = "null" if good.get("coupon") is None else good.get("coupon")

            if good["code"] not in existing_codes:
                oliveyoung_model = BrandShopModel(
                    idx=good["idx"],
                    code=good["code"],
                    name=good["name"],
                    price=price,
                    sold_out=soldout,
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
