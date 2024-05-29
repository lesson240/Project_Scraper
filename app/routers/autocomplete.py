from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import logging
from app.services.mongodb import mongodb_service
from app.models.oliveyoung import BrandListModel

router = APIRouter()


@router.get("/autocomplete/brands", response_class=JSONResponse)
async def autocomplete_brands(request: Request, query: str):
    try:
        # MongoDB에서 입력된 query를 포함하는 brand 값을 찾기
        brands = await mongodb_service.engine.find(
            BrandListModel, BrandListModel.brand.contains(query)
        )
        brand_names = [brand.brand for brand in brands]
        return {"brands": brand_names}
    except Exception as e:
        logging.error(f"An error occurred while fetching autocomplete brands: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching autocomplete brands.",
        )
