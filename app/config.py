import json
from pathlib import Path
from typing import Optional
import os
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import boto3

BASE_DIR = Path(__file__).resolve().parent.parent

# .env 파일 로드
load_dotenv(".env")

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
        log_dir / "config_info.log", maxBytes=2000, backupCount=10, encoding="utf-8"
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(logging.Formatter(log_format))

    error_handler = RotatingFileHandler(
        log_dir / "config_error.log", maxBytes=2000, backupCount=10, encoding="utf-8"
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


# secrets.json 파일 로드
def get_secret(
    key: str,
    default_value: Optional[str] = None,
    json_path: str = str(BASE_DIR / "secrets.json"),
):
    with open(json_path) as f:
        secrets = json.loads(f.read())
    try:
        return secrets[key]
    except KeyError:
        if default_value:
            return EnvironmentError(f"Set the {key} environment variable.")


# -----------------------------------------------

AWS_ACCESS_KEY = get_secret("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = get_secret("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")

sqs_client = boto3.client(
    "sqs",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)

# ------------------------------------------------------------

MONGO_DB_NAME = "scrapmarket"
MONGO_DB_NAME_RECORDS = "records"
MONGO_DB_NAME_USERS = "users"
MONGO_DB_URL = get_secret("MONGO_URL")
NAVER_API_ID = get_secret("NAVER_API_ID")
NAVER_API_SECRET = get_secret("NAVER_API_SECRET")

# ------------------------------------------------------------


if __name__ == "__main__":
    world = get_secret("hello")
