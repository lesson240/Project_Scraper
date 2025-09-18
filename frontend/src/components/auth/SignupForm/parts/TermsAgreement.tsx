// path: frontend/src/components/auth/SignupForm/parts/TermsAgreement.tsx

import React from 'react';
import '@/styles/auth/SignupForm/TermsAgreement.css';

interface TermsAgreementProps {
  termsAgreement: boolean;
  privacyAgreement: boolean;
  marketingAgreement: boolean;
  isLoading?: boolean;
  errors?: {
    termsAgreement?: string;
    privacyAgreement?: string;
  };
  onChange: (field: string, value: boolean) => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
}

export default function TermsAgreement({
  termsAgreement,
  privacyAgreement,
  marketingAgreement,
  isLoading = false,
  errors,
  onChange,
  onViewTerms,
  onViewPrivacy
}: TermsAgreementProps) {
  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.checked);
  };

  return (
    <div className="terms-agreement">
      <div className="terms-agreement-header">
        <h4 className="terms-agreement-title">약관 동의</h4>
        <label className="terms-item optional" style={{ marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            checked={termsAgreement && privacyAgreement && marketingAgreement}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange('termsAgreement', checked);
              onChange('privacyAgreement', checked);
              onChange('marketingAgreement', checked);
            }}
            className="terms-checkbox"
          />
          <span className="terms-checkbox-custom" />
          <span className="terms-description">전체 약관에 동의합니다</span>
        </label>
      </div>

      <div className="terms-agreement-content">
        <div className="terms-list">
          {/* 필수 약관 - 이용약관 */}
          <label className={`terms-item required ${errors?.termsAgreement ? 'has-error' : ''}`}>
            <input
              type="checkbox"
              checked={termsAgreement}
              onChange={handleCheckboxChange('termsAgreement')}
              disabled={isLoading}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-custom" />
            <span className="terms-description">[필수] 이용약관에 동의합니다</span>
            <button
              type="button"
              onClick={onViewTerms}
              className="terms-link"
              disabled={isLoading}
            >
              약관 보기
            </button>
          </label>
          {/* 에러 문구 출력 제거 (시각적 테두리만 유지) */}

          {/* 필수 약관 - 개인정보처리방침 */}
          <label className={`terms-item required ${errors?.privacyAgreement ? 'has-error' : ''}`}>
            <input
              type="checkbox"
              checked={privacyAgreement}
              onChange={handleCheckboxChange('privacyAgreement')}
              disabled={isLoading}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-custom" />
            <span className="terms-description">[필수] 개인정보처리방침에 동의합니다</span>
            <button
              type="button"
              onClick={onViewPrivacy}
              className="terms-link"
              disabled={isLoading}
            >
              약관 보기
            </button>
          </label>
          {/* 에러 문구 출력 제거 (시각적 테두리만 유지) */}

          {/* 선택 약관 - 마케팅 정보 수신 */}
          <label className="terms-item optional">
            <input
              type="checkbox"
              checked={marketingAgreement}
              onChange={handleCheckboxChange('marketingAgreement')}
              disabled={isLoading}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-custom" />
            <span className="terms-description">[선택] 마케팅 정보 수신에 동의합니다</span>
          </label>
        </div>
      </div>
    </div>
  );
}
