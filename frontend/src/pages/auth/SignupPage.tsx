// path: frontend/src/pages/auth/SignupPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import SignupFormContainer from '@/components/auth/SignupForm/SignupFormContainer';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth/SignupPage/SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignupSuccess = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupSubmit = async (data: any) => {
    try {
      setError(null);
      await signup(data);
      handleSignupSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    }
  };

  const handleSocialLoginSuccess = () => {
    navigate('/');
  };

  const handleSocialLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <AuthLayout
      subtitle="새 계정을 만들어 서비스를 시작하세요"
    >
      {error && (
        <div className="auth-error signup-error-message">
          {error}
        </div>
      )}

      <SignupFormContainer
        onSubmit={handleSignupSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="auth-footer">
        <p className="auth-footer-text">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={handleLoginClick}
          >
            로그인
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
