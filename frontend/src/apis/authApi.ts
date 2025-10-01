// path: frontend/src/apis/authApi.ts

import axios, { AxiosResponse, AxiosError } from 'axios';
import type {
  LoginFormData,
  LoginResponse,
  SignupResponse,
  FindIdFormData,
  FindPasswordFormData,
  FindAccountResponse,
} from '@/types/auth';
import type { SignupPayload } from '@/types/auth/signup.types';

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
      (config.headers as any).Authorization = `Bearer ${token}`;
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
    const originalRequest: any = error.config || {};

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authApiClient.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data as any;

          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // 원래 요청 재시도
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
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
    const { status, data } = error.response;
    const message = (data as any)?.detail || (data as any)?.message || `서버 오류 (${status})`;
    return new AuthError(message, status, (data as any)?.code, data);
  } else if (error.request) {
    return new NetworkError('네트워크 오류가 발생했습니다.', error);
  } else {
    return new NetworkError('요청 설정 중 오류가 발생했습니다.', error);
  }
};

// 인증 API
export const authApi = {
  /**
   * 로그인 API
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
   * 회원가입 API (그룹 스키마 Payload 직접 전송)
   */
  async signup(payload: SignupPayload): Promise<SignupResponse> {
    try {
      const response = await authApiClient.post<SignupResponse>('/auth/signup', payload);
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
      console.warn('로그아웃 API 호출 실패:', error);
    }
  },

  /**
   * 토큰 갱신 API
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | any> {
    try {
      const response = await authApiClient.post('/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * 사용자 프로필 조회 API
   */
  async getProfile(): Promise<any> {
    try {
      const response = await authApiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 아이디 찾기 API */
  async findId(data: FindIdFormData): Promise<FindAccountResponse> {
    try {
      const response = await authApiClient.post<FindAccountResponse>('/auth/find-id', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 비밀번호 찾기 API */
  async findPassword(data: FindPasswordFormData): Promise<FindAccountResponse> {
    try {
      const response = await authApiClient.post<FindAccountResponse>('/auth/find-password', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 소셜 로그인 URL 생성 API */
  async getSocialAuthUrl(provider: string): Promise<{ url: string; state: string }> {
    try {
      const response = await authApiClient.get<{ url: string; state: string }>(`/auth/social/${provider}/url`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 소셜 로그인 콜백 API */
  async socialLoginCallback(provider: string, code: string, state: string): Promise<LoginResponse> {
    try {
      const response = await authApiClient.post<LoginResponse>(`/auth/social/${provider}/callback`, { code, state });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 이메일 인증번호 발송 API */
  async sendVerificationCode(email: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await authApiClient.post<{ message: string; success: boolean }>('/auth/send-verification-code', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /** 이메일 인증번호 검증 API */
  async verifyCode(email: string, code: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await authApiClient.post<{ message: string; success: boolean }>('/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};
