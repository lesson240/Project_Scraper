// path: frontend/src/components/auth/AuthLayout/AuthLayout.tsx

import React from 'react';
import '@/styles/auth/auth-common.css';
import '@/styles/auth/AuthLayout/AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export default function AuthLayout({
  children,
  subtitle,
  className = ''
}: AuthLayoutProps) {
  return (
    <div className={`auth-container ${className}`}>
      <div className="auth-card">
        <div className="auth-header">
            <img src="/src/assets/images/logo/allttam.svg" alt="logo" />
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
