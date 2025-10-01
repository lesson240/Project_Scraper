// path: frontend/src/components/auth/FindAccountTab/FindAccountTab.tsx

import React, { useState } from 'react';
import type { FindAccountTabProps, FindIdFormData, FindPasswordFormData } from '@/types/auth';
import '@/styles/auth/FindAccountTab/FindAccountTab.css';

const FIND_TABS = [
  {
    id: 'findId',
    label: '이메일 찾기',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  },
  {
    id: 'findPassword',
    label: '비밀번호 찾기',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  }
];

export default function FindAccountTab({
  onFindId,
  onFindPassword,
  isLoading = false,
  error
}: FindAccountTabProps) {
  const [activeTab, setActiveTab] = useState<'findId' | 'findPassword'>('findId');
  const [findIdData, setFindIdData] = useState<FindIdFormData>({
    name: '',
    phone: '',
    birthDate: ''
  });
  const [findPasswordData, setFindPasswordData] = useState<FindPasswordFormData>({
    email: '',
    name: '',
    phone: ''
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'findId' | 'findPassword');
  };

  const handleFindIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFindIdData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFindPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFindPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFindIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindId(findIdData);
  };

  const handleFindPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindPassword(findPasswordData);
  };

  return (
    <div className="find-account-tab">
      <div className="find-account-tabs">
        {FIND_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`find-account-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            type="button"
            disabled={isLoading}
          >
            <span className="find-account-tab-icon">{tab.icon}</span>
            <span className="find-account-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="auth-error find-account-error">
          {error}
        </div>
      )}

      {activeTab === 'findId' ? (
        <form className="auth-form" onSubmit={handleFindIdSubmit}>
          <div className="auth-form-group">
            <label htmlFor="findIdName" className="auth-label">
              이름
            </label>
            <input
              type="text"
              id="findIdName"
              name="name"
              value={findIdData.name}
              onChange={handleFindIdInputChange}
              className="auth-input"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="findIdPhone" className="auth-label">
              휴대폰 번호
            </label>
            <input
              type="tel"
              id="findIdPhone"
              name="phone"
              value={findIdData.phone}
              onChange={handleFindIdInputChange}
              className="auth-input"
              placeholder="휴대폰 번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="findIdBirthDate" className="auth-label">
              생년월일
            </label>
            <input
              type="date"
              id="findIdBirthDate"
              name="birthDate"
              value={findIdData.birthDate}
              onChange={handleFindIdInputChange}
              className="auth-input"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="auth-loading" />
                찾는 중...
              </>
            ) : (
              '아이디 찾기'
            )}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleFindPasswordSubmit}>
          <div className="auth-form-group">
            <label htmlFor="findPasswordEmail" className="auth-label">
              이메일
            </label>
            <input
              type="email"
              id="findPasswordEmail"
              name="email"
              value={findPasswordData.email}
              onChange={handleFindPasswordInputChange}
              className="auth-input"
              placeholder="이메일을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="findPasswordName" className="auth-label">
              이름
            </label>
            <input
              type="text"
              id="findPasswordName"
              name="name"
              value={findPasswordData.name}
              onChange={handleFindPasswordInputChange}
              className="auth-input"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="findPasswordPhone" className="auth-label">
              휴대폰 번호
            </label>
            <input
              type="tel"
              id="findPasswordPhone"
              name="phone"
              value={findPasswordData.phone}
              onChange={handleFindPasswordInputChange}
              className="auth-input"
              placeholder="휴대폰 번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="auth-loading" />
                찾는 중...
              </>
            ) : (
              '비밀번호 찾기'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
