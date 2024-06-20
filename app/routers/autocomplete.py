from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import List, Dict
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel, BrandShopModel
import re
from pathlib import Path
import os
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler


BASE_DIR = Path(__file__).resolve().parent.parent.parent

# .env 파일 로드
load_dotenv(".env")

# AWS 환경 확인
AWS_EXECUTION_ENV = os.getenv("AWS_EXECUTION_ENV", "local")

log_format = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(level=logging.ERROR, format=log_format)
logger = logging.getLogger(__name__)

# 로깅 디렉토리 설정
if AWS_EXECUTION_ENV == "local":
    log_dir = BASE_DIR / "tmp" / "routers"
    if not log_dir.exists():
        log_dir.mkdir(parents=True, exist_ok=True)
    # 로컬 개발 환경
    info_handler = RotatingFileHandler(
        log_dir / "autocomplete_info.log",
        maxBytes=2000,
        backupCount=10,
        encoding="utf-8",
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(logging.Formatter(log_format))

    error_handler = RotatingFileHandler(
        log_dir / "autocomplete_error.log",
        maxBytes=2000,
        backupCount=10,
        encoding="utf-8",
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(log_format))

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.ERROR)
    console_handler.setFormatter(logging.Formatter(log_format))

    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
else:
    # AWS Lambda 환경
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    logger.addHandler(stream_handler)
    logger.setLevel(logging.INFO)


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
            BrandShopModel, {"brand": {"$regex": regex}}
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
