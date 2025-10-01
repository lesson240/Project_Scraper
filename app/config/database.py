# path: app/config/database.py

import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

# MongoDB 설정 (.env 우선순위: MONGO_URL → MONGODB_URL)
MONGODB_URL = os.getenv("MONGO_URL") or os.getenv("MONGODB_URL", "mongodb://localhost:27017")
# DB 이름(.env 우선순위: DATABASE_NAME → MONGODB_DB_NAME). 기본값을 'accounts'로 통일
DATABASE_NAME = os.getenv("DATABASE_NAME") or os.getenv("MONGODB_DB_NAME", "accounts")

# 데이터베이스 인스턴스
db = Database()

async def connect_to_mongo():
    """MongoDB 연결"""
    try:
        db.client = AsyncIOMotorClient(MONGODB_URL)
        db.database = db.client[DATABASE_NAME]
        
        # 연결 테스트
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {DATABASE_NAME}")
        
        # 인덱스 생성
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """MongoDB 연결 종료"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """필요한 인덱스 생성"""
    try:
        # users 컬렉션 인덱스 (그룹 스키마 기준)
        await db.database.users.create_index(
            [("business_info.business_registration", 1)],
            unique=True,
            name="uniq_business_registration",
        )
        # 일부 클러스터에서 partialFilterExpression의 $ne:null 미지원 → sparse 인덱스로 대체
        await db.database.users.create_index(
            [("basic_info.email", 1)],
            unique=True,
            sparse=True,
            name="uniq_email_sparse",
        )
        await db.database.users.create_index(
            [("social_account.provider", 1), ("social_account.provider_id", 1)],
            unique=True,
            sparse=True,
            name="uniq_social_provider_id",
        )
        await db.database.users.create_index([("status_info.account_status", 1)], name="status_idx")
        await db.database.users.create_index([("status_info.created_at", 1)], name="created_at_idx")
        await db.database.users.create_index([("status_info.last_login_at", 1)], name="last_login_at_idx")
        
        # products 컬렉션 인덱스 (존재하는 경우)
        if "products" in await db.database.list_collection_names():
            await db.database.products.create_index("originGoodsCode")
            await db.database.products.create_index("platform")
            await db.database.products.create_index("createdBy")
            await db.database.products.create_index("status")
            await db.database.products.create_index("createdAt")
        
        # price_settings 컬렉션 인덱스 (존재하는 경우)
        if "price_settings" in await db.database.list_collection_names():
            await db.database.price_settings.create_index([("originGoodsCode", 1), ("userId", 1)])
            await db.database.price_settings.create_index("userId")
            await db.database.price_settings.create_index("updatedAt")
        
        # exchange_rates 컬렉션 인덱스 (존재하는 경우)
        if "exchange_rates" in await db.database.list_collection_names():
            await db.database.exchange_rates.create_index("currency_code")
            await db.database.exchange_rates.create_index("last_updated")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")
        raise

def get_database():
    """데이터베이스 인스턴스 반환"""
    return db.database