# path: app/routers/business_router.py

from fastapi import APIRouter, HTTPException
from app.config.database import get_database
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.service_business_registration import (
    normalize_business_number,
    validate_business_number,
    verify_with_odcloud,
)

router = APIRouter(prefix="/business", tags=["Business"])


class BusinessVerifyRequest(BaseModel):
    b_no: str = Field(..., description="사업자등록번호, 하이픈 허용")
    start_dt: str = Field(..., description="개업일 YYYYMMDD")
    p_nm: str = Field(..., description="대표자명")
    b_nm: Optional[str] = Field("", description="상호명")


class BusinessVerifyResponse(BaseModel):
    valid: bool
    status: str
    message: str
    raw: Optional[Dict[str, Any]] = None


@router.post("/verify", response_model=BusinessVerifyResponse)
async def verify_business(request: BusinessVerifyRequest) -> BusinessVerifyResponse:
    number = normalize_business_number(request.b_no)
    if not validate_business_number(number):
        raise HTTPException(status_code=400, detail="잘못된 사업자등록번호 형식입니다.")

    # 1) DB 중복 선검사
    try:
        db = get_database()
        users = db.users
        exists = await users.find_one({"business_info.business_registration": number})
        if exists:
            return BusinessVerifyResponse(
                valid=False,
                status="DUPLICATE",
                message="동일한 사업자등록번호가 이미 존재합니다.",
                raw={"matched_user_id": str(exists.get("_id"))}
            )
    except Exception:
        # DB 점검 실패 시에도 외부 검증은 계속 진행
        pass

    # 2) 외부 진위확인
    result = verify_with_odcloud(
        b_no=number,
        start_dt=request.start_dt,
        p_nm=request.p_nm,
        b_nm=request.b_nm or "",
    )

    if not isinstance(result, dict) or "valid" not in result:
        raise HTTPException(status_code=502, detail="외부 검증 응답 오류")

    return BusinessVerifyResponse(
        valid=bool(result.get("valid")),
        status=str(result.get("status", "")),
        message=str(result.get("message", "")),
        raw=result.get("raw"),
    )
