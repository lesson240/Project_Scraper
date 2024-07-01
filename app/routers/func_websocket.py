# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.utils.util_websocket import ProfileManager, BrowserManager
from app.websockets.socket_coupang import Session

# 라이브러리 불러오기
from fastapi import APIRouter
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

router = APIRouter()

# 쿠키 매니저 및 브라우저 매니저 인스턴스 생성
profile_manager = ProfileManager(refresh_interval_days=1)
browser_manager = BrowserManager()


@router.post("/websocket-coupang")
async def websocket_coupang_endpoint():
    try:
        # 임시 user_id 변수 선언
        user_id = "temp_user_id"
        site_name = "coupang"
        url = "https://wing.coupang.com/"

        session = Session(user_id, site_name, url)
        await session.start_browser()  # 기존 브라우저 세션에서 새로운 탭을 엽니다.
        await session.load_session()
        await session.navigate_to_url(url)
        # 추가 작업 수행
        await session.save_session()
        # await session.close_browser()  # 필요한 경우에만 브라우저를 닫습니다.
        return {"message": "Session started and action performed successfully."}
    except Exception as e:
        logger.error(f"Error in websocket-coupang endpoint: {e}")
        return {"error": str(e)}
