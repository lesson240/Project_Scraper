// path: frontend/src/components/auth/SignupForm/SignupForm.tsx

import React from 'react';
import type { SignupFormData, SignupValidationErrors } from '@/types/auth';
import EmailVerification from './parts/EmailVerification';
import BusinessRegistrationVerification from './parts/BusinessRegistrationVerification';
import TermsAgreement from './parts/TermsAgreement';
import PasswordValidation from './parts/PasswordValidation';
import TextInput from '@/components/common/TextInput';
import NumberInput from '@/components/common/NumberInput';
import Button from '@/components/common/Button';
import '@/styles/auth/SignupForm/SignupForm.css';

/**
 * SignupForm - Presentational Component
 * 
 * 역할:
 * 1. UI 렌더링: 폼 레이아웃과 입력 필드들을 렌더링
 * 2. 이벤트 전달: 사용자 입력을 Container로 전달
 * 3. 인증 컴포넌트 통합: Container에서 전달받은 인증 컴포넌트들을 렌더링
 * 4. 순수 함수형: props를 받아서 UI만 렌더링하는 순수 컴포넌트
 */

interface SignupFormProps {
  formData: SignupFormData;
  validationErrors: SignupValidationErrors;
  emailVerified: boolean;
  businessVerified: boolean;
  isLoading?: boolean;
  error?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  // 이메일 인증 관련
  isEmailCodeSent: boolean;
  isEmailVerifying: boolean;
  emailVerificationCode: string;
  onEmailSendCode: (email: string) => void;
  onEmailVerifyCode: (code: string) => void;
  onEmailCodeChange: (code: string) => void;
  // 사업자등록번호 인증 관련
  isBusinessVerifying: boolean;
  onBusinessVerification: (businessRegistration: string) => void;
  // 비밀번호 관련
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  // 약관 동의 관련
  onTermsChange: (field: string, value: boolean) => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
}

export default function SignupForm({
  formData,
  validationErrors,
  emailVerified,
  businessVerified,
  isLoading = false,
  error,
  onInputChange,
  onSubmit,
  isEmailCodeSent,
  isEmailVerifying,
  emailVerificationCode,
  onEmailSendCode,
  onEmailVerifyCode,
  onEmailCodeChange,
  isBusinessVerifying,
  onBusinessVerification,
  onPasswordChange,
  onConfirmPasswordChange,
  onTermsChange,
  onViewTerms,
  onViewPrivacy
}: SignupFormProps) {

  return (
    <div className="signup-form">
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="signup-form-section">
          <h3 className="signup-section-title">기본 정보</h3>
          
          <div className="auth-form-group">
            <TextInput
              label="아이디"
              value={formData.id}
              onChange={(value) => onInputChange({ target: { name: 'id', value } } as any)}
              type="text"
              showTooltip={"*"}
              className={`${validationErrors.id ? 'error' : ''}`}
            />
            {validationErrors.id && (
              <div className="auth-error">{validationErrors.id}</div>
            )}
          </div>

          <PasswordValidation
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            isValid={!validationErrors.password && !validationErrors.confirmPassword}
            errors={{
              password: validationErrors.password,
              confirmPassword: validationErrors.confirmPassword
            }}
            onPasswordChange={onPasswordChange}
            onConfirmPasswordChange={onConfirmPasswordChange}
            isLoading={isLoading}
          />

          <div className="auth-form-group">
            {validationErrors.email && (
              <div className="auth-error">{validationErrors.email}</div>
            )}
          </div>

          <EmailVerification
            email={formData.email}
            verified={emailVerified}
            isLoading={isLoading}
            isCodeSent={isEmailCodeSent}
            isVerifying={isEmailVerifying}
            verificationCode={emailVerificationCode}
            onSendCode={onEmailSendCode}
            onVerifyCode={onEmailVerifyCode}
            onCodeChange={onEmailCodeChange}
            error={validationErrors.email}
            formData={formData}
            onInputChange={onInputChange}
            validationErrors={validationErrors}
          />

          <BusinessRegistrationVerification
            businessRegistration={formData.businessRegistration}
            businessName={formData.businessName}
            businessOpenningDate={formData.businessOpenningDate}
            verified={emailVerified && businessVerified}
            isLoading={isLoading}
            isVerifying={isBusinessVerifying}
            onVerify={onBusinessVerification}
            onBusinessNameChange={(value) => onInputChange({ target: { name: 'businessName', value } } as any)}
            onBusinessRegistrationChange={(value) => onInputChange({ target: { name: 'businessRegistration', value } } as any)}
            onBusinessOpenningDateChange={(value) => onInputChange({ target: { name: 'businessOpenningDate', value } } as any)}
            error={validationErrors.businessRegistration || validationErrors.businessName || validationErrors.businessOpenningDate}
          />

          {/* 사업자 개업일 입력은 BusinessRegistrationVerification로 이동 */}
        </div>

        <div className="signup-form-section">
          <h3 className="signup-section-title">추가 정보</h3>
          
          <div className="auth-form-group">
            <TextInput
              label="휴대폰 번호"
              value={formData.phone}
              onChange={(value) => onInputChange({ target: { name: 'phone', value } } as any)}
              type="tel"
              showTooltip={"*"}
              className={`${validationErrors.phone ? 'error' : ''}`}
            />
            {validationErrors.phone && (
              <div className="auth-error">{validationErrors.phone}</div>
            )}
          </div>
        </div>

        <TermsAgreement
          termsAgreement={formData.termsAgreement}
          privacyAgreement={formData.privacyAgreement}
          marketingAgreement={formData.marketingAgreement || false}
          isLoading={isLoading}
          errors={{
            termsAgreement: validationErrors.termsAgreement,
            privacyAgreement: validationErrors.privacyAgreement
          }}
          onChange={onTermsChange}
          onViewTerms={onViewTerms}
          onViewPrivacy={onViewPrivacy}
        />


        {error && (
          <div className="auth-error signup-error-message">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </Button>
      </form>
    </div>
  );
}
