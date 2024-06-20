from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel
from app.routers.collect import collect_brand_list
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
import os
from dotenv import load_dotenv

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# .env 파일 로드
load_dotenv(".env")

# AWS 환경 확인
AWS_EXECUTION_ENV = os.getenv("AWS_EXECUTION_ENV", "local")

log_format = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(level=logging.ERROR, format=log_format)
logger = logging.getLogger(__name__)

# 로깅 디렉토리 설정
if AWS_EXECUTION_ENV == "local":
    log_dir = BASE_DIR / "tmp" / "routers"
    if not log_dir.exists():
        log_dir.mkdir(parents=True, exist_ok=True)
    # 로컬 개발 환경
    info_handler = RotatingFileHandler(
        log_dir / "ep_collect_info.log", maxBytes=2000, backupCount=10, encoding="utf-8"
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(logging.Formatter(log_format))

    error_handler = RotatingFileHandler(
        log_dir / "ep_collect_error.log",
        maxBytes=2000,
        backupCount=10,
        encoding="utf-8",
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


@router.get("/endpoint/brandlist")
async def endpoint_collect_brand_list(request: Request):
    try:
        logger.info("Request received to /endpoint/brandlist")

        # 서버에서 데이터 가져오기
        data = await mongodb_service.engine.find(BrandListModel)

        # 데이터가 없을 경우 collect.py의 함수 호출
        if not data:
            logger.info("Data not found in database. Calling collect.py function.")
            await collect_brand_list(request)

        # 데이터 처리
        processed_data = []
        for item in data:
            item_dict = item.dict()
            # '_id' 필드 제거
            item_dict.pop("_id", None)  # 수정된 부분
            # ObjectId를 문자열로 변환하여 'id' 필드로 추가
            item_dict["id"] = str(item.id)
            processed_data.append(item_dict)
        # JSONResponse를 사용하여 JSON 형식으로 데이터 반환
        return JSONResponse(content=processed_data)
    except Exception as e:
        # 로깅: 예외가 발생했음을 로그에 남깁니다.
        logger.error(f"An error occurred: {e}")

        # 오류 처리
        return JSONResponse(content={"error": str(e)}, status_code=500)
