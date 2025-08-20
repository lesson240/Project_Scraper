// path: frontend/src/config/customs.ts
export const customsConfig = {
    baseUrl: 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo',
    serviceKey: import.meta.env.VITE_CUSTOMS_API_KEY || '',
    timeout: 15000,
    retryCount: 3,
    majorCurrencies: ['USD', 'CN', 'EU', 'JP'] as const, // API 응답의 cntySgn과 매칭
    // CORS 우회를 위한 프록시 URL (개발 환경용)
    proxyUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
};

export type MajorCurrency = typeof customsConfig.majorCurrencies[number];

// 환경변수 유효성 검사
if (!import.meta.env.VITE_CUSTOMS_API_KEY) {
  console.warn('⚠️ 관세청 API 키가 설정되지 않았습니다. .env.local 파일에 VITE_CUSTOMS_API_KEY를 설정해주세요.');
}
