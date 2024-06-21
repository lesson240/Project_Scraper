import uvicorn
from app.utils.logging_config import custom_logger

# 주요 설정
host = "localhost"
port = 8000
api_version = "v1"

if __name__ == "__main__":
    # 커스텀 메시지 출력
    custom_logger.info(
        f"Uvicorn running on http://{host}:{port}/{api_version}/ (Press CTRL+C to quit)"
    )
    # FastAPI 서버 실행
    uvicorn.run("app.main:app", host=host, port=port, log_config=None)
