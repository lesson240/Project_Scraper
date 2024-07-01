# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.services.service_mongodb import mongodb_service
from app.models.model_oliveyoung import BrandListModel, BrandShopModel

# 라이브러리 불러오기
from fastapi import APIRouter, HTTPException, Query
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

router = APIRouter()


@router.get("/get_brand_info")
async def get_brand_info(
    code: str = Query(
        ..., min_length=1, description="The brand code to get the information for"
    )
):
    try:
        brand_model = await mongodb_service.engine.find_one(
            BrandListModel, BrandListModel.code == code
        )
        if not brand_model:
            raise HTTPException(status_code=404, detail="Brand not found")
        return brand_model.dict()
    except Exception as e:
        logger.error(
            f"An error occurred while fetching the brand information: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching the brand information.",
        )


@router.get("/info/brandshop")
async def get_info_brandshop(
    brand_code: str = Query(..., description="The brand code"),
    brand: str = Query(..., description="The brand"),
):
    try:
        brand_model = await mongodb_service.engine.find_one(
            BrandShopModel, BrandShopModel.code == brand_code
        )
        if not brand_model:
            raise HTTPException(status_code=404, detail="Brand not found")
        return brand_model.dict()
    except Exception as e:
        logger.error(
            f"An error occurred while fetching the brand information: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching the brand information.",
        )
