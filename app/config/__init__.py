# path: app/config/__init__.py
# config 패키지 초기화 - 모든 설정을 통합 export

# 데이터베이스 설정
from .database import (
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    AWS_REGION,
    SQS_QUEUE_URL,
    NAVER_API_ID,
    NAVER_API_SECRET
)

# MongoDB 설정
from .mongodb import (
    MONGO_DB_NAME,
    MONGO_DB_NAME_RECORDS,
    MONGO_DB_NAME_USERS,
    MONGO_DB_NAME_IMAGES,
    MONGO_DB_NAME_EXTERNAL_API,
    MONGO_DB_NAME_SETTINGS,
    MONGO_DB_URL,
    MONGODB_CONFIG,
    MONGODB_COLLECTIONS,
    validate_mongodb_config
)

# 관세청 API 설정
from .customsapi import (
    CUSTOMS_API_CONFIG,
    validate_customs_api_key
)

# 한국수출입은행 API 설정
from .koreaeximapi import (
    KOREAEXIM_API_CONFIG,
    validate_koreaexim_api_key
)

# 이미지 호스팅 설정
from .imagehost import (
    imagehost_settings,
    load_imagehost_config,
    validate_imagehost_config
)

# 공통 설정
__all__ = [
    # 데이터베이스
    'AWS_ACCESS_KEY',
    'AWS_SECRET_KEY',
    'AWS_REGION',
    'SQS_QUEUE_URL',
    'NAVER_API_ID',
    'NAVER_API_SECRET',
    
    # MongoDB
    'MONGO_DB_NAME',
    'MONGO_DB_NAME_RECORDS',
    'MONGO_DB_NAME_USERS',
    'MONGO_DB_NAME_IMAGES',
    'MONGO_DB_NAME_EXTERNAL_API',
    'MONGO_DB_NAME_SETTINGS',
    'MONGO_DB_URL',
    'MONGODB_CONFIG',
    'MONGODB_COLLECTIONS',
    'validate_mongodb_config',
    
    # 관세청 API
    'CUSTOMS_API_CONFIG',
    'validate_customs_api_key',
    
    # 한국수출입은행 API
    'KOREAEXIM_API_CONFIG',
    'validate_koreaexim_api_key',
    
    # 이미지 호스팅
    'imagehost_settings',
    'load_imagehost_config',
    'validate_imagehost_config'
]
