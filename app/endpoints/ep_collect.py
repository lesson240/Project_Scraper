from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.services.mongodb import mongodb_service
from app.models.oliveyoung_model import BrandListModel
from bson import ObjectId  # ObjectId를 사용하기 위해 bson 패키지를 import합니다.
import logging
from app.routers.collect import collect_brand_list


router = APIRouter()

# 로깅 설정
logging.basicConfig(
    filename="log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# logger 객체 생성
logger = logging.getLogger(__name__)


@router.get("/endpoint/brandlist")
async def endpoint_collect_brand_list(request: Request):
    try:
        # 로깅: 요청이 도착했음을 로그에 남깁니다.
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
