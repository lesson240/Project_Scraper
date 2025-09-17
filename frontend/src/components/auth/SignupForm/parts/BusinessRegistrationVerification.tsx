// path: frontend/src/components/auth/SignupForm/parts/BusinessRegistrationVerification.tsx

import React from 'react';
import TextInput from '@/components/common/TextInput';
import CalendarInputWithButton from '@/components/common/CalendarInputWithButton';
import '@/styles/auth/SignupForm/BusinessRegistrationVerification.css';

interface BusinessRegistrationVerificationProps {
  businessRegistration: string;
  businessName: string;
  businessOpenningDate: string;
  verified: boolean;
  isLoading?: boolean;
  isVerifying: boolean;
  onVerify: (businessRegistration: string) => void;
  onBusinessNameChange: (value: string) => void;
  onBusinessRegistrationChange: (value: string) => void;
  onBusinessOpenningDateChange: (value: string) => void;
  error?: string;
}

export default function BusinessRegistrationVerification({
  businessRegistration,
  businessName,
  businessOpenningDate,
  verified,
  isLoading = false,
  isVerifying,
  onVerify,
  onBusinessNameChange,
  onBusinessRegistrationChange,
  onBusinessOpenningDateChange,
  error
}: BusinessRegistrationVerificationProps) {
  const handleVerify = () => {
    if (!businessName || !businessRegistration || !businessOpenningDate) {
      alert('사업자명/번호/개업일을 모두 입력해주세요.');
      return;
    }
    onVerify(businessRegistration);
  };

  return (
      <div className="business-verification-content">
        <div className="auth-form-group">
          <TextInput
            label="사업자명"
            value={businessName}
            onChange={onBusinessNameChange}
            type="text"
            showTooltip={"*"}
            className={`${error ? 'error' : ''}`}
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
                formatted = `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;
              } else if (digits.length > 3) {
                formatted = `${digits.slice(0,3)}-${digits.slice(3)}`;
              }
              onBusinessRegistrationChange(formatted);
            }}
            type="businessNumber"
            showTooltip={"*"}
            className={`${error ? 'error' : ''}`}
          />
        </div>

        <div className="auth-form-group">
          <CalendarInputWithButton
            label="사업자 개업일"
            value={businessOpenningDate}
            onChange={onBusinessOpenningDateChange}
            buttonLabel={isVerifying ? '인증 중...' : (verified ? '인증 완료' : '사업자등록번호 인증')}
            onButtonClick={handleVerify}
            disabledButton={isLoading || isVerifying || verified}
            required
          />
        </div>

        {error && (
          <div className="verification-error">{error}</div>
        )}
      </div>
  );
}
