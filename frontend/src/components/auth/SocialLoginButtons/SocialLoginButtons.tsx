// path: frontend/src/components/auth/SocialLoginButtons/SocialLoginButtons.tsx

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/apis/authApi';
import { logError, getUserFriendlyMessage } from '@/exceptions/AuthExceptions';
import '@/styles/auth/SocialLoginButtons/SocialLoginButtons.css';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const SOCIAL_PROVIDERS = [
  {
    id: 'naver',
    name: '네이버',
    color: '#03C75A',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'google',
    name: '구글',
    color: '#4285F4',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )
  },
  {
    id: 'kakao',
    name: '카카오',
    color: '#FEE500',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.88 1.92 5.4 4.8 6.84L6 22l4.2-2.16c.6.12 1.2.18 1.8.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" fill="currentColor"/>
      </svg>
    )
  }
];

export default function SocialLoginButtons({
  onSuccess,
  onError,
  className = ''
}: SocialLoginButtonsProps) {
  const { socialLogin } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      
      // 1. 소셜 로그인 URL 생성
      const { url, state } = await authApi.getSocialAuthUrl(provider);
      
      // 2. state를 sessionStorage에 저장 (CSRF 방지)
      sessionStorage.setItem(`social_auth_state_${provider}`, state);
      
      // 3. 소셜 로그인 페이지로 리다이렉트
      window.location.href = url;
      
    } catch (error) {
      logError(error, `Social Login - ${provider}`);
      const errorMessage = getUserFriendlyMessage(error);
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSocialCallback = async (provider: string, code: string, state: string) => {
    try {
      // 1. 저장된 state와 비교 (CSRF 방지)
      const savedState = sessionStorage.getItem(`social_auth_state_${provider}`);
      if (savedState !== state) {
        throw new Error('잘못된 요청입니다.');
      }
      
      // 2. 소셜 로그인 콜백 처리
      await socialLogin(provider, code);
      
      // 3. state 제거
      sessionStorage.removeItem(`social_auth_state_${provider}`);
      
      onSuccess?.();
      
    } catch (error) {
      logError(error, `Social Login Callback - ${provider}`);
      const errorMessage = getUserFriendlyMessage(error);
      onError?.(errorMessage);
    }
  };

  // URL에서 인증 코드 확인 (콜백 처리)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider');
    
    if (code && state && provider) {
      handleSocialCallback(provider, code, state);
    }
  }, []);

  return (
    <div className={`social-login-buttons ${className}`}>
      <div className="social-login-divider">
        <span className="divider-text">또는</span>
      </div>
      
      <div className="social-login-grid">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={`social-login-button social-login-button--${provider.id}`}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={loadingProvider === provider.id}
            style={{ '--provider-color': provider.color } as React.CSSProperties}
          >
            {loadingProvider === provider.id ? (
              <div className="social-login-spinner" />
            ) : (
              <span className="social-login-icon">{provider.icon}</span>
            )}
            <span className="social-login-text">
              {loadingProvider === provider.id ? '연결 중...' : `${provider.name} 로그인`}
            </span>
          </button>
        ))}
      </div>
      
      <div className="social-login-notice">
        <p className="notice-text">
          소셜 로그인 시 <a href="/privacy" className="notice-link">개인정보처리방침</a>과{' '}
          <a href="/terms" className="notice-link">이용약관</a>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
