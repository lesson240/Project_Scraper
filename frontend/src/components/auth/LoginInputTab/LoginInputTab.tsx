// path: frontend/src/components/auth/LoginInputTab/LoginInputTab.tsx

import React, { useState } from 'react';
import type { LoginFormData, LoginInputTabProps, LoginValidationErrors } from '@/types/auth';
import PasswordResetModal from '@/components/auth/PasswordResetModal';
import { recaptchaService } from '@/utils/recaptcha';
import '@/styles/auth/LoginInputTab/LoginInputTab.css';

export default function LoginInputTab({
  onSubmit,
  isLoading = false,
  error
}: LoginInputTabProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState<LoginValidationErrors>({});
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  const validateForm = (): boolean => {
    const errors: LoginValidationErrors = {};

    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 입력 시 해당 필드의 에러 메시지 제거
    if (validationErrors[name as keyof LoginValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // reCAPTCHA 토큰 생성
        const captchaToken = await recaptchaService.executeForLogin();
        
        // reCAPTCHA 토큰을 포함하여 제출
        onSubmit({
          ...formData,
          captchaToken
        });
      } catch (error) {
        console.error('reCAPTCHA 실행 실패:', error);
        // reCAPTCHA 실패 시에도 로그인 시도 (개발 환경에서는 허용)
        onSubmit(formData);
      }
    }
  };

  return (
    <div className="login-input-tab">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`auth-input ${validationErrors.email ? 'error' : ''}`}
            placeholder="이메일을 입력하세요"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <div className="auth-error">{validationErrors.email}</div>
          )}
        </div>

        <div className="auth-form-group">
          <label htmlFor="password" className="auth-label">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`auth-input ${validationErrors.password ? 'error' : ''}`}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
          />
          {validationErrors.password && (
            <div className="auth-error">{validationErrors.password}</div>
          )}
        </div>

        <div className="login-options">
          <label className="login-remember">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <span className="login-remember-text">로그인 상태 유지</span>
          </label>
          
          <button
            type="button"
            className="auth-link login-forgot-password"
            disabled={isLoading}
            onClick={() => setIsPasswordResetModalOpen(true)}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {error && (
          <div className="auth-error login-error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="auth-button auth-button-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="auth-loading" />
              로그인 중...
            </>
          ) : (
            '로그인'
          )}
        </button>
      </form>

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
        onSuccess={() => {
          setIsPasswordResetModalOpen(false);
          // 성공 시 추가 처리 (예: 토스트 메시지)
        }}
      />
    </div>
  );
}
