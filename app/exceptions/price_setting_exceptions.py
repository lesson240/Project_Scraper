# path: app/exceptions/price_setting_exceptions.py
from typing import Optional, Dict, Any

class PriceSettingError(Exception):
    """가격 설정 관련 기본 예외 클래스"""
    
    def __init__(self, message: str, error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)
    
    def __str__(self):
        return f"[{self.error_code}] {self.message}" if self.error_code else self.message

class ExchangeRateError(PriceSettingError):
    """환율 처리 관련 예외"""
    
    def __init__(self, message: str, currency: Optional[str] = None, rate: Optional[float] = None):
        details = {}
        if currency:
            details["currency"] = currency
        if rate is not None:
            details["rate"] = rate
        
        super().__init__(
            message=message,
            error_code="EXCHANGE_RATE_ERROR",
            details=details
        )

class ProductUpdateError(PriceSettingError):
    """상품 업데이트 관련 예외"""
    
    def __init__(self, message: str, product_code: Optional[str] = None, price: Optional[float] = None):
        details = {}
        if product_code:
            details["product_code"] = product_code
        if price is not None:
            details["price"] = price
        
        super().__init__(
            message=message,
            error_code="PRODUCT_UPDATE_ERROR",
            details=details
        )

class ValidationError(PriceSettingError):
    """데이터 검증 관련 예외"""
    
    def __init__(self, message: str, field: Optional[str] = None, value: Optional[Any] = None):
        details = {}
        if field:
            details["field"] = field
        if value is not None:
            details["value"] = value
        
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=details
        )

class DatabaseError(PriceSettingError):
    """데이터베이스 관련 예외"""
    
    def __init__(self, message: str, operation: Optional[str] = None, collection: Optional[str] = None):
        details = {}
        if operation:
            details["operation"] = operation
        if collection:
            details["collection"] = collection
        
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details=details
        )
