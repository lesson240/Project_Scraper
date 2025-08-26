# path: app/exceptions/global_exception_handler.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.exceptions.price_setting_exceptions import PriceSettingError

async def price_setting_exception_handler(request: Request, exc: PriceSettingError):
    """가격 설정 관련 예외를 HTTP 응답으로 변환"""
    return JSONResponse(
        status_code=500,
        content={
            "error": exc.error_code or "PRICE_SETTING_ERROR",
            "message": str(exc),
            "details": exc.details,
            "path": str(request.url)
        }
    )

def register_exception_handlers(app):
    """FastAPI 앱에 예외 핸들러 등록"""
    app.add_exception_handler(PriceSettingError, price_setting_exception_handler)
