// path: frontend/src/exceptions/index.ts

/**
 * 프론트엔드 예외 클래스들 export
 */

export {
    PriceSettingError,
    ValidationError,
    APIError,
    NetworkError,
    TimeoutError,
    UserInputError,
    CalculationError
} from './PriceSettingExceptions';

// 예외 타입 정의
export type PriceSettingExceptionType = 
    | 'VALIDATION_ERROR'
    | 'API_ERROR'
    | 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
    | 'USER_INPUT_ERROR'
    | 'CALCULATION_ERROR';

// 예외 처리 유틸리티 함수들
export const isPriceSettingError = (error: any): error is import('./PriceSettingExceptions').PriceSettingError => {
    return error && typeof error === 'object' && 'errorCode' in error;
};

export const getErrorMessage = (error: any): string => {
    if (isPriceSettingError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

export const getErrorCode = (error: any): string => {
    if (isPriceSettingError(error)) {
        return error.errorCode;
    }
    return 'UNKNOWN_ERROR';
};
