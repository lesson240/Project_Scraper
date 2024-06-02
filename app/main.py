from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import (
    collect,
    index,
    autocomplete,
    brands,
    pagecollect,
    pagemanage,
    pageorder,
    pagesetting,
    pageuser,
    pagemanager,
)  # , user 사용자 서비스를 비활성화합니다.
from app.endpoints import ep_collect
from datetime import datetime
from app.services.mongodb import mongodb_service
from fastapi.middleware.cors import CORSMiddleware
import logging

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

# 로깅 설정
logging.basicConfig(
    filename="log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# 라우터 추가
app.include_router(index.router)
app.include_router(collect.router)
app.include_router(autocomplete.router)
app.include_router(brands.router)
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
    print("정상적으로 서버에 연결되었습니다.")
    await mongodb_service.connect()


@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 후 실행되는 이벤트 핸들러"""
    print("정상적으로 서버에 연결 해제되었습니다.")
    logging.info(f"Application shutdown: {datetime.now()}")
    await mongodb_service.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
