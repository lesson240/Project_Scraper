# path: app/tests/test_models.py
"""
Pydantic 모델 유효성 검증 테스트
"""
import pytest
from pydantic import ValidationError
from datetime import datetime, timezone
from app.models.model_exchange_rate import PriceSettingExchangeRate
from app.models import (
    ProductPriceData,
    PriceSettingRequest,
    PriceSettingResponse
)

@pytest.mark.unit
@pytest.mark.fast
class TestPriceSettingExchangeRate:
    """가격 설정 환율 데이터 모델 테스트"""
    
    def test_valid_exchange_rate(self):
        """정상적인 환율 데이터 검증"""
        rate = PriceSettingExchangeRate(currency="USD", value=1350.0)
        assert rate.currency == "USD"
        assert rate.value == 1350.0
        assert rate.source == "price_setting_modal"
        assert rate.isActive is True
    
    def test_invalid_exchange_rate_zero(self):
        """0 이하 환율 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            PriceSettingExchangeRate(currency="USD", value=0)
        
        assert "환율은 0보다 커야 합니다" in str(exc_info.value)
    
    def test_invalid_exchange_rate_negative(self):
        """음수 환율 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            PriceSettingExchangeRate(currency="USD", value=-100)
        
        assert "환율은 0보다 커야 합니다" in str(exc_info.value)
    
    def test_empty_currency(self):
        """빈 통화 코드 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            PriceSettingExchangeRate(currency="", value=1350.0)
        
        assert "통화 코드는 비어있을 수 없습니다" in str(exc_info.value)
    
    def test_whitespace_currency(self):
        """공백만 있는 통화 코드 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            PriceSettingExchangeRate(currency="   ", value=1350.0)
        
        assert "통화 코드는 비어있을 수 없습니다" in str(exc_info.value)
    
    def test_currency_auto_uppercase(self):
        """통화 코드 자동 대문자 변환"""
        rate = PriceSettingExchangeRate(currency="usd", value=1350.0)
        assert rate.currency == "USD"
    
    def test_default_values(self):
        """기본값 테스트"""
        rate = PriceSettingExchangeRate(currency="USD", value=1350.0)
        assert rate.source == "price_setting_modal"
        assert rate.isActive is True
        assert isinstance(rate.created_at, datetime)  # 필드명 변경

@pytest.mark.unit
@pytest.mark.fast
class TestProductPriceData:
    """상품 가격 데이터 모델 테스트"""
    
    def test_valid_product_price(self):
        """정상적인 상품 가격 데이터 검증"""
        product = ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
        assert product.originGoodsCode == "PROD001"
        assert product.settingPrice == 50000
    
    def test_invalid_product_price_zero(self):
        """0 이하 가격 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            ProductPriceData(originGoodsCode="PROD001", settingPrice=0)
        
        assert "greater than 0" in str(exc_info.value)
    
    def test_invalid_product_price_negative(self):
        """음수 가격 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            ProductPriceData(originGoodsCode="PROD001", settingPrice=-5000)
        
        assert "greater than 0" in str(exc_info.value)
    
    def test_empty_product_code(self):
        """빈 상품 코드 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            ProductPriceData(originGoodsCode="", settingPrice=50000)
        
        assert "at least 1 character" in str(exc_info.value)
    
    def test_whitespace_product_code(self):
        """공백만 있는 상품 코드 검증 실패"""
        with pytest.raises(ValidationError) as exc_info:
            ProductPriceData(originGoodsCode="   ", settingPrice=50000)
        
        assert "at least 1 character" in str(exc_info.value)

@pytest.mark.unit
@pytest.mark.fast
class TestPriceSettingRequest:
    """가격 설정 요청 모델 테스트"""
    
    def test_valid_request(self):
        """정상적인 요청 데이터 검증"""
        request = PriceSettingRequest(
            exchangeRates=[
                PriceSettingExchangeRate(currency="USD", value=1350.0)
            ],
            updatedProducts=[
                ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
            ]
        )
        
        assert len(request.exchangeRates) == 1
        assert len(request.updatedProducts) == 1
        assert request.exchangeRates[0].currency == "USD"
        assert request.updatedProducts[0].originGoodsCode == "PROD001"
    
    def test_empty_exchange_rates(self):
        """빈 환율 목록 허용"""
        request = PriceSettingRequest(
            exchangeRates=[],
            updatedProducts=[
                ProductPriceData(originGoodsCode="PROD001", settingPrice=50000)
            ]
        )
        
        assert len(request.exchangeRates) == 0
    
    def test_empty_updated_products(self):
        """빈 상품 목록 허용"""
        request = PriceSettingRequest(
            exchangeRates=[
                PriceSettingExchangeRate(currency="USD", value=1350.0)
            ],
            updatedProducts=[]
        )
        
        assert len(request.updatedProducts) == 0

@pytest.mark.unit
@pytest.mark.fast
class TestPriceSettingResponse:
    """가격 설정 응답 모델 테스트"""
    
    def test_valid_response(self):
        """정상적인 응답 데이터 검증"""
        response = PriceSettingResponse(
            success=True,
            message="처리 완료",
            saved_exchange_rates=[{"currency": "USD", "value": 1350.0}],
            updated_products_count=1,
            timestamp=datetime.now(timezone.utc)  # datetime 객체로 변경
        )
        
        assert response.success is True
        assert response.message == "처리 완료"
        assert len(response.saved_exchange_rates) == 1
        assert response.updated_products_count == 1
        assert isinstance(response.timestamp, datetime)  # datetime 타입 확인
