# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.utils.router_utils import set_version

# 라이브러리 불러오기
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

router = APIRouter()

# Jinja2 템플릿 경로 설정
templates_directory = BASE_DIR / "app" / "templates"
logger.info(f"Templates directory: {templates_directory}")
templates = Jinja2Templates(directory=templates_directory)


@router.get("/manager", response_class=HTMLResponse)
async def product_collect(request: Request):
    return templates.TemplateResponse(
        "manager.html",
        {
            "request": request,
            "title": "올리브영 수집기",
            "api_version": set_version(),
        },
    )
