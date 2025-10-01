// path: frontend/src/components/auth/SignupForm/parts/BusinessRegistrationVerification.tsx

import React from 'react';
import TextInput from '@/components/common/TextInput';
import CalendarInputWithButton from '@/components/common/CalendarInputWithButton';
import '@/styles/auth/SignupForm/BusinessRegistrationVerification.css';

interface BusinessRegistrationVerificationProps {
  businessRegistration: string;
  businessName: string; // 상호
  representativeName: string; // 대표자 성명
  businessOpeningDate: string;
  verified: boolean;
  isLoading?: boolean;
  isVerifying: boolean;
  onVerify: (businessRegistration: string) => void;
  onBusinessNameChange: (value: string) => void;
  onRepresentativeNameChange: (value: string) => void;
  onBusinessRegistrationChange: (value: string) => void;
  onBusinessOpeningDateChange: (value: string) => void;
  error?: string;
}

export default function BusinessRegistrationVerification({
  businessRegistration,
  businessName,
  representativeName,
  businessOpeningDate,
  verified,
  isLoading = false,
  isVerifying,
  onVerify,
  onBusinessNameChange,
  onRepresentativeNameChange,
  onBusinessRegistrationChange,
  onBusinessOpeningDateChange,
  error
}: BusinessRegistrationVerificationProps) {
  const handleVerify = () => {
    if (!businessName || !representativeName || !businessRegistration || !businessOpeningDate) {
      alert('상호/대표자 성명/사업자번호/개업일을 모두 입력해주세요.');
      return;
    }
    onVerify(businessRegistration);
  };

  return (
    <div className="business-verification-content">
      <div className="auth-form-group">
        <TextInput
          label="상호"
          value={businessName}
          onChange={onBusinessNameChange}
          type="text"
          showTooltip={'*'}
          className={`${error ? 'error' : ''}`}
          disabled={verified}
        />
      </div>
      <div className="auth-form-group">
        <TextInput
          label="대표자 성명"
          value={representativeName}
          onChange={onRepresentativeNameChange}
          type="text"
          showTooltip={'*'}
          className={`${error ? 'error' : ''}`}
          disabled={verified}
        />
      </div>

      <div className="auth-form-group">
        <TextInput
          label="사업자등록번호"
          value={businessRegistration}
          onChange={(value) => {
            const digits = value.replace(/[^0-9]/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 5) {
              formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
            } else if (digits.length > 3) {
              formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }
            onBusinessRegistrationChange(formatted);
          }}
          type="businessNumber"
          showTooltip={'*'}
          className={`${error ? 'error' : ''}`}
          disabled={verified}
        />
      </div>

      <div className="auth-form-group">
        <CalendarInputWithButton
          label="사업자 개업일"
          value={businessOpeningDate}
          onChange={onBusinessOpeningDateChange}
          buttonLabel={isVerifying ? '인증 중...' : (verified ? '인증 완료' : '인증하기')}
          onButtonClick={handleVerify}
          disabledButton={isLoading || isVerifying || verified}
          disabled={verified}
          required
        />
      </div>

      {/* 에러 텍스트 제거: 테두리/토스트만 사용 */}
    </div>
  );
}
