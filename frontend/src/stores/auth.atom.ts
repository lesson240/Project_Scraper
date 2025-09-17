// path: frontend/src/stores/auth.atom.ts

import { atom } from 'jotai';
import type { User, LoginFormData, SignupFormData } from '@/types/auth';

// 사용자 정보 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  roles: string[];
  permissions: string[];
  socialAccounts?: Array<{
    provider: string;
    providerId: string;
    email: string;
    name: string;
    profileImage?: string;
    connectedAt: Date;
  }>;
}

// 인증 상태 타입 정의
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

// 기본 인증 상태 atom
export const authAtom = atom<AuthState>(initialAuthState);

// 인증 상태 getter atoms
export const isAuthenticatedAtom = atom((get) => get(authAtom).isAuthenticated);
export const userAtom = atom((get) => get(authAtom).user);
export const tokenAtom = atom((get) => get(authAtom).token);
export const isLoadingAtom = atom((get) => get(authAtom).isLoading);
export const errorAtom = atom((get) => get(authAtom).error);

// 로그인 액션 atom
export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginFormData) => {
    set(authAtom, (prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('로그인에 실패했습니다.');
      }

      const data = await response.json();
      
      set(authAtom, {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isLoading: false,
        error: null,
      });

      // 토큰을 localStorage에 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
    } catch (error) {
      set(authAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.',
      }));
    }
  }
);

// 회원가입 액션 atom
export const signupAtom = atom(
  null,
  async (get, set, userData: SignupFormData) => {
    set(authAtom, (prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.');
      }

      const data = await response.json();
      
      set(authAtom, {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isLoading: false,
        error: null,
      });

      // 토큰을 localStorage에 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
    } catch (error) {
      set(authAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.',
      }));
    }
  }
);

// 로그아웃 액션 atom
export const logoutAtom = atom(
  null,
  (get, set) => {
    set(authAtom, initialAuthState);
    
    // localStorage에서 토큰 제거
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
);

// 소셜 로그인 액션 atom
export const socialLoginAtom = atom(
  null,
  async (get, set, provider: string, code: string) => {
    set(authAtom, (prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/auth/social/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`${provider} 로그인에 실패했습니다.`);
      }

      const data = await response.json();
      
      set(authAtom, {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isLoading: false,
        error: null,
      });

      // 토큰을 localStorage에 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
    } catch (error) {
      set(authAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : `${provider} 로그인 중 오류가 발생했습니다.`,
      }));
    }
  }
);

// 토큰 갱신 액션 atom
export const refreshTokenAtom = atom(
  null,
  async (get, set) => {
    const refreshToken = get(authAtom).refreshToken;
    
    if (!refreshToken) {
      set(logoutAtom);
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('토큰 갱신에 실패했습니다.');
      }

      const data = await response.json();
      
      set(authAtom, (prev) => ({
        ...prev,
        token: data.token,
        refreshToken: data.refreshToken,
      }));

      // 새로운 토큰을 localStorage에 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
    } catch (error) {
      set(logoutAtom);
    }
  }
);

// 초기화 액션 atom (앱 시작 시 토큰 확인)
export const initializeAuthAtom = atom(
  null,
  (get, set) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && refreshToken) {
      // TODO: 토큰 유효성 검증 API 호출
      // 임시로 토큰이 있으면 인증된 상태로 설정
      set(authAtom, (prev) => ({
        ...prev,
        isAuthenticated: true,
        token,
        refreshToken,
      }));
    }
  }
);
