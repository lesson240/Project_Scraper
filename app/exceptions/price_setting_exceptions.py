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
    
    def __init__(self, message: str, currency: Optional[str] = None, rate: Optional[float] = None, exchange_rates: Optional[list] = None):
        details = {}
        if currency:
            details["currency"] = currency
        if rate is not None:
            details["rate"] = rate
        if exchange_rates:
            details["exchange_rates"] = exchange_rates
        
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

class ModelValidationError(PriceSettingError):
    """Pydantic 모델 검증 관련 예외"""
    
    def __init__(self, message: str, model_name: Optional[str] = None, field_errors: Optional[Dict[str, Any]] = None):
        details = {}
        if model_name:
            details["model_name"] = model_name
        if field_errors:
            details["field_errors"] = field_errors
        
        super().__init__(
            message=message,
            error_code="MODEL_VALIDATION_ERROR",
            details=details
        )

class DataIntegrityError(PriceSettingError):
    """데이터 무결성 관련 예외"""
    
    def __init__(self, message: str, missing_fields: Optional[list] = None, invalid_data: Optional[Dict[str, Any]] = None):
        details = {}
        if missing_fields:
            details["missing_fields"] = missing_fields
        if invalid_data:
            details["invalid_data"] = invalid_data
        
        super().__init__(
            message=message,
            error_code="DATA_INTEGRITY_ERROR",
            details=details
        )

class DocumentCreationError(PriceSettingError):
    """문서 생성 관련 예외"""
    
    def __init__(self, message: str, document_type: Optional[str] = None, origin_goods_code: Optional[str] = None):
        details = {}
        if document_type:
            details["document_type"] = document_type
        if origin_goods_code:
            details["origin_goods_code"] = origin_goods_code
        
        super().__init__(
            message=message,
            error_code="DOCUMENT_CREATION_ERROR",
            details=details
        )

class ExchangeRateValidationError(PriceSettingError):
    """환율 데이터 검증 관련 예외"""
    
    def __init__(self, message: str, currency_code: Optional[str] = None, rate_value: Optional[float] = None):
        details = {}
        if currency_code:
            details["currency_code"] = currency_code
        if rate_value is not None:
            details["rate_value"] = rate_value
        
        super().__init__(
            message=message,
            error_code="EXCHANGE_RATE_VALIDATION_ERROR",
            details=details
        )
