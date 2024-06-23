# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from utils.router_utils import include_routers
from app.routers import (
    func_autocomplete,
    func_inquiry,
    index,
    page_admin,
    page_order_management,
    page_product_collection,
    page_product_management,
    page_user_setting,
    user_account,
)  # , user 사용자 서비스를 비활성화합니다.
from app.services.mongodb import mongodb_service
from app.utils.router_utils import get_versioned_prefix, include_routers

# 라이브러리 불러오기
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from datetime import datetime
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)
app = FastAPI()

# 정적 파일 경로 설정
app.mount(
    "/static", StaticFiles(directory=BASE_DIR / "path/tabler/static"), name="static"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 버전 설정

prefix = get_versioned_prefix()

# 라우터 목록
routers = [
    (func_autocomplete.router, ["FuncAutocomplete"]),
    (func_inquiry.router, ["FuncInquiry"]),
    (index.router, ["PageHome"]),
    (page_admin.router, ["PageAdmin"]),
    (page_order_management.router, ["PageOrderManagement"]),
    (page_product_collection.router, ["PageProductCollection"]),
    (page_product_management.router, ["PageProductManagement"]),
    (page_user_setting.router, ["PageUserSetting"]),
    (user_account.router, ["UserAccount"]),
]

# 라우터 포함
include_routers(app, routers, prefix=prefix)

# 템플릿 설정
templates = Jinja2Templates(directory=BASE_DIR / "templates")


# 앱 시작 및 종료 이벤트 핸들러
@app.on_event("startup")
async def startup_event():
    """앱 시작 전 실행되는 이벤트 핸들러"""
    logger.info("정상적으로 서버에 연결되었습니다.")
    await mongodb_service.connect()


@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 후 실행되는 이벤트 핸들러"""
    logger.info("정상적으로 서버에 연결 해제되었습니다.")
    logger.info(f"Application shutdown: {datetime.now()}")
    await mongodb_service.close()


@app.get(f"/{prefix}")
def get_page(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request, "api_version": prefix}
    )
