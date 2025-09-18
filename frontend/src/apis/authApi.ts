// path: frontend/src/apis/authApi.ts

import axios, { AxiosResponse, AxiosError } from 'axios';
import type {
  LoginFormData,
  SignupFormData,
  LoginResponse,
  SignupResponse,
  FindIdFormData,
  FindPasswordFormData,
  FindAccountResponse
} from '@/types/auth';

// API 클라이언트 설정 (백엔드는 버전 prefix /v1 사용)
const _BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
const authApiBaseURL = `${String(_BASE).replace(/\/$/, '')}/v1`;
const authApiClient = axios.create({
  baseURL: authApiBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 갱신 및 에러 처리
authApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authApiClient.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authApiClient(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// 에러 타입 정의
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

// 에러 처리 유틸리티
const handleApiError = (error: AxiosError): AuthError => {
  if (error.response) {
    // 서버에서 응답을 받았지만 에러 상태 코드
    const { status, data } = error.response;
    const message = (data as any)?.message || `서버 오류 (${status})`;
    return new AuthError(message, status, (data as any)?.code, data);
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못함
    return new NetworkError('네트워크 오류가 발생했습니다.', error);
  } else {
    // 요청 설정 중 오류 발생
    return new NetworkError('요청 설정 중 오류가 발생했습니다.', error);
  }
};

// 인증 API
export const authApi = {
  /**
   * 로그인 API
   * @param credentials - 로그인 정보
   * @returns 로그인 응답
   */
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await authApiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 회원가입 API
   * @param userData - 회원가입 정보
   * @returns 회원가입 응답
   */
  async signup(userData: SignupFormData): Promise<SignupResponse> {
    try {
      const response = await authApiClient.post<SignupResponse>('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 로그아웃 API
   */
  async logout(): Promise<void> {
    try {
      await authApiClient.post('/auth/logout');
    } catch (error) {
      // 로그아웃은 실패해도 클라이언트에서 토큰 제거
      console.warn('로그아웃 API 호출 실패:', error);
    }
  },

  /**
   * 토큰 갱신 API
   * @param refreshToken - 갱신 토큰
   * @returns 새로운 토큰 정보
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response = await authApiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 사용자 프로필 조회 API
   * @returns 사용자 정보
   */
  async getProfile(): Promise<any> {
    try {
      const response = await authApiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 아이디 찾기 API
   * @param data - 찾기 정보
   * @returns 찾기 결과
   */
  async findId(data: FindIdFormData): Promise<FindAccountResponse> {
    try {
      const response = await authApiClient.post<FindAccountResponse>('/auth/find-id', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 비밀번호 찾기 API
   * @param data - 찾기 정보
   * @returns 찾기 결과
   */
  async findPassword(data: FindPasswordFormData): Promise<FindAccountResponse> {
    try {
      const response = await authApiClient.post<FindAccountResponse>('/auth/find-password', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 소셜 로그인 URL 생성 API
   * @param provider - 소셜 플랫폼
   * @returns 인증 URL
   */
  async getSocialAuthUrl(provider: string): Promise<{ url: string; state: string }> {
    try {
      const response = await authApiClient.get<{ url: string; state: string }>(`/auth/social/${provider}/url`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 소셜 로그인 콜백 API
   * @param provider - 소셜 플랫폼
   * @param code - 인증 코드
   * @param state - 상태 값
   * @returns 로그인 응답
   */
  async socialLoginCallback(provider: string, code: string, state: string): Promise<LoginResponse> {
    try {
      const response = await authApiClient.post<LoginResponse>(`/auth/social/${provider}/callback`, { code, state });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 이메일 인증 API
   * @param email - 이메일 주소
   */
  async sendEmailVerification(email: string): Promise<void> {
    try {
      await authApiClient.post('/auth/send-email-verification', { email });
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 이메일 인증 확인 API
   * @param token - 인증 토큰
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await authApiClient.post('/auth/verify-email', { token });
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 이메일 인증번호 발송 API
   * @param email - 이메일 주소
   * @returns 발송 결과
   */
  async sendVerificationCode(email: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await authApiClient.post<{ message: string; success: boolean }>('/auth/send-verification-code', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 이메일 인증번호 검증 API
   * @param email - 이메일 주소
   * @param code - 인증번호
   * @returns 검증 결과
   */
  async verifyCode(email: string, code: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await authApiClient.post<{ message: string; success: boolean }>('/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};
