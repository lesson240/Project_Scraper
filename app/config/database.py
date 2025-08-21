# path: app/config/database.py
# AWS 및 NAVER API 설정
import os
import json
from pathlib import Path

def get_secret(key: str, default_value: str = None):
    """프로젝트 루트의 secrets.json에서 비밀 정보를 로드합니다."""
    try:
        project_root = Path(__file__).parent.parent.parent
        secrets_path = project_root / "secrets.json"
        
        if secrets_path.exists():
            with open(secrets_path, 'r', encoding='utf-8') as f:
                secrets = json.load(f)
                return secrets.get(key, default_value)
        else:
            print(f"⚠️ secrets.json 파일을 찾을 수 없습니다: {secrets_path}")
            return default_value
    except Exception as e:
        print(f"⚠️ secrets.json 로드 실패: {e}")
        return default_value

# AWS 설정
AWS_ACCESS_KEY = get_secret("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = get_secret("AWS_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")

# NAVER API 설정
NAVER_API_ID = get_secret("NAVER_API_ID")
NAVER_API_SECRET = get_secret("NAVER_API_SECRET")
