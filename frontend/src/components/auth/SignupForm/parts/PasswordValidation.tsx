// path: frontend/src/components/auth/SignupForm/parts/PasswordValidation.tsx

import React from 'react';
import TextInput from '@/components/common/TextInput';
import '@/styles/auth/SignupForm/PasswordValidation.css';

interface PasswordValidationProps {
  password: string;
  confirmPassword: string;
  isValid: boolean;
  errors: {
    password?: string;
    confirmPassword?: string;
  };
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  isLoading?: boolean;
}

/**
 * PasswordValidation - 비밀번호 검증 컴포넌트
 * 
 * 역할:
 * 1. 비밀번호 입력 및 확인
 * 2. 실시간 비밀번호 강도 검증
 * 3. 비밀번호 일치 여부 확인
 * 4. 비밀번호 요구사항 안내
 */

export default function PasswordValidation({
  password,
  confirmPassword,
  isValid,
  errors,
  onPasswordChange,
  onConfirmPasswordChange,
  isLoading = false
}: PasswordValidationProps) {

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // 비밀번호 요구사항 검증
  const getPasswordRequirements = (pwd: string) => {
    const requirements = [];

    if (pwd.length < 8) {
      requirements.push('최소 8자 이상');
    }
    if (!/[a-z]/.test(pwd)) {
      requirements.push('소문자 포함');
    }
    if (!/[A-Z]/.test(pwd)) {
      requirements.push('대문자 포함');
    }
    if (!/\d/.test(pwd)) {
      requirements.push('숫자 포함');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      requirements.push('특수문자 포함');
    }

    return requirements;
  };

  const passwordRequirements = getPasswordRequirements(password);
  
  // 비밀번호 유효성 상태
  const passwordValidation = {
    isValid: password.length >= 8 && passwordRequirements.length === 0,
    message: password.length > 0
      ? (passwordRequirements.length === 0 ? '안전한 비밀번호입니다.' : `필요: ${passwordRequirements.join(', ')}`)
      : ''
  };

  // 비밀번호 확인 유효성 상태
  const confirmPasswordValidation = {
    isValid: passwordsMatch,
    message: confirmPassword.length > 0
      ? (passwordsMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.')
      : ''
  };

  return (
    <div className="password-validation">
      {/* 비밀번호 입력 */}
      <div className="password-input-group">
        <TextInput
          label="비밀번호"
          value={password}
          onChange={onPasswordChange}
          showTooltip="*"
          type="password"
          className={errors.password ? 'error' : ''}
          disabled={isLoading}
        />
        {/* 비밀번호 유효성 검사 결과 표시 */}
        {passwordValidation.message && (
          <div className={`password-validation-message ${passwordValidation.isValid ? 'valid' : 'invalid'}`}>
            <span className="validation-icon">
              {passwordValidation.isValid ? '✓' : '✗'}
            </span>
            <span className="validation-text">
              {passwordValidation.message}
            </span>
          </div>
        )}
      </div>

      {/* 비밀번호 확인 입력 */}
      <div className="password-input-group">
        <TextInput
          label="비밀번호 확인"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          showTooltip="*"
          type="password"
          className={errors.confirmPassword ? 'error' : ''}
          disabled={isLoading}
        />
        {/* 비밀번호 확인 유효성 검사 결과 표시 */}
        {confirmPasswordValidation.message && (
          <div className={`password-validation-message ${confirmPasswordValidation.isValid ? 'valid' : 'invalid'}`}>
            <span className="validation-icon">
              {confirmPasswordValidation.isValid ? '✓' : '✗'}
            </span>
            <span className="validation-text">
              {confirmPasswordValidation.message}
            </span>
          </div>
        )}
      </div>
    </div>

  );
}

