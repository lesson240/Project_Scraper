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
      </div>

      <div className="terms-agreement-content">
        <div className="terms-list">
          {/* 필수 약관 - 이용약관 */}
          <label className="terms-item required">
            <input
              type="checkbox"
              checked={termsAgreement}
              onChange={handleCheckboxChange('termsAgreement')}
              disabled={isLoading}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-custom" />
            <span className="terms-text">
              <span className="terms-label">[필수]</span>
              <span className="terms-description">이용약관에 동의합니다</span>
              <button
                type="button"
                onClick={onViewTerms}
                className="terms-link"
                disabled={isLoading}
              >
                약관 보기
              </button>
            </span>
          </label>
          {errors?.termsAgreement && (
            <div className="terms-error">{errors.termsAgreement}</div>
          )}

          {/* 필수 약관 - 개인정보처리방침 */}
          <label className="terms-item required">
            <input
              type="checkbox"
              checked={privacyAgreement}
              onChange={handleCheckboxChange('privacyAgreement')}
              disabled={isLoading}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-custom" />
            <span className="terms-text">
              <span className="terms-label">[필수]</span>
              <span className="terms-description">개인정보처리방침에 동의합니다</span>
              <button
                type="button"
                onClick={onViewPrivacy}
                className="terms-link"
                disabled={isLoading}
              >
                약관 보기
              </button>
            </span>
          </label>
          {errors?.privacyAgreement && (
            <div className="terms-error">{errors.privacyAgreement}</div>
          )}

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
            <span className="terms-text">
              <span className="terms-label">[선택]</span>
              <span className="terms-description">마케팅 정보 수신에 동의합니다</span>
            </span>
          </label>
        </div>

        <div className="terms-info">
          <p className="terms-info-text">
            • 필수 약관에 동의하지 않으면 서비스를 이용할 수 없습니다.
          </p>
          <p className="terms-info-text">
            • 선택 약관은 동의하지 않아도 서비스 이용이 가능합니다.
          </p>
          <p className="terms-info-text">
            • 약관 내용은 서비스 정책에 따라 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
