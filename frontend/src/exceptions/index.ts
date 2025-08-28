// path: frontend/src/exceptions/index.ts

export * from './PriceSettingExceptions';

/**
 * 예외 처리 유틸리티 함수들
 */

/**
 * 예외를 사용자 친화적인 메시지로 변환
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // 커스텀 예외 클래스들 처리
        if (error.name === 'ValidationError') {
            return `입력 데이터 오류: ${error.message}`;
        }
        if (error.name === 'APIError') {
            return `서버 오류: ${error.message}`;
        }
        if (error.name === 'NetworkError') {
            return `네트워크 오류: ${error.message}`;
        }
        if (error.name === 'TimeoutError') {
            return `시간 초과: ${error.message}`;
        }
        if (error.name === 'UserInputError') {
            return `사용자 입력 오류: ${error.message}`;
        }
        if (error.name === 'CalculationError') {
            return `계산 오류: ${error.message}`;
        }
        if (error.name === 'DataIntegrityError') {
            return `데이터 무결성 오류: ${error.message}`;
        }
        if (error.name === 'BusinessLogicError') {
            return `비즈니스 로직 오류: ${error.message}`;
        }
        if (error.name === 'ResourceError') {
            return `리소스 부족: ${error.message}`;
        }
        
        // 일반 Error 객체
        return error.message;
    }
    
    // 문자열이나 기타 타입
    if (typeof error === 'string') {
        return error;
    }
    
    return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 예외를 로깅용 메시지로 변환
 */
export function getLogErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}\n${error.stack || '스택 트레이스 없음'}`;
    }
    
    return `Unknown error: ${String(error)}`;
}

/**
 * 예외가 재시도 가능한지 확인
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        // 네트워크 오류나 타임아웃은 재시도 가능
        if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
            return true;
        }
        
        // API 오류 중 5xx 서버 오류는 재시도 가능
        if (error.name === 'APIError') {
            const apiError = error as any;
            if (apiError.statusCode && apiError.statusCode >= 500) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * 예외를 적절한 사용자 액션으로 변환
 */
export function getSuggestedAction(error: unknown): string {
    if (error instanceof Error) {
        if (error.name === 'ValidationError') {
            return '입력 데이터를 확인하고 다시 시도해주세요.';
        }
        if (error.name === 'NetworkError') {
            return '네트워크 연결을 확인하고 다시 시도해주세요.';
        }
        if (error.name === 'TimeoutError') {
            return '잠시 후 다시 시도해주세요.';
        }
        if (error.name === 'APIError') {
            return '서버 상태를 확인하고 잠시 후 다시 시도해주세요.';
        }
        if (error.name === 'ResourceError') {
            return '시스템 리소스를 확인하고 다시 시도해주세요.';
        }
    }
    
    return '문제가 지속되면 관리자에게 문의해주세요.';
}

/**
 * 예외를 콘솔에 적절히 로깅
 */
export function logError(error: unknown, context?: string): void {
    const contextPrefix = context ? `[${context}] ` : '';
    const userMessage = getUserFriendlyErrorMessage(error);
    const logMessage = getLogErrorMessage(error);
    
    console.error(`${contextPrefix}${userMessage}`);
    console.error(`${contextPrefix}상세 오류:`, logMessage);
    
    // 개발 환경에서는 스택 트레이스도 출력
    if (import.meta.env.DEV && error instanceof Error && error.stack) {
        console.error(`${contextPrefix}스택 트레이스:`, error.stack);
    }
}
