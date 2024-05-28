from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from app.models import mongodb
from app.models.oliveyoung import BrandListModel
from app.oliveyoung_scraper import BrandList
from datetime import datetime
import asyncio

# from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
# app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse(
        "./index.html", {"request": request, "title": "올리브영 수집기"}
    )


@app.get("/collect", response_class=HTMLResponse)
async def collect(request: Request):
    # 1. BRAND_LIST 수집 시, SCRAPER 로 BRAND_LIST를 수집한다.
    brands = BrandList.run()
    oliveyoung_models = []
    for brand in brands:
        print(brand)
        oliveyoung_model = BrandListModel(
            code=brand["code"],
            brand=brand["brand"],
            collection_time=brand["time"],
            status=brand["status"],
        )
        oliveyoung_models.append(oliveyoung_model)

    # 2. DB에 수집된 데이터를 저장한다. (모델 인스턴스를 통해 각 DB에 저장)
    await mongodb.engine.save_all(oliveyoung_models)

    # (예외 처리)  동일한 BRAND_CODE의 DIC VALUE는 저장하지 않는다.

    # 3. HTML BODY에 표시한다.
    return templates.TemplateResponse(
        "./index.html",
        {"request": request, "title": "올리브영 수집기", "brands": brands},
    )


@app.on_event("startup")
def startup_event():
    # def on_app_start():
    """before app starts"""
    mongodb.connect()


@app.on_event("shutdown")
def shutdown_event():
    with open("log.txt", mode="a") as log:
        log.write(f"Application shutdown:{datetime.now()}")
    # def on_app_shutdown():
    """after app shutdown"""
    # netstat -ano
    # taskkill /f /pid num
    mongodb.close()


# from enum import Enum

# from fastapi import FastAPI


# class ModelName(str, Enum):
#     alexnet = "alexnet"
#     resnet = "resnet"
#     lenet = "lenet"


# app = FastAPI()


# @app.get("/models/{model_name}")
# async def get_model(model_name: ModelName):
#     if model_name is ModelName.alexnet:
#         return {"model_name": model_name, "message": "Deep Learning FTW!"}

#     if model_name.lenet.value:
#         return {"model_name": model_name, "message": "LeCNN all the images"}

#     return {"model_name": model_name, "message": "Have some residuals"}


# from typing import Optional
# from fastapi import FastAPI

# app = FastAPI()


# @app.get("/hell")
# async def root():
#     print("hello")
#     return {"message": "Hello World"}


# # @app.get("/items/{item_id}")
# # async def read_item(item_id):
# #     return {"item_id": item_id}

# @app.get("/items/{item_id}")
# async def read_item(item_id: int):
#     return {"item_id": item_id}


# @app.get("/items/{item_id}/{asd}")
# async def root(item_id: int, asd: str, q: Optional[str] = None):
#     return {"item_id": item_id, "asd": asd, "q": q}


# from typing import Optional

# from fastapi import FastAPI

# app = FastAPI()


# @app.get("/")
# def read_root():
#     return {"message": "Hello World"}

# @app.get("/item/{item_id}")
# def read_item(item_id: int, q: Optional[str] = None):
#     return {"item_id": item_id, "q": q}
