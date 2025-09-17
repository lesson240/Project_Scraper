// path: frontend/src/config/env.ts

/**
 * 환경 변수 설정
 */

export const ENV = {
  // API 설정
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // 소셜 로그인 설정
  NAVER_CLIENT_ID: import.meta.env.VITE_NAVER_CLIENT_ID || '',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID || '',
  
  // 앱 설정
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Allttam',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // 개발 환경 여부
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// 환경 변수 검증
export const validateEnv = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
  }
};

// 개발 환경에서만 환경 변수 검증 실행
if (ENV.IS_DEVELOPMENT) {
  validateEnv();
}
