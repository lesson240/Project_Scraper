from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import (
    collect,
    index,
    autocomplete,
    brands,
)  # , user 사용자 서비스를 비활성화합니다.
from datetime import datetime
from app.services.mongodb import mongodb_service
import logging

app = FastAPI()

# 정적 파일 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent  # Project_Scraper 폴더로 수정
app.mount(
    "/static", StaticFiles(directory=BASE_DIR / "path/tabler/static"), name="static"
)

# 로깅 설정
logging.basicConfig(filename="log.txt", level=logging.INFO)

# 라우터 추가
app.include_router(index.router)
app.include_router(collect.router)
app.include_router(autocomplete.router)
app.include_router(brands.router)
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
