from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import (
    collect,
    index,
    autocomplete,
    inquiry,
    pagecollect,
    pagemanage,
    pageorder,
    pagesetting,
    pageuser,
    pagemanager,
    ep_collect,
)  # , user 사용자 서비스를 비활성화합니다.
from datetime import datetime
from app.services.mongodb import mongodb_service
from fastapi.middleware.cors import CORSMiddleware
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import os

# from app.tasks.test import my_task
# .env 파일 로드
load_dotenv(".env")

app = FastAPI()

# 정적 파일 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent  # Project_Scraper 폴더로 수정
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

# AWS 환경 확인
AWS_EXECUTION_ENV = os.getenv("AWS_EXECUTION_ENV", "local")

log_format = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(level=logging.ERROR, format=log_format)
logger = logging.getLogger(__name__)


# 로깅 디렉토리 설정
if AWS_EXECUTION_ENV == "local":
    log_dir = BASE_DIR / "tmp"
    if not log_dir.exists():
        log_dir.mkdir(parents=True, exist_ok=True)
    # 로컬 개발 환경
    info_handler = RotatingFileHandler(
        log_dir / "main_info.log", maxBytes=2000, backupCount=10, encoding="utf-8"
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(logging.Formatter(log_format))

    error_handler = RotatingFileHandler(
        log_dir / "main_error.log", maxBytes=2000, backupCount=10, encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(log_format))

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.ERROR)
    console_handler.setFormatter(logging.Formatter(log_format))

    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
else:
    # AWS Lambda 환경
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    logger.addHandler(stream_handler)
    logger.setLevel(logging.INFO)

# 라우터 추가
app.include_router(index.router)
app.include_router(collect.router)
app.include_router(autocomplete.router)
app.include_router(inquiry.router)
app.include_router(pagecollect.router)
app.include_router(pagemanage.router)
app.include_router(pageorder.router)
app.include_router(pagesetting.router)
app.include_router(pageuser.router)
app.include_router(pagemanager.router)
app.include_router(ep_collect.router)

# app.include_router(user.router)  # 사용자 서비스를 비활성화합니다.


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
    logging.info(f"Application shutdown: {datetime.now()}")
    await mongodb_service.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
