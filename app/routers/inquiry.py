from fastapi import APIRouter, HTTPException, Query
import logging
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel, BrandShopModel

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
        logging.error(
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
        logging.error(
            f"An error occurred while fetching the brand information: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching the brand information.",
        )
