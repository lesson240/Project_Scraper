# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.routers import (
    func_autocomplete,
    func_inquiry,
    func_websocket,
    index,
    page_admin,
    page_order_management,
    page_product_collection,
    page_product_upload,
    page_user_setting,
    user_account,
)  # , user 사용자 서비스를 비활성화합니다.
from app.services.service_mongodb import mongodb_service
from app.utils.util_router import get_versioned_prefix, include_routers

# 라이브러리 불러오기
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
from datetime import datetime
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

# 버전 설정
prefix = get_versioned_prefix()

# 라우터 목록
routers = [
    (func_autocomplete.router, ["FuncAutocomplete"]),
    (func_inquiry.router, ["FuncInquiry"]),
    (func_websocket.router, ["FuncWebsocket"]),
    (index.router, ["PageHome"]),
    (page_admin.router, ["PageAdmin"]),
    (page_order_management.router, ["PageOrderManagement"]),
    (page_product_collection.router, ["PageProductCollection"]),
    (page_product_upload.router, ["PageProductUpload"]),
    (page_user_setting.router, ["PageUserSetting"]),
    (user_account.router, ["UserAccount"]),
]


# 앱 시작 및 종료 이벤트 핸들러
@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작 전과 종료 후 실행되는 lifespan 이벤트 핸들러"""
    # startup
    logger.info("정상적으로 서버에 연결되었습니다.")
    logger.info(f"FastAPI started on: http://127.0.0.1:8000{prefix}/")
    await mongodb_service.connect()

    yield  # app 실행 유지

    # shutdown
    logger.info("정상적으로 서버에 연결 해제되었습니다.")
    logger.info(f"Application shutdown: {datetime.now()}")
    await mongodb_service.close()


# app 객체 선언
app = FastAPI(lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:5173"],  # React dev server adress
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 경로 설정
app.mount(
    "/static", StaticFiles(directory=BASE_DIR / "path/tabler/static"), name="static"
)
app.mount(
    "/websockets", StaticFiles(directory=BASE_DIR / "app/websockets"), name="websockets"
)

# 라우터 포함
include_routers(app, routers, prefix=prefix)

# 템플릿 설정 및 기타 설정
templates = Jinja2Templates(directory=BASE_DIR / "templates")


# 라우팅 함수들 정의
@app.get(prefix if prefix.startswith("/") else f"/{prefix}")
def get_page(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request, "api_version": prefix}
    )
