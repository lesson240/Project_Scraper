from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import logging
from typing import List, Dict
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel
import re

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
        logging.error(
            f"An error occurred while fetching autocomplete brands: {e}", exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={"error": "An error occurred while fetching autocomplete brands."},
        )
