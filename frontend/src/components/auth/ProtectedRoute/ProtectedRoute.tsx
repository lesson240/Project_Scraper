// path: frontend/src/components/auth/ProtectedRoute/ProtectedRoute.tsx

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth/ProtectedRoute/ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showLoading?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
  showLoading = true
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuth();
  const location = useLocation();

  // 앱 초기화 시 토큰 확인
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initializeAuth();
    }
  }, [isAuthenticated, isLoading, initializeAuth]);

  // 로딩 중일 때
  if (isLoading && showLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner" />
        <p className="loading-text">인증 확인 중...</p>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 사용자 정보가 없는 경우
  if (!user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 역할 검증
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return (
        <div className="protected-route-error">
          <div className="error-icon">🚫</div>
          <h2 className="error-title">접근 권한이 없습니다</h2>
          <p className="error-message">
            이 페이지에 접근하려면 다음 역할 중 하나가 필요합니다: {requiredRoles.join(', ')}
          </p>
          <button 
            className="error-button"
            onClick={() => window.history.back()}
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      );
    }
  }

  // 권한 검증
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      user.permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return (
        <div className="protected-route-error">
          <div className="error-icon">🔒</div>
          <h2 className="error-title">권한이 없습니다</h2>
          <p className="error-message">
            이 페이지에 접근하려면 다음 권한이 필요합니다: {requiredPermissions.join(', ')}
          </p>
          <button 
            className="error-button"
            onClick={() => window.history.back()}
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      );
    }
  }

  // 모든 검증 통과 시 자식 컴포넌트 렌더링
  return <>{children}</>;
}
