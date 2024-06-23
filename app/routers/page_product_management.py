# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import OriginGoodsDetailModel
from app.models.table_model import InputGoodsTableRequest, InputGoodsManagementTable
from app.utils.router_utils import set_version

# 라이브러리 불러오기
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
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


class BrandCodeRequest(BaseModel):
    brandCode: str


@router.post("/product-data", response_class=HTMLResponse)
async def get_product_data(request: Request, brand_code_request: BrandCodeRequest):
    brandCode = brand_code_request.brandCode
    # MongoDB에서 데이터 가져오기
    try:
        saved_goods = await mongodb_service.engine.find(
            OriginGoodsDetailModel,
            {"brand_code": {"$in": [brandCode]}},
        )
        saved_goods_list = []
        for item in saved_goods:
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
async def save_goods_table(request: Request, data: List[InputGoodsTableRequest]):
    try:
        models = [InputGoodsManagementTable(**item.dict()) for item in data]

        # MongoDB에 데이터 저장
        await mongodb_service.engine.save_all(models)
        return {"message": "Data successfully saved"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while saving data: {str(e)}"
        )
