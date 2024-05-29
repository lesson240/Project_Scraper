from app.models import MongoDB
from app.config import MONGO_DB_NAME, MONGO_DB_URL

# MongoDB 서비스의 인스턴스를 생성할 때 환경 변수와 비밀 정보를 사용합니다.
mongodb_service = MongoDB(MONGO_DB_URL, MONGO_DB_NAME)
