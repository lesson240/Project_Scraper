from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.models import mongodb
from app.models.oliveyoung_model import BrandListModel
from app.oliveyoung_scraper import BrandList
from datetime import datetime
import asyncio
import logging

app = FastAPI()

# Tabler의 정적 파일 경로를 지정합니다.
BASE_DIR = Path(__file__).resolve().parent
app.mount(
    "/static", StaticFiles(directory=BASE_DIR / "path/tabler/static"), name="static"
)

# Jinja2 템플릿 경로 설정
templates = Jinja2Templates(directory=BASE_DIR / "templates")
logging.basicConfig(filename="log.txt", level=logging.INFO)


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse(
        "./index.html", {"request": request, "title": "올리브영 수집기"}
    )


@app.get("/collect", response_class=HTMLResponse)
async def collect(request: Request):
    try:
        # 1. BRAND_LIST 수집 시, SCRAPER 로 BRAND_LIST를 수집한다.
        brands = await asyncio.to_thread(BrandList.run)  # 비동기적으로 실행
        oliveyoung_models = []
        existing_codes = {
            item.code for item in await mongodb.engine.find(BrandListModel)
        }

        for brand in brands:
            print(brand)
            if brand["code"] in existing_codes:
                continue
            oliveyoung_model = BrandListModel(
                code=brand["code"],
                brand=brand["brand"],
                collection_time=brand["time"],
                status=brand["status"],
            )
            oliveyoung_models.append(oliveyoung_model)

        # 2. DB에 수집된 데이터를 저장한다. (모델 인스턴스를 통해 각 DB에 저장)
        if oliveyoung_models:
            await mongodb.engine.save_all(oliveyoung_models)

        # 3. HTML BODY에 표시한다.
        return templates.TemplateResponse(
            "./index.html",
            {"request": request, "title": "올리브영 수집기", "brands": brands},
        )

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return templates.TemplateResponse(
            "./index.html",
            {
                "request": request,
                "title": "올리브영 수집기",
                "error": "An error occurred while collecting data.",
            },
        )


@app.on_event("startup")
async def startup_event():
    """before app starts"""
    mongodb.connect()


@app.on_event("shutdown")
async def shutdown_event():
    logging.info(f"Application shutdown: {datetime.now()}")
    mongodb.close()
