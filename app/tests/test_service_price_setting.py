# path: app/tests/test_service_price_setting.py
"""
가격 설정 서비스 테스트
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from app.services.service_price_setting import PriceSettingService
from app.models.model_price_setting import (
    ExchangeRateData,
    ProductPriceData,
    PriceSettingRequest
)
from app.exceptions.price_setting_exceptions import (
    ValidationError,
    ExchangeRateError,
    ProductUpdateError
)

@pytest.mark.unit
class TestPriceSettingService:
    """가격 설정 서비스 테스트"""
    
    @pytest.fixture
    def service(self, mock_mongodb_client):
        """서비스 인스턴스 생성"""
        return PriceSettingService(mock_mongodb_client)
    
    @pytest.fixture
    def mock_exchange_rate_collection(self, mock_mongodb_client):
        """환율 컬렉션 모킹"""
        return mock_mongodb_client["settings"]["exchange_rate"]
    
    @pytest.fixture
    def mock_modified_goods_collection(self, mock_mongodb_client):
        """상품 컬렉션 모킹"""
        return mock_mongodb_client["scrapmarket"]["ModifiedGoodsDetail"]
    
    @pytest.mark.fast
    class TestSaveExchangeRates:
        """환율 저장 테스트"""
        
        async def test_save_exchange_rates_success(self, service, mock_exchange_rate_collection):
            """환율 저장 성공 테스트"""
            # Given
            exchange_rates = [
                ExchangeRateData(currencyCode="USD", appliedRate=1350.0),
                ExchangeRateData(currencyCode="EUR", appliedRate=1500.0)
            ]
            
            # Mock 설정
            mock_exchange_rate_collection.update_many.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value.inserted_id = "rate_id_1"
            
            # When
            result = await service.save_exchange_rates(exchange_rates)
            
            # Then
            assert len(result) == 2
            assert result[0]["currency"] == "USD"
            assert result[0]["value"] == 1350.0
            assert result[1]["currency"] == "EUR"
            assert result[1]["value"] == 1500.0
            
            # update_many 호출 확인 (기존 데이터 비활성화)
            assert mock_exchange_rate_collection.update_many.call_count == 2
            # insert_one 호출 확인 (새 데이터 저장)
            assert mock_exchange_rate_collection.insert_one.call_count == 2
        
        async def test_save_exchange_rates_validation_error(self, service):
            """환율 데이터 검증 실패 테스트"""
            # Given - 잘못된 데이터
            invalid_exchange_rates = [
                ExchangeRateData(currencyCode="USD", appliedRate=0)  # 0 이하
            ]
            
            # When & Then
            with pytest.raises(ValidationError) as exc_info:
                await service.save_exchange_rates(invalid_exchange_rates)
            
            assert "잘못된 환율 데이터" in str(exc_info.value)
        
        async def test_save_exchange_rates_database_error(self, service, mock_exchange_rate_collection):
            """데이터베이스 오류 테스트"""
            # Given
            exchange_rates = [
                ExchangeRateData(currencyCode="USD", appliedRate=1350.0)
            ]
            
            # Mock 설정 - 데이터베이스 오류 시뮬레이션
            mock_exchange_rate_collection.update_many.side_effect = Exception("DB Connection Error")
            
            # When & Then
            with pytest.raises(ExchangeRateError) as exc_info:
                await service.save_exchange_rates(exchange_rates)
            
            assert "환율 저장 중 오류 발생" in str(exc_info.value)
            assert exc_info.value.details["currency"] == "USD"
    
    @pytest.mark.fast
    class TestUpdateProductPrices:
        """상품 가격 업데이트 테스트"""
        
        async def test_update_product_prices_success(self, service, mock_modified_goods_collection):
            """상품 가격 업데이트 성공 테스트"""
            # Given
            updated_products = [
                ProductPriceData(originGoodsCode="PROD001", settingPrice=50000),
                ProductPriceData(originGoodsCode="PROD002", settingPrice=75000)
            ]
            
            # Mock 설정
            mock_modified_goods_collection.update_one.return_value = AsyncMock()
            mock_modified_goods_collection.update_one.return_value.modified_count = 1
            
            # When
            result = await service.update_product_prices(updated_products)
            
            # Then
            assert result == 2  # 2개 상품 업데이트 성공
            
            # update_one 호출 확인
            assert mock_modified_goods_collection.update_one.call_count == 2
        
        async def test_update_product_prices_validation_error(self, service):
            """상품 데이터 검증 실패 테스트"""
            # Given - 잘못된 데이터
            invalid_products = [
                ProductPriceData(originGoodsCode="PROD001", settingPrice=0)  # 0 이하
            ]
            
            # When & Then
            with pytest.raises(ValidationError) as exc_info:
                await service.update_product_prices(invalid_products)
            
            assert "잘못된 상품 데이터" in str(exc_info.value)
        
        async def test_update_product_prices_database_error(self, service, mock_modified_goods_collection):
            """데이터베이스 오류 테스트"""
            # Given
            updated_products = [
                ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
            ]
            
            # Mock 설정 - 데이터베이스 오류 시뮬레이션
            mock_modified_goods_collection.update_one.side_effect = Exception("DB Connection Error")
            
            # When & Then
            with pytest.raises(ProductUpdateError) as exc_info:
                await service.update_product_prices(updated_products)
            
            assert "상품 가격 업데이트 중 오류 발생" in str(exc_info.value)
            assert exc_info.value.details["product_code"] == "PROD001"
    
    @pytest.mark.integration
    class TestSavePriceSettingData:
        """가격 설정 데이터 저장 통합 테스트"""
        
        async def test_save_price_setting_data_success(self, service, mock_exchange_rate_collection, mock_modified_goods_collection):
            """가격 설정 데이터 저장 성공 테스트"""
            # Given
            request_data = PriceSettingRequest(
                exchangeRates=[
                    ExchangeRateData(currencyCode="USD", appliedRate=1350.0)
                ],
                updatedProducts=[
                    ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
                ]
            )
            
            # Mock 설정
            mock_exchange_rate_collection.update_many.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value.inserted_id = "rate_id_1"
            
            mock_modified_goods_collection.update_one.return_value = AsyncMock()
            mock_modified_goods_collection.update_one.return_value.modified_count = 1
            
            # When
            result = await service.save_price_setting_data(request_data)
            
            # Then
            assert result.success is True
            assert result.message == "가격 설정 데이터 저장 완료"
            assert len(result.saved_exchange_rates) == 1
            assert result.updated_products_count == 1
            assert "timestamp" in result.timestamp
        
        async def test_save_price_setting_data_exchange_rate_error(self, service, mock_exchange_rate_collection):
            """환율 저장 오류 시 테스트"""
            # Given
            request_data = PriceSettingRequest(
                exchangeRates=[
                    ExchangeRateData(currencyCode="USD", appliedRate=1350.0)
                ],
                updatedProducts=[]
            )
            
            # Mock 설정 - 환율 저장 오류
            mock_exchange_rate_collection.update_many.side_effect = Exception("DB Error")
            
            # When & Then
            with pytest.raises(ExchangeRateError):
                await service.save_price_setting_data(request_data)
        
        async def test_save_price_setting_data_product_error(self, service, mock_exchange_rate_collection, mock_modified_goods_collection):
            """상품 업데이트 오류 시 테스트"""
            # Given
            request_data = PriceSettingRequest(
                exchangeRates=[
                    ExchangeRateData(currencyCode="USD", appliedRate=1350.0)
                ],
                updatedProducts=[
                    ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
                ]
            )
            
            # Mock 설정 - 환율 저장 성공, 상품 업데이트 오류
            mock_exchange_rate_collection.update_many.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value = AsyncMock()
            mock_exchange_rate_collection.insert_one.return_value.inserted_id = "rate_id_1"
            
            mock_modified_goods_collection.update_one.side_effect = Exception("DB Error")
            
            # When & Then
            with pytest.raises(ProductUpdateError):
                await service.save_price_setting_data(request_data)
