// path: frontend/src/pages/auth/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import TabNavigation from '@/components/auth/TabNavigation';
import LoginInputTab from '@/components/auth/LoginInputTab/LoginInputTab';
import FindAccountTab from '@/components/auth/FindAccountTab/FindAccountTab';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth/LoginPage/LoginPage.css';

const LOGIN_TABS = [
  {
    id: 'input',
    label: '로그인',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 17L15 12L10 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12H3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    id: 'find',
    label: '계정 찾기',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'input' | 'find'>('input');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading, initializeAuth } = useAuth();

  // 앱 초기화
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'input' | 'find');
    setError(null);
  };

  const handleLoginSuccess = async (credentials: any) => {
    try {
      setError(null);
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleSocialLoginSuccess = () => {
    navigate('/');
  };

  const handleSocialLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <AuthLayout
      title=""
      subtitle="계정에 로그인하여 서비스를 이용하세요"
      showLogo={true}
    >
      <TabNavigation
        tabs={LOGIN_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {error && (
        <div className="auth-error login-error-message">
          {error}
        </div>
      )}

      {activeTab === 'input' ? (
        <>
          <LoginInputTab
            onSubmit={handleLoginSuccess}
            isLoading={isLoading}
            error={error}
          />
          <SocialLoginButtons
            onSuccess={handleSocialLoginSuccess}
            onError={handleSocialLoginError}
          />
        </>
      ) : (
        <FindAccountTab
          onFindId={() => {}}
          onFindPassword={() => {}}
          isLoading={isLoading}
          error={error}
        />
      )}

      <div className="auth-footer">
        <p className="auth-footer-text">
          아직 계정이 없으신가요?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={handleSignupClick}
          >
            회원가입
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
