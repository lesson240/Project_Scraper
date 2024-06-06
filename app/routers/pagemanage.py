from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import OriginGoodsDetailModel
from pydantic import BaseModel
import logging

router = APIRouter()

# Jinja2 템플릿 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# logger 설정
logger = logging.getLogger(__name__)


@router.get("/product-manage", response_class=HTMLResponse)
async def product_manage(request: Request):
    return templates.TemplateResponse("product-manage.html", {"request": request})


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
