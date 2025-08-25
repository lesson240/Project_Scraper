# path: app/config/mongodb.py
# MongoDB 설정
import os
import json
from pathlib import Path

def load_secrets():
    """프로젝트 루트의 secrets.json에서 비밀 정보를 로드합니다."""
    try:
        project_root = Path(__file__).parent.parent.parent
        secrets_path = project_root / "secrets.json"
        
        if secrets_path.exists():
            with open(secrets_path, 'r', encoding='utf-8') as f:
                secrets = json.load(f)
                return secrets
        else:
            print(f"⚠️ secrets.json 파일을 찾을 수 없습니다: {secrets_path}")
            return {}
    except Exception as e:
        print(f"⚠️ secrets.json 로드 실패: {e}")
        return {}

# MongoDB 설정
MONGODB_CONFIG = {
    "uri": os.getenv("MONGODB_URI", "mongodb://localhost:27017"),
    "db_name": os.getenv("MONGODB_DB_NAME", "project_scraper"),
    "collection_name": "exchange_rates"
}

# MongoDB 데이터베이스 이름
MONGO_DB_NAME = "scrapmarket"
MONGO_DB_NAME_RECORDS = "records"
MONGO_DB_NAME_USERS = "users"
MONGO_DB_NAME_IMAGES = "images"
MONGO_DB_NAME_EXTERNAL_API = "externalApi"
MONGO_DB_NAME_SETTINGS = "settings"
MONGO_DB_URL = load_secrets().get("MONGO_URL", "mongodb://localhost:27017")

# MongoDB 컬렉션 구조 정의
MONGODB_COLLECTIONS = {
    "images": {
        "name": MONGO_DB_NAME_IMAGES,
        "folders": ["thumbnail_metadata"]
    },
    "external_api": {
        "name": MONGO_DB_NAME_EXTERNAL_API,
        "folders": ["koreaexim", "customs"]
    },
}

# MongoDB 설정 검증
def validate_mongodb_config():
    """MongoDB 설정 상태를 확인합니다."""
    if not MONGO_DB_URL:
        print("⚠️ MongoDB URL이 설정되지 않았습니다.")
        return False
    else:
        print("✅ MongoDB 설정이 완료되었습니다.")
        return True

# 설정 로드 시 MongoDB 설정 검증
if __name__ == "__main__":
    validate_mongodb_config()
