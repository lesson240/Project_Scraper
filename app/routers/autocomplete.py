from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import logging
from typing import List
from app.services.mongodb import mongodb_service
from app.models.oliveyoung import BrandListModel
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
        brand_names: List[str] = [brand.brand for brand in brands]
        return {"brands": brand_names}
    except Exception as e:
        logging.error(
            f"An error occurred while fetching autocomplete brands: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching autocomplete brands.",
        )
