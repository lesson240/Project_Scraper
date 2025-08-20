# 관세청 환율정보 API 문서

## 📋 개요
- **API명**: 관세청 환율정보 조회
- **엔드포인트**: `https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo`
- **용도**: 실시간 환율 정보 조회
- **데이터 형식**: XML

## 🔑 API 키 설정

### 환경변수 설정
```bash
# .env.local 파일에 추가 (Vite 환경)
VITE_CUSTOMS_API_KEY=IWh1Ah9Uc%2BFwp4tl1Tm1VjaBQA%2BIFD%2F8iYSv6eOD0kPK39%2BgGQMBa2MOPVSHhOyZfa%2F8WVEGnvA43EwtBzUtDA%3D%3D
```

**⚠️ 주의사항**: Vite 환경에서는 환경변수 접두사가 `VITE_`로 시작해야 합니다.

### API 키 발급 방법
1. [공공데이터포털](https://www.data.go.kr/) 접속
2. 관세청 환율정보 API 검색
3. 신청 및 승인 후 API 키 발급

## 🚀 사용법

### 기본 사용법
```typescript
import { customsApiService } from '@/apis/customsApi';

// 주요 통화 환율 조회
const rates = await customsApiService.getMajorExchangeRates();

// 특정 통화 환율 조회
const usdRate = await customsApiService.getLatestExchangeRate('USD');

// API 상태 확인
const status = await customsApiService.checkApiStatus();
```

### 훅 사용법
```typescript
import { useCustomsApi } from '@/hooks/useCustomsApi';

const { 
    exchangeRates, 
    isLoading, 
    error, 
    refreshRates 
} = useCustomsApi();
```

## 📊 응답 형식

### ExchangeRateInfo
```typescript
interface ExchangeRateInfo {
    currencyCode: string;    // 통화 코드 (USD, EUR, JPY, CNY, GBP)
    currencyName: string;    // 통화명
    baseDate: string;        // 기준일자
    exchangeRate: number;    // 매매기준율
    ttb: number;            // 매도율
    tts: number;            // 매입율
}
```

### ExchangeRateData (UI용)
```typescript
interface ExchangeRateData {
    currency: string;        // 통화 코드
    dailyRate: number;      // 일일 고시환율
    weeklyTariff: number;   // 관세 주간환율
    appliedRate: number;    // 올땀 적용환율
}
```

## ⚙️ 설정 옵션

### customsConfig
```typescript
export const customsConfig = {
    baseUrl: 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo',
    serviceKey: import.meta.env.VITE_CUSTOMS_API_KEY || '',  // Vite 환경변수
    timeout: 10000,                    // 요청 타임아웃 (ms)
    retryCount: 3,                     // 재시도 횟수
    majorCurrencies: ['USD', 'EUR', 'JPY', 'CNY', 'GBP']
};
```

## 🔄 재시도 로직

### 재시도 가능한 에러
- 네트워크 연결 실패
- 5xx 서버 에러
- 타임아웃 에러

### 재시도 불가능한 에러
- 4xx 클라이언트 에러
- API 키 인증 실패
- 요청 한도 초과

## 🚨 에러 처리

### 주요 에러 메시지
- **API 키 없음**: "API 키가 설정되지 않았습니다. 환경변수를 확인해주세요."
- **네트워크 오류**: "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요."
- **타임아웃**: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
- **API 키 무효**: "API 키가 유효하지 않습니다."

### 에러 처리 예시
```typescript
try {
    const rates = await customsApiService.getMajorExchangeRates();
    // 성공 처리
} catch (error) {
    if (error instanceof Error) {
        console.error('환율 조회 실패:', error.message);
        // 사용자에게 에러 메시지 표시
    }
}
```

## 📱 UI 컴포넌트

### ExchangeRateSection
- 환율 정보 테이블 표시
- 에러 상태 표시
- 로딩 스피너
- 사용자 입력 필드 (올땀 적용환율)

### 주요 CSS 클래스
- `.exchange-rate-section`: 섹션 컨테이너
- `.exchange-rate-table`: 테이블 컨테이너
- `.error-message`: 에러 메시지
- `.loading-container`: 로딩 컨테이너
- `.applied-rate-input`: 환율 입력 필드

## 🔧 개발 환경 설정

### 1. 환경변수 파일 생성
```bash
# frontend/.env.local (Vite 환경)
VITE_CUSTOMS_API_KEY=your_api_key_here
```

### 2. 개발 서버 재시작
```bash
npm run dev
```

### 3. API 테스트
- Admin 페이지에서 API 상태 확인
- 환율 설정 모달에서 데이터 로드 확인

## 📝 주의사항

1. **API 키 보안**: 소스코드에 하드코딩하지 말고 환경변수 사용
2. **환경변수 접두사**: Vite에서는 `VITE_` 접두사 필수
3. **호출 한도**: 일일 API 호출 한도 확인 필요
4. **CORS 이슈**: 브라우저에서 직접 호출 시 CORS 정책 확인
5. **에러 처리**: 네트워크 오류 시 적절한 폴백 데이터 제공

## 🆘 문제 해결

### 환경변수 관련 오류
- **"process is not defined"**: Vite에서는 `import.meta.env` 사용
- **환경변수 인식 안됨**: `VITE_` 접두사 확인
- **파일 경로**: `frontend/.env.local` 위치 확인

### CORS 오류 해결
- 프록시 서버 사용
- 백엔드에서 API 호출 후 프론트엔드로 전달
- 브라우저 확장 프로그램 사용 (개발 환경)

### API 키 오류 해결
- 환경변수 파일 경로 확인
- API 키 유효성 검증
- 공공데이터포털에서 API 키 상태 확인

### 네트워크 오류 해결
- 인터넷 연결 상태 확인
- 방화벽 설정 확인
- API 서버 상태 확인
