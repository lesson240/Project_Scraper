// path: frontend/src/components/auth/SignupForm/SignupFormContainer.tsx

import React, { useState } from 'react';
import { verifyBusiness } from '@/apis/businessApi';
import type { SignupFormData, SignupValidationErrors } from '@/types/auth';
import SignupForm from './SignupForm';
import EmailVerification from './parts/EmailVerification';
import BusinessRegistrationVerification from './parts/BusinessRegistrationVerification';
import Toast from '@/components/common/Toast';
import '@/styles/auth/SignupForm/EmailVerification.css';
import '@/styles/auth/SignupForm/BusinessRegistrationVerification.css';

/**
 * SignupFormContainer - Container Component
 * 
 * 역할:
 * 1. 상태 관리: 폼 데이터, 유효성 검사, 인증 상태 등 모든 상태 관리
 * 2. 비즈니스 로직: API 호출, 데이터 검증, 에러 처리
 * 3. 데이터 흐름: 하위 컴포넌트 간 데이터 전달 및 이벤트 처리
 * 4. 인증 기능: 이메일 인증, 사업자등록번호 인증 로직 구현
 */

interface SignupFormContainerProps {
  onSubmit: (data: SignupFormData) => void;
  isLoading?: boolean;
  error?: string;
}

export default function SignupFormContainer({
  onSubmit,
  isLoading = false,
  error
}: SignupFormContainerProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    representativeName: '',
    businessRegistration: '',
    businessOpenningDate: '',
    phone: '',
    referralCode: '',
    termsAgreement: false,
    privacyAgreement: false,
    marketingAgreement: false
  });

  const [validationErrors, setValidationErrors] = useState<SignupValidationErrors>({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [businessVerified, setBusinessVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 이메일 인증 상태
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');

  // 사업자등록번호 인증 상태
  const [isBusinessVerifying, setIsBusinessVerifying] = useState(false);

  const validateForm = (): boolean => {
    const errors: SignupValidationErrors = {};

    // 이메일 검증
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'error';
    }
    // 이메일 인증 미완료 시 회원가입 제한 (경고 테두리만 표시)
    if (!emailVerified) {
      errors.email = 'error';
    }

    // 비밀번호 검증 (기본 검증만 유지, 상세 검증은 PasswordValidation에서 처리)
    if (!formData.password || formData.password.length < 8 || !(/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password))) {
      errors.password = 'error';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'error';
    }

    // 상호 검증
    if (!formData.businessName || formData.businessName.length < 2) {
      errors.businessName = 'error';
    }

    // 대표자 성명 검증
    if (!formData.representativeName) {
      errors.representativeName = 'error';
    }

    // 휴대폰 번호 검증
    if (!formData.phone || !/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.phone.replace(/-/g, ''))) {
      errors.phone = 'error';
    }

    // 사업자등록번호 검증
    if (!formData.businessRegistration || !/[0-9]{3}-?[0-9]{2}-?[0-9]{5}$/.test(formData.businessRegistration.replace(/-/g, '')) || !businessVerified) {
      errors.businessRegistration = 'error';
    }

    // 약관 동의 검증
    if (!formData.termsAgreement) {
      errors.termsAgreement = 'error';
    }
    if (!formData.privacyAgreement) {
      errors.privacyAgreement = 'error';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 입력 시 해당 필드의 에러 메시지 제거
    if (validationErrors[name as keyof SignupValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleEmailSendCode = async (email: string) => {
    // TODO: 실제 이메일 인증번호 발송 API 호출
    console.log('이메일 인증번호 발송 요청:', email);
    setIsEmailCodeSent(true);
  };

  const handleEmailVerifyCode = async (code: string) => {
    // TODO: 실제 이메일 인증번호 검증 API 호출
    console.log('이메일 인증번호 검증:', code);
    setIsEmailVerifying(true);

    // 임시로 2초 후 성공 처리
    setTimeout(() => {
      setIsEmailVerifying(false);
      setEmailVerified(true);
    }, 2000);
  };

  const handleEmailCodeChange = (code: string) => {
    setEmailVerificationCode(code);
  };

  const handleBusinessVerification = async (businessRegistration: string) => {
    try {
      setIsBusinessVerifying(true);
      const digits = businessRegistration.replace(/[^0-9]/g, '').slice(0, 10);
      const openDate = (formData.businessOpenningDate || '').replace(/[^0-9]/g, '');
      const owner = formData.representativeName.trim();

      const res = await verifyBusiness({
        b_no: digits,
        start_dt: openDate,
        p_nm: owner,
        b_nm: formData.businessName,
      });

      if (res.valid) {
        setBusinessVerified(true);
        setValidationErrors(prev => ({ ...prev, businessRegistration: undefined }));
        setToastMessage('사업자등록번호 인증이 완료되었습니다.');
      } else {
        setBusinessVerified(false);
        setValidationErrors(prev => ({ ...prev, businessRegistration: res.message || '사업자등록번호 인증 실패' }));
        setToastMessage(res.message || '사업자등록번호 인증에 실패했습니다.');
      }
    } catch (e: any) {
      setBusinessVerified(false);
      const msg = e?.response?.data?.detail || '사업자등록번호 인증 요청 중 오류가 발생했습니다.';
      setValidationErrors(prev => ({ ...prev, businessRegistration: msg }));
      setToastMessage(msg);
    } finally {
      setIsBusinessVerifying(false);
    }
  };

  // 약관 동의 관련 핸들러
  const handleTermsChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 입력 시 해당 필드의 에러 메시지 제거
    if (validationErrors[field as keyof SignupValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleViewTerms = () => {
    // TODO: 이용약관 모달 또는 새 창으로 표시
    console.log('이용약관 보기');
    window.open('/terms', '_blank');
  };

  const handleViewPrivacy = () => {
    // TODO: 개인정보처리방침 모달 또는 새 창으로 표시
    console.log('개인정보처리방침 보기');
    window.open('/privacy', '_blank');
  };

  // 비밀번호 관련 핸들러
  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({
      ...prev,
      password
    }));

    // 비밀번호 입력 시 에러 메시지 제거
    if (validationErrors.password) {
      setValidationErrors(prev => ({
        ...prev,
        password: undefined
      }));
    }
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setFormData(prev => ({
      ...prev,
      confirmPassword
    }));

    // 비밀번호 확인 입력 시 에러 메시지 제거
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }
  };

  // ==================== 인증 컴포넌트들 ====================
  // 재사용 가능한 Feature Components를 사용하여 상태와 로직을 통합 관리

  // ==================== 렌더링 ====================
  // UI 컴포넌트에 상태와 핸들러를 전달하여 렌더링
  return (
    <>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
      <SignupForm
        formData={formData}
        validationErrors={validationErrors}
        emailVerified={emailVerified}
        businessVerified={businessVerified}
        isLoading={isLoading}
        error={error}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        // 이메일 인증 관련
        isEmailCodeSent={isEmailCodeSent}
        isEmailVerifying={isEmailVerifying}
        emailVerificationCode={emailVerificationCode}
        onEmailSendCode={handleEmailSendCode}
        onEmailVerifyCode={handleEmailVerifyCode}
        onEmailCodeChange={handleEmailCodeChange}
        // 사업자등록번호 인증 관련
        isBusinessVerifying={isBusinessVerifying}
        onBusinessVerification={handleBusinessVerification}
        // 비밀번호 관련
        onPasswordChange={handlePasswordChange}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        // 약관 동의 관련
        onTermsChange={handleTermsChange}
        onViewTerms={handleViewTerms}
        onViewPrivacy={handleViewPrivacy}
      />
    </>
  );
}
