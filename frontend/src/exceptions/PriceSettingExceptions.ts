// path: frontend/src/exceptions/PriceSettingExceptions.ts

/**
 * 가격 설정 관련 예외 클래스들
 */

// 기본 예외 클래스
export class PriceSettingError extends Error {
    public readonly errorCode: string;
    public readonly details?: any;

    constructor(message: string, errorCode: string, details?: any) {
        super(message);
        this.name = 'PriceSettingError';
        this.errorCode = errorCode;
        this.details = details;
    }
}

// 데이터 검증 예외
export class ValidationError extends PriceSettingError {
    constructor(message: string, field?: string, value?: any) {
        super(message, 'VALIDATION_ERROR', { field, value });
        this.name = 'ValidationError';
    }
}

// API 호출 예외
export class APIError extends PriceSettingError {
    public readonly statusCode?: number;
    public readonly response?: any;

    constructor(message: string, statusCode?: number, response?: any) {
        super(message, 'API_ERROR', { statusCode, response });
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

// 네트워크 예외
export class NetworkError extends PriceSettingError {
    public readonly originalError?: Error;

    constructor(message: string, originalError?: Error) {
        super(message, 'NETWORK_ERROR', { originalError });
        this.name = 'NetworkError';
        this.originalError = originalError;
    }
}

// 타임아웃 예외
export class TimeoutError extends PriceSettingError {
    public readonly timeout: number;

    constructor(message: string, timeout: number) {
        super(message, 'TIMEOUT_ERROR', { timeout });
        this.name = 'TimeoutError';
        this.timeout = timeout;
    }
}

// 사용자 입력 예외
export class UserInputError extends PriceSettingError {
    public readonly field: string;
    public readonly value: any;

    constructor(message: string, field: string, value: any) {
        super(message, 'USER_INPUT_ERROR', { field, value });
        this.name = 'UserInputError';
        this.field = field;
        this.value = value;
    }
}

// 계산 예외
export class CalculationError extends PriceSettingError {
    public readonly calculationType: string;
    public readonly inputs?: any;

    constructor(message: string, calculationType: string, inputs?: any) {
        super(message, 'CALCULATION_ERROR', { calculationType, inputs });
        this.name = 'CalculationError';
        this.calculationType = calculationType;
        this.inputs = inputs;
    }
}
