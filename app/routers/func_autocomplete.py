# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel, OriginGoodsDetailModel
from app.utils.router_utils import set_version

# 라이브러리 불러오기
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import List, Dict
import re
from pathlib import Path
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

router = APIRouter()


@router.get("/autocomplete/brands", response_class=JSONResponse)
async def autocomplete_brands(
    query: str = Query(
        ..., min_length=1, description="The query string for brand search"
    )
):
    try:
        # MongoDB에서 입력된 query를 포함하는 brand 값을 찾기 위해 정규 표현식을 사용
        regex = re.compile(f".*{re.escape(query)}.*", re.IGNORECASE)
        # BrandListModel.brand 필드가 아닌, BrandListModel.brand 문자열 필드를 사용하여 검색
        brands = await mongodb_service.engine.find(
            BrandListModel, {"brand": {"$regex": regex}}
        )
        brand_list: List[Dict[str, str]] = [
            {"brand": brand.brand, "code": brand.code} for brand in brands
        ]

        # 검색어와 일치하는 브랜드를 반환
        return {"brands": brand_list}
    except Exception as e:
        logger.error(
            f"An error occurred while fetching autocomplete brands: {e}", exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={"error": "An error occurred while fetching autocomplete brands."},
        )


@router.get("/autocomplete/collectedbrands", response_class=JSONResponse)
async def autocomplete_collected_brands(
    query: str = Query(
        ..., min_length=1, description="The query string for collecte brand search"
    )
):
    try:
        # MongoDB에서 입력된 query를 포함하는 brand 값을 찾기 위해 정규 표현식을 사용
        regex = re.compile(f".*{re.escape(query)}.*", re.IGNORECASE)
        brands = await mongodb_service.engine.find(
            OriginGoodsDetailModel, {"brand": {"$regex": regex}}
        )

        # 중복 제거를 위한 세트 사용
        seen = set()
        unique_brands = []
        for brand in brands:
            if brand.brand_code not in seen:
                seen.add(brand.brand_code)
                unique_brands.append(
                    {"brand": brand.brand, "brand_code": brand.brand_code}
                )

        # 검색어와 일치하는 브랜드를 반환
        return {"brands": unique_brands}
    except Exception as e:
        logger.error(
            f"An error occurred while fetching autocomplete brands: {e}", exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={"error": "An error occurred while fetching autocomplete brands."},
        )
