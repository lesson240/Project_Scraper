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

# MongoDB 설정
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "allttam")

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
        # users 컬렉션 인덱스
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("social_accounts.provider_id")
        await db.database.users.create_index("social_accounts.provider")
        await db.database.users.create_index("status")
        await db.database.users.create_index("created_at")
        await db.database.users.create_index("last_login_at")
        
        # products 컬렉션 인덱스
        await db.database.products.create_index("origin_goods_code")
        await db.database.products.create_index("platform")
        await db.database.products.create_index("created_by")
        await db.database.products.create_index("status")
        await db.database.products.create_index("created_at")
        
        # price_settings 컬렉션 인덱스
        await db.database.price_settings.create_index("origin_goods_code")
        await db.database.price_settings.create_index("user_id")
        await db.database.price_settings.create_index("updated_at")
        
        # exchange_rates 컬렉션 인덱스
        await db.database.exchange_rates.create_index("currency_code")
        await db.database.exchange_rates.create_index("last_updated")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")
        raise

def get_database():
    """데이터베이스 인스턴스 반환"""
    return db.database