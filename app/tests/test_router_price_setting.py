# path: app/tests/test_router_price_setting.py
"""
가격 설정 라우터 테스트
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.models import (
    ExchangeRateData,
    ProductPriceData,
    PriceSettingRequest
)
from app.exceptions.price_setting_exceptions import (
    ValidationError,
    ExchangeRateError,
    ProductUpdateError
)

@pytest.mark.integration
class TestPriceSettingRouter:
    """가격 설정 라우터 테스트"""
    
    @pytest.fixture
    def client(self):
        """테스트 클라이언트 생성"""
        return TestClient(app)
    
    @pytest.fixture
    def valid_request_data(self):
        """유효한 요청 데이터"""
        return {
            "exchangeRates": [
                {"currencyCode": "USD", "appliedRate": 1350.0},
                {"currencyCode": "EUR", "appliedRate": 1500.0}
            ],
            "updatedProducts": [
                {"originGoodsCode": "PROD001", "settingPrice": 50000},
                {"originGoodsCode": "PROD002", "settingPrice": 75000}
            ]
        }
    
    @pytest.mark.fast
    class TestHealthCheck:
        """헬스 체크 엔드포인트 테스트"""
        
        def test_health_check_success(self, client):
            """헬스 체크 성공 테스트"""
            # When
            response = client.get("/api/price-setting/health")
            
            # Then
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["service"] == "price_setting"
            assert "timestamp" in data
    
    class TestSavePriceSettingData:
        """가격 설정 데이터 저장 엔드포인트 테스트"""
        
        @pytest.mark.fast
        @patch('app.routers.func_price_setting.get_price_setting_service')
        async def test_save_price_setting_data_success(self, mock_get_service, client, valid_request_data):
            """가격 설정 데이터 저장 성공 테스트"""
            # Given
            mock_service = AsyncMock()
            mock_service.save_price_setting_data.return_value = {
                "success": True,
                "message": "가격 설정 데이터 저장 완료",
                "saved_exchange_rates": [
                    {"currency": "USD", "value": 1350.0, "id": "rate_id_1"}
                ],
                "updated_products_count": 2,
                "timestamp": "2024-01-01T00:00:00"
            }
            mock_get_service.return_value = mock_service
            
            # When
            response = client.post("/api/price-setting/save", json=valid_request_data)
            
            # Then
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["message"] == "가격 설정 데이터 저장 완료"
            assert len(data["saved_exchange_rates"]) == 1
            assert data["updated_products_count"] == 2
            
            # 서비스 메서드 호출 확인
            mock_service.save_price_setting_data.assert_called_once()
        
        @patch('app.routers.func_price_setting.get_price_setting_service')
        async def test_save_price_setting_data_validation_error(self, mock_get_service, client):
            """데이터 검증 오류 테스트"""
            # Given - 잘못된 데이터
            invalid_request_data = {
                "exchangeRates": [
                    {"currencyCode": "USD", "appliedRate": 0}  # 0 이하
                ],
                "updatedProducts": []
            }
            
            mock_service = AsyncMock()
            mock_service.save_price_setting_data.side_effect = ValidationError(
                message="잘못된 환율 데이터",
                field="exchange_rate",
                value={"currency": "USD", "rate": 0}
            )
            mock_get_service.return_value = mock_service
            
            # When
            response = client.post("/api/price-setting/save", json=invalid_request_data)
            
            # Then
            assert response.status_code == 400
            data = response.json()
            assert data["error"] == "VALIDATION_ERROR"
            assert "잘못된 환율 데이터" in data["message"]
            assert "details" in data
        
        @patch('app.routers.func_price_setting.get_price_setting_service')
        async def test_save_price_setting_data_exchange_rate_error(self, mock_get_service, client, valid_request_data):
            """환율 처리 오류 테스트"""
            # Given
            mock_service = AsyncMock()
            mock_service.save_price_setting_data.side_effect = ExchangeRateError(
                message="환율 처리 오류",
                currency="USD",
                rate=1350.0
            )
            mock_get_service.return_value = mock_service
            
            # When
            response = client.post("/api/price-setting/save", json=valid_request_data)
            
            # Then
            assert response.status_code == 500
            data = response.json()
            assert data["error"] == "EXCHANGE_RATE_ERROR"
            assert "환율 처리 오류" in data["message"]
            assert "details" in data
        
        @patch('app.routers.func_price_setting.get_price_setting_service')
        async def test_save_price_setting_data_product_error(self, mock_get_service, client, valid_request_data):
            """상품 업데이트 오류 테스트"""
            # Given
            mock_service = AsyncMock()
            mock_service.save_price_setting_data.side_effect = ProductUpdateError(
                message="상품 업데이트 오류",
                product_code="PROD001",
                price=50000
            )
            mock_get_service.return_value = mock_service
            
            # When
            response = client.post("/api/price-setting/save", json=valid_request_data)
            
            # Then
            assert response.status_code == 500
            data = response.json()
            assert data["error"] == "PRODUCT_UPDATE_ERROR"
            assert "상품 업데이트 오류" in data["message"]
            assert "details" in data
        
        @patch('app.routers.func_price_setting.get_price_setting_service')
        async def test_save_price_setting_data_unknown_error(self, mock_get_service, client, valid_request_data):
            """예상치 못한 오류 테스트"""
            # Given
            mock_service = AsyncMock()
            mock_service.save_price_setting_data.side_effect = Exception("Unknown Error")
            mock_get_service.return_value = mock_service
            
            # When
            response = client.post("/api/price-setting/save", json=valid_request_data)
            
            # Then
            assert response.status_code == 500
            data = response.json()
            assert data["error"] == "UNKNOWN_ERROR"
            assert "예상치 못한 오류가 발생했습니다" in data["message"]
        
        @pytest.mark.fast
        def test_save_price_setting_data_invalid_json(self, client):
            """잘못된 JSON 형식 테스트"""
            # Given - 잘못된 JSON
            invalid_json = "invalid json string"
            
            # When
            response = client.post("/api/price-setting/save", data=invalid_json, headers={"Content-Type": "application/json"})
            
            # Then
            assert response.status_code == 422  # Validation Error
        
        @pytest.mark.fast
        def test_save_price_setting_data_missing_fields(self, client):
            """필수 필드 누락 테스트"""
            # Given - 필수 필드 누락
            incomplete_data = {
                "exchangeRates": []  # updatedProducts 누락
            }
            
            # When
            response = client.post("/api/price-setting/save", json=incomplete_data)
            
            # Then
            assert response.status_code == 422  # Validation Error
        
        @pytest.mark.fast
        def test_save_price_setting_data_empty_request(self, client):
            """빈 요청 데이터 테스트"""
            # Given - 빈 데이터
            empty_data = {}
            
            # When
            response = client.post("/api/price-setting/save", json=empty_data)
            
            # Then
            assert response.status_code == 422  # Validation Error
