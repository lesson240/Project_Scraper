// path: frontend/src/components/auth/PasswordResetModal/PasswordResetModal.tsx

import React, { useState } from 'react';
import { authApi } from '@/apis/authApi';
import { logError, getUserFriendlyMessage } from '@/exceptions/AuthExceptions';
import '@/styles/auth/PasswordResetModal/PasswordResetModal.css';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PasswordResetModal({
  isOpen,
  onClose,
  onSuccess
}: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await authApi.sendPasswordResetEmail(email);
      setIsEmailSent(true);
      
    } catch (error) {
      logError(error, 'Password Reset');
      setError(getUserFriendlyMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsEmailSent(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="password-reset-modal-overlay">
      <div className="password-reset-modal">
        <div className="password-reset-modal-header">
          <h2 className="password-reset-modal-title">비밀번호 재설정</h2>
          <button
            type="button"
            className="password-reset-modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="password-reset-modal-body">
          {!isEmailSent ? (
            <>
              <p className="password-reset-modal-description">
                가입하신 이메일 주소를 입력하시면<br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>

              <form onSubmit={handleSubmit} className="password-reset-form">
                <div className="password-reset-form-group">
                  <label htmlFor="reset-email" className="password-reset-label">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="password-reset-input"
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="password-reset-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="password-reset-button"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <div className="password-reset-spinner" />
                      전송 중...
                    </>
                  ) : (
                    '재설정 링크 보내기'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="password-reset-success">
              <div className="password-reset-success-icon">✓</div>
              <h3 className="password-reset-success-title">이메일을 확인해주세요</h3>
              <p className="password-reset-success-description">
                <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.<br />
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
              </p>
              <p className="password-reset-success-note">
                이메일이 보이지 않는다면 스팸 폴더를 확인해주세요.
              </p>
              <button
                type="button"
                className="password-reset-button"
                onClick={handleClose}
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
