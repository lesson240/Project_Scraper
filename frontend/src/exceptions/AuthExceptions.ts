// path: frontend/src/exceptions/AuthExceptions.ts

/**
 * 인증 관련 예외 클래스들
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, public field?: string, public value?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AuthError {
  constructor(message: string, public originalError?: any) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = '접근 권한이 없습니다.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AuthError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AuthError {
  constructor(message: string = '이미 존재하는 리소스입니다.') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AuthError {
  constructor(message: string = '요청 한도를 초과했습니다.') {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class ServerError extends AuthError {
  constructor(message: string = '서버 오류가 발생했습니다.') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * 에러 처리 유틸리티 함수들
 */

export const isAuthError = (error: any): error is AuthError => {
  return error instanceof AuthError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isUnauthorizedError = (error: any): error is UnauthorizedError => {
  return error instanceof UnauthorizedError;
};

export const isForbiddenError = (error: any): error is ForbiddenError => {
  return error instanceof ForbiddenError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isConflictError = (error: any): error is ConflictError => {
  return error instanceof ConflictError;
};

export const isRateLimitError = (error: any): error is RateLimitError => {
  return error instanceof RateLimitError;
};

export const isServerError = (error: any): error is ServerError => {
  return error instanceof ServerError;
};

/**
 * 에러 메시지 변환 함수
 */
export const getErrorMessage = (error: any): string => {
  if (isAuthError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 에러 로깅 함수
 */
export const logError = (error: any, context?: string): void => {
  const timestamp = new Date().toISOString();
  const errorMessage = getErrorMessage(error);
  const logMessage = `[${timestamp}] ${context ? `[${context}] ` : ''}${errorMessage}`;
  
  console.error(logMessage, error);
  
  // TODO: 실제 로깅 서비스로 전송 (예: Sentry, LogRocket 등)
};

/**
 * 사용자 친화적 에러 메시지 변환
 */
export const getUserFriendlyMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  if (isUnauthorizedError(error)) {
    return '로그인이 필요합니다.';
  }
  
  if (isForbiddenError(error)) {
    return '접근 권한이 없습니다.';
  }
  
  if (isNotFoundError(error)) {
    return '요청한 정보를 찾을 수 없습니다.';
  }
  
  if (isConflictError(error)) {
    return '이미 사용 중인 정보입니다.';
  }
  
  if (isRateLimitError(error)) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (isServerError(error)) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (isValidationError(error)) {
    return error.message;
  }
  
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};
