// path: frontend/src/components/common/Setting/SettingStatusBadge.tsx
import React from 'react';
import type { SettingStatus } from '@/hooks/useSettingStatus';
import '@/styles/common/SettingStatusBadge.css';

interface SettingStatusBadgeProps {
  status: SettingStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SettingStatusBadge({ 
  status, 
  className = '', 
  size = 'md' 
}: SettingStatusBadgeProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'setting-status-badge--sm';
      case 'lg': return 'setting-status-badge--lg';
      default: return 'setting-status-badge--md';
    }
  };

  const getStatusClass = () => {
    return status === '설정 완료' ? 'setting-status-badge--completed' : 'setting-status-badge--not-set';
  };

  return (
    <span
      className={`setting-status-badge ${getSizeClass()} ${getStatusClass()} ${className}`}
    >
      {status === '설정 완료' && (
        <svg 
          className="setting-status-badge__icon" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
      {status}
    </span>
  );
}
