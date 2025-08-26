# path: app/tests/conftest.py
"""
pytest 설정 및 공통 fixture 정의
"""
import pytest
import asyncio
from typing import AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorClient
from unittest.mock import AsyncMock, MagicMock

# 테스트용 MongoDB 연결 설정
@pytest.fixture
def mock_mongodb_client():
    """MongoDB 클라이언트 모킹"""
    mock_client = AsyncMock(spec=AsyncIOMotorClient)
    
    # 데이터베이스 모킹
    mock_settings_db = AsyncMock()
    mock_scrapmarket_db = AsyncMock()
    
    # 컬렉션 모킹
    mock_exchange_rate_collection = AsyncMock()
    mock_modified_goods_collection = AsyncMock()
    
    # 데이터베이스 반환 설정
    mock_client.__getitem__.side_effect = lambda db_name: {
        "settings": mock_settings_db,
        "scrapmarket": mock_scrapmarket_db
    }.get(db_name, AsyncMock())
    
    # 컬렉션 반환 설정
    mock_settings_db.__getitem__.return_value = mock_exchange_rate_collection
    mock_scrapmarket_db.__getitem__.return_value = mock_modified_goods_collection
    
    return mock_client

@pytest.fixture
def sample_exchange_rates():
    """테스트용 환율 데이터"""
    return [
        {"currencyCode": "USD", "appliedRate": 1350.0},
        {"currencyCode": "EUR", "appliedRate": 1500.0}
    ]

@pytest.fixture
def sample_products():
    """테스트용 상품 데이터"""
    return [
        {"originGoodsCode": "PROD001", "settingPrice": 50000},
        {"originGoodsCode": "PROD002", "settingPrice": 75000}
    ]

@pytest.fixture
def sample_price_setting_request(sample_exchange_rates, sample_products):
    """테스트용 가격 설정 요청 데이터"""
    return {
        "exchangeRates": sample_exchange_rates,
        "updatedProducts": sample_products
    }

# 비동기 테스트 지원
@pytest.fixture(scope="session")
def event_loop():
    """비동기 테스트를 위한 이벤트 루프"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
