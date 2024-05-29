from fastapi import APIRouter, HTTPException, Query
from app.services.mongodb import mongodb_service
from app.models.oliveyoung import BrandListModel

router = APIRouter()


@router.get("/get_brand_code")
async def get_brand_code(brand: str = Query(..., min_length=1)):
    try:
        brand_obj = await mongodb_service.engine.find_one(
            BrandListModel, BrandListModel.brand == brand
        )
        if not brand_obj:
            raise HTTPException(status_code=404, detail="Brand not found")
        return {"code": brand_obj.code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
