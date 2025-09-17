// path: frontend/src/components/auth/SignupForm/parts/EmailVerification.tsx

import React, { useState, useEffect } from 'react';
import TextInputWithButton from '@/components/common/TextInputWithButton';
import Toast from '@/components/common/Toast';
import { formatCountdown } from '@/utils/timeUtils';
import { isValidEmail } from '@/utils/validationUtils';
import { authApi } from '@/apis/authApi';
import '@/styles/auth/SignupForm/EmailVerification.css';

interface EmailVerificationProps {
  email: string;
  verified: boolean;
  isLoading?: boolean;
  isCodeSent: boolean;
  isVerifying: boolean;
  verificationCode: string;
  onSendCode: (email: string) => void;
  onVerifyCode: (code: string) => void;
  onCodeChange: (code: string) => void;
  error?: string;
  // 추가된 props
  formData?: any;
  onInputChange?: (e: any) => void;
  validationErrors?: any;
}

export default function EmailVerification({
  email,
  verified,
  isLoading = false,
  isCodeSent,
  isVerifying,
  verificationCode,
  onSendCode,
  onVerifyCode,
  onCodeChange,
  error,
  formData,
  onInputChange,
  validationErrors
}: EmailVerificationProps) {
  const [countdown, setCountdown] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Toast 함수들
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const closeToast = () => {
    setShowToast(false);
    setToastMessage('');
  };

  // 카운트다운 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 인증번호 발송 시 카운트다운 시작
  useEffect(() => {
    if (isCodeSent && !verified) {
      setCountdown(300); // 5분 = 300초
    }
  }, [isCodeSent, verified]);



  // 이메일 유효성 상태
  const emailValidation = {
    isValid: isValidEmail(email),
    message: email.length > 0 
      ? (isValidEmail(email) ? '올바른 이메일 형식입니다.' : '올바른 이메일을 입력해주세요.')
      : ''
  };
  const handleSendCode = async (value: string) => {
    if (!value) {
      showToastMessage('이메일을 먼저 입력해주세요.');
      return;
    }
    
    try {
      const response = await authApi.sendVerificationCode(value);
      if (response.success) {
        onSendCode(value);
        showToastMessage('인증번호가 발송되었습니다.');
      }
    } catch (error: any) {
      showToastMessage(error.message || '인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      showToastMessage('인증번호를 입력해주세요.');
      return;
    }
    
    try {
      const response = await authApi.verifyCode(email, verificationCode);
      if (response.success) {
        onVerifyCode(verificationCode);
        showToastMessage('✅ 이메일 인증이 완료되었습니다.');
      } else {
        showToastMessage('❌ 인증번호가 올바르지 않습니다. 다시 확인해주세요.');
      }
    } catch (error: any) {
      console.error('인증 에러:', error);
      if (error.response?.status === 400) {
        showToastMessage('❌ 인증번호가 올바르지 않습니다. 다시 확인해주세요.');
      } else if (error.response?.status === 404) {
        showToastMessage('❌ 인증번호를 찾을 수 없습니다. 다시 발송해주세요.');
      } else if (error.response?.status === 410) {
        showToastMessage('❌ 인증번호가 만료되었습니다. 다시 발송해주세요.');
      } else {
        showToastMessage('❌ 인증번호 검증에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="email-verification">
      {/* 이메일 입력 단계 */}
      <div className="verification-input-group">
        <TextInputWithButton
          label="이메일"
          value={email}
          onChange={(value) => onInputChange?.({ target: { name: 'email', value } } as any)}
          placeholder="example@email.com"
          buttonLabel={verified ? "인증 완료" : "인증 발송"}
          onButtonClick={handleSendCode}
          disabledButton={isLoading || !email || verified}
          disabled={verified}
          className={`${validationErrors?.email ? 'error' : ''}`}
          type="email"
          showTooltip="*"
        />
        {/* 이메일 유효성 검사 결과 표시 */}
        {emailValidation.message && (
          <div className={`email-validation ${emailValidation.isValid ? 'valid' : 'invalid'}`}>
            <span className="validation-icon">
              {emailValidation.isValid ? '✓' : '✗'}
            </span>
            <span className="validation-text">
              {emailValidation.message}
            </span>
          </div>
        )}
      </div>

      {/* 인증번호 입력 단계 - 이메일 발송 후 추가로 나타남 */}
      {isCodeSent && !verified && (
        <div className="verification-code-group">
          <TextInputWithButton
            label="인증번호"
            value={verificationCode}
            onChange={onCodeChange}
            placeholder="인증번호"
            buttonLabel={isVerifying ? '인증 중...' : '인증 확인'}
            onButtonClick={handleVerifyCode}
            disabledButton={isVerifying || !verificationCode}
            countdown={countdown}
            type="text"
            showTooltip="*"
          />
        </div>
      )}

      {error && (
        <div className="verification-error">
          {error}
        </div>
      )}

      {/* Toast 알림 */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={closeToast} 
        />
      )}
    </div>
  );
}
