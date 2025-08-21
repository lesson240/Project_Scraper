from app.models import MongoDB
from app.config import (
    MONGO_DB_NAME,
    MONGO_DB_URL,
    MONGO_DB_NAME_RECORDS,
    MONGO_DB_NAME_USERS,
    MONGO_DB_NAME_IMAGES,
    MONGO_DB_NAME_EXTERNAL_API,
)

# MongoDB 서비스의 인스턴스를 생성할 때 환경 변수와 비밀 정보를 사용합니다.
mongodb_service = MongoDB(
    MONGO_DB_URL, 
    MONGO_DB_NAME, 
    MONGO_DB_NAME_RECORDS, 
    MONGO_DB_NAME_USERS,
    MONGO_DB_NAME_IMAGES,
    MONGO_DB_NAME_EXTERNAL_API
)

# MongoDB 연결 초기화
async def initialize_mongodb():
    """MongoDB 연결을 초기화합니다."""
    try:
        await mongodb_service.connect()
        print(f"✅ MongoDB 연결 초기화 완료: {MONGO_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB 연결 초기화 실패: {str(e)}")
        return False

# MongoDB 연결 상태 확인 및 기본 데이터베이스 설정
async def ensure_mongodb_connection():
    """MongoDB 연결 상태를 확인하고 기본 데이터베이스를 설정합니다."""
    try:
        # 연결이 초기화되지 않았다면 초기화
        if mongodb_service.db is None:
            await initialize_mongodb()
        
        # 연결 상태 확인
        await mongodb_service.db.command("ping")
        print(f"✅ MongoDB 연결 성공: {MONGO_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB 연결 실패: {str(e)}")
        return False
