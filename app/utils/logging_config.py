import sys
from pathlib import Path

# 프로젝트의 루트 디렉토리를 구합니다.
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# 라이브러리 불러오기
import logging
from logging.handlers import RotatingFileHandler
import os
from dotenv import load_dotenv
from colorlog import ColoredFormatter


# .env 파일 로드
load_dotenv(".env")
CLOUD_EXECUTION_ENV = os.getenv("CLOUD_EXECUTION_ENV", "local")

log_format = "%(asctime)s - %(levelname)s - %(message)s"


def setup_logger(name, caller_file):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # 로거의 기본 레벨을 DEBUG로 설정

    # 호출 파일의 경로를 기반으로 폴더 이름 설정
    caller_path = Path(caller_file).parent.relative_to(BASE_DIR)
    dynamic_log_folder = caller_path

    # 색상 포맷터 설정
    color_formatter = ColoredFormatter(
        "%(log_color)s%(asctime)s - %(levelname)s - %(message)s",
        datefmt=None,
        reset=True,
        log_colors={
            "DEBUG": "white",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "bold_red",
        },
        secondary_log_colors={},
        style="%",
    )

    # 로깅 디렉토리 설정
    if CLOUD_EXECUTION_ENV == "local":
        log_dir = BASE_DIR / "tmp" / dynamic_log_folder  # 동적 폴더 이름 사용
        if not log_dir.exists():
            log_dir.mkdir(parents=True, exist_ok=True)
        # 로컬 개발 환경
        info_handler = RotatingFileHandler(
            log_dir / f"{name}_info.log",
            maxBytes=2000,
            backupCount=10,
            encoding="utf-8",
        )
        info_handler.setLevel(logging.INFO)
        info_handler.setFormatter(logging.Formatter(log_format))

        error_handler = RotatingFileHandler(
            log_dir / f"{name}_error.log",
            maxBytes=2000,
            backupCount=10,
            encoding="utf-8",
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(logging.Formatter(log_format))

        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.ERROR)
        console_handler.setFormatter(color_formatter)

        logger.addHandler(info_handler)
        logger.addHandler(error_handler)
        logger.addHandler(console_handler)
    else:
        # CLOUD 환경
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(logging.INFO)
        stream_handler.setFormatter(color_formatter)
        logger.addHandler(stream_handler)
        logger.setLevel(logging.INFO)

    return logger


def setup_custom_logger():
    logger = logging.getLogger("uvicorn.custom")
    logger.setLevel(logging.DEBUG)

    # colorlog 설정
    handler = logging.StreamHandler(sys.stdout)
    formatter = ColoredFormatter(
        "%(log_color)s%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "bold_red",
        },
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger


# 커스텀 로거 인스턴스 생성
custom_logger = setup_custom_logger()
