from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

router = APIRouter()

# Jinja2 템플릿 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@router.get("/product-collect", response_class=HTMLResponse)
async def product_collect(request: Request):
    return templates.TemplateResponse("product-collect.html", {"request": request})
