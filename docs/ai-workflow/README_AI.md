# AI Workflow Documentation

## 개요
이 문서는 AI 기반 개발 워크플로우와 프로젝트 구조에 대한 가이드를 제공합니다.

## 🚀 AI 코딩 규칙 (.cursorrules)

### 1. 출력 형식 & 파일 관리
- 모든 코드 제안 시, **변경된 파일만** 출력한다.
- 각 코드 블록 상단에 **파일 경로** 주석을 반드시 작성한다.
  예시: `// path: src/components/Example.tsx`
- 불필요하게 전체 프로젝트를 다시 출력하지 않는다.
- 폴더/파일 구조 변경이 있을 경우, 변경 전후 트리 구조를 먼저 제시한 후 코드 작성.
- 코드가 **200줄 이상**이 될 경우, 기능 단위로 파일을 분리하여 제안한다.
  - 분리 시 반드시 폴더 구조를 먼저 제시.
  - 분리 이유를 주석에 설명.

### 2. 폴더 & 타입 구조
- 모든 타입 정의는 `src/types` 폴더에 저장.
- props, interface, enum 등은 개별 파일로 분리 후 index.ts에서 재export.
- 공통 컴포넌트는 `src/components/common`에 저장.
- 재사용 가능한 Modal 컴포넌트는 `src/components/modals`에 저장.

### 3. 스타일 가이드
- 인라인 스타일 사용 금지. CSS/SCSS 모듈 또는 Tailwind만 사용.
- 컴포넌트별 전용 스타일 파일을 생성 (예: `Example.module.css`).
- 반응형 레이아웃 시, 모바일 우선(Mobile-first) 접근.

### 4. 타입스크립트 규칙
- `any` 사용 금지, 불가피한 경우 주석에 이유 명시.
- 모든 함수와 컴포넌트는 명시적 반환 타입 지정.
- 모든 API 응답 타입은 별도의 `src/types/api`에 관리.

### 5. 주석 정책
- 로직 이해에 필수적인 부분만 주석 작성.
- 한글 주석 우선, 필요한 경우 영문 병기.
- 복잡한 로직은 블록 주석으로 요약.

### 6. 코드 리뷰 규칙
- AI가 생성한 코드라도 PR 시 "변경 의도"와 "위험 요소"를 반드시 설명.
- 새로운 의존성 추가 시, 보안/라이선스 검토 필수.
- PR 리뷰어는 기능 테스트와 코드 스타일 검증을 모두 수행.

### 7. 릴리즈 태그 정책
- 주요 기능 배포 시 `git tag vX.Y.Z`로 태그 생성.
- CHANGELOG.md에 변경 사항 요약 필수.

### 8. 실행 스크립트 통일
- 프론트엔드 개발 서버: `npm run dev:frontend`
- 백엔드 개발 서버: `npm run dev:backend`
- 전체 빌드: `npm run build:all`
- 테스트 실행: `npm run test`

### 9. AI 접근 제한
- `.env`의 민감 정보는 절대 AI에게 제공하지 않는다.
- `.env.example`로 키 구조만 공유.
- 토큰/비밀번호는 프롬프트나 코드에 직접 작성 금지.

### 10. 테스트 코드 정책
- 기능 추가/변경 시 반드시 테스트 코드 동반.
- 프론트: Vitest, 백엔드: Pytest 사용.
- 테스트 파일 위치: 해당 기능과 동일 폴더, 파일명은 `*.test.ts(x)` 또는 `test_*.py`.

### 11. 작업 순서
1. 변경 요청 분석
2. 폴더/파일 구조 설계
3. 코드 구현 (200줄 초과 시 파일 분리)
4. 테스트 작성 및 실행
5. PR 생성 + 리뷰
6. Merge & 태그 배포

## 📁 프로젝트 구조

### 백엔드 (Python/FastAPI)
- **app/**: 메인 애플리케이션 디렉토리
  - **services/**: 비즈니스 로직 서비스
    - `service_price_setting.py`: 가격 설정 관련 서비스
  - **routers/**: API 엔드포인트 라우터
    - `func_price_setting.py`: 가격 설정 API 라우터
  - **models/**: 데이터 모델 및 스키마
    - `model_price_setting.py`: 가격 설정 데이터 모델
    - `model_exchange_rate.py`: 환율 데이터 모델
  - **exceptions/**: 커스텀 예외 클래스
    - `price_setting_exceptions.py`: 가격 설정 관련 예외

### 프론트엔드 (React/TypeScript)
- **frontend/src/**: 메인 소스 코드
  - **components/productUpload/modals/PriceSettingModal/**: 가격 설정 모달 컴포넌트
    - `PriceSettingModal.tsx`: 메인 모달 UI 컴포넌트
    - `PriceSettingModalContainer.tsx`: 모달 컨테이너 및 로직
    - `sections/`: 모달 섹션별 컴포넌트
  - **apis/**: API 통신 모듈
    - `priceSettingApi.ts`: 가격 설정 API 클라이언트
  - **types/**: TypeScript 타입 정의
    - `priceSetting.types.ts`: 가격 설정 관련 타입
  - **utils/**: 유틸리티 함수
    - `priceCalculation.ts`: 가격 계산 로직
  - **exceptions/**: 예외 처리 모듈
    - `PriceSettingExceptions.ts`: 가격 설정 예외 클래스
    - `index.ts`: 예외 처리 유틸리티

## 🔧 가격 설정 모달 리팩토링 완료 사항

### 1. 백엔드 개선사항
- ✅ 하드코딩된 환율 통화 제거 (상수로 정의)
- ✅ 불필요한 로깅 코드 제거
- ✅ 예외 처리 강화 및 일관성 확보
- ✅ 데이터 검증 및 무결성 보장
- ✅ 성능 최적화 (불필요한 반복문 제거)

### 2. 프론트엔드 개선사항
- ✅ 하드코딩된 기본값 상수화
- ✅ 더미 데이터 제거
- ✅ 타입 안전성 강화
- ✅ 예외 처리 체계화
- ✅ 불필요한 로깅 제거
- ✅ 참조 오류 방지

### 3. 코드 품질 개선
- ✅ 일관된 예외 처리 패턴
- ✅ 데이터 유효성 검증 강화
- ✅ 타입 안전성 향상
- ✅ 성능 최적화
- ✅ 유지보수성 개선

## 📚 개발 가이드라인

### 예외 처리
```typescript
// 프론트엔드 예외 처리 예시
try {
    await priceSettingApi.save(data);
} catch (error) {
    if (error instanceof ValidationError) {
        // 데이터 검증 오류 처리
    } else if (error instanceof APIError) {
        // API 오류 처리
    } else if (error instanceof NetworkError) {
        // 네트워크 오류 처리
    }
}
```

### 데이터 검증
```typescript
// 데이터 유효성 검증 예시
if (!saveData.originGoodsCode) {
    throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', saveData.originGoodsCode);
}

if (!saveData.exchangeRates || saveData.exchangeRates.length === 0) {
    throw new ValidationError('환율 데이터가 없습니다.', 'exchangeRates', saveData.exchangeRates);
}
```

### 상수 정의
```typescript
// 하드코딩 제거를 위한 상수 정의
const SUPPORTED_CURRENCIES = ['KRW', 'USD', 'CNY', 'JPY', 'EUR'];
const DEFAULT_EXCHANGE_RATE = 1.0;
const DEFAULT_CURRENCY = 'KRW';
```

## 🌐 API 엔드포인트

### 가격 설정 API
- `POST /v1/api/price-setting/save`: 가격 설정 데이터 저장
- `GET /v1/api/price-setting/load/{origin_goods_code}`: 저장된 데이터 조회
- `GET /v1/api/price-setting/health`: 서비스 상태 확인

## 📊 데이터 모델

### PriceSettingRequest
```typescript
interface PriceSettingRequest {
    exchangeRates: ExchangeRateData[];
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    calculatedProducts: Record<string, any>[];
    updatedProducts?: ProductPriceData[];
    originGoodsCode: string;
    baseSellingPriceFormula?: Record<string, any>;
    platformSellingPriceFormula?: Record<string, any>;
}
```

## 🧪 테스트 가이드

### 백엔드 테스트
```bash
# 가격 설정 서비스 테스트
pytest app/tests/test_service_price_setting.py

# 가격 설정 라우터 테스트
pytest app/tests/test_router_price_setting.py
```

### 프론트엔드 테스트
```bash
# 가격 설정 모달 테스트
npm test -- --testPathPattern=PriceSettingModal

# 통합 테스트
npm test -- --testPathPattern=integration
```

## ⚡ 성능 최적화

### 백엔드
- 데이터베이스 쿼리 최적화
- 불필요한 로깅 제거
- 예외 처리 효율화

### 프론트엔드
- 불필요한 리렌더링 방지
- 메모이제이션 활용
- API 호출 최적화

## 🔒 보안 고려사항

- 입력 데이터 검증 강화
- SQL 인젝션 방지
- XSS 공격 방지
- CSRF 토큰 검증

## 📊 모니터링 및 로깅

- 구조화된 로깅
- 에러 추적 및 알림
- 성능 메트릭 수집
- 사용자 행동 분석

## 🚀 배포 가이드

### 환경별 설정
- 개발 환경: `dev`
- 스테이징 환경: `staging`
- 프로덕션 환경: `prod`

### 배포 스크립트
```bash
# 전체 빌드
npm run build:all

# 프론트엔드 배포
npm run deploy:frontend

# 백엔드 배포
npm run deploy:backend
```

## 🔍 문제 해결

### 일반적인 이슈
1. **데이터 검증 실패**: 필수 필드 확인
2. **API 연결 오류**: 네트워크 상태 및 서버 상태 확인
3. **타입 오류**: TypeScript 컴파일러 오류 메시지 확인

### 디버깅 팁
- 브라우저 개발자 도구 활용
- 네트워크 탭에서 API 요청/응답 확인
- 콘솔 로그 분석
- 백엔드 로그 확인

## 🤝 기여 가이드

### 코드 리뷰 체크리스트
- [ ] 하드코딩된 값 제거
- [ ] 타입 안전성 확보
- [ ] 예외 처리 구현
- [ ] 테스트 코드 작성
- [ ] 문서 업데이트

### 커밋 메시지 규칙

#### **기본 형식**
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### **타입 (Type)**
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가/수정
- **chore**: 빌드 프로세스, 도구 변경 등

#### **스코프 (Scope)**
- **frontend**: 프론트엔드 관련 변경
- **backend**: 백엔드 관련 변경
- **api**: API 관련 변경
- **ui**: UI 컴포넌트 변경
- **hook**: 커스텀 훅 변경
- **type**: 타입 정의 변경
- **modal**: 모달 컴포넌트 변경

#### **예시**

##### **기능 추가**
```
feat(modal): 가격 설정 모달에 환율 동기화 기능 추가

- 환율 API 연동 구현
- 실시간 환율 업데이트 기능
- 사용자 설정 저장 기능

Closes #123
```

##### **버그 수정**
```
fix(api): 환율 동기화 시 API 호출 한도 초과 에러 수정

- 일일 API 호출 카운트 로직 개선
- 에러 메시지 사용자 친화적으로 변경
- 재시도 로직 추가

Fixes #456
```

##### **리팩토링**
```
refactor(hook): useExchangeRate 훅을 Container 패턴으로 리팩토링

- 비즈니스 로직과 UI 로직 분리
- 상태 관리 최적화
- 에러 처리 개선
- 테스트 코드 추가

BREAKING CHANGE: useExchangeRate 훅의 반환값 구조 변경
```

##### **문서 수정**
```
docs(workflow): AI 워크플로우 가이드 업데이트

- 커밋 메시지 규칙 추가
- 폴더 구조 가이드 보완
- 예시 코드 추가
```

##### **스타일 변경**
```
style(frontend): ESLint 규칙에 맞게 코드 포맷팅 수정

- 세미콜론 추가
- 들여쓰기 통일
- 불필요한 공백 제거
```

##### **테스트 추가**
```
test(hook): useExchangeRate 훅에 대한 단위 테스트 추가

- 성공 케이스 테스트
- 실패 케이스 테스트
- 에러 처리 테스트
- 테스트 커버리지 85% 달성
```

##### **빌드/도구 변경**
```
chore(build): Webpack 설정 최적화

- 번들 크기 최적화
- 코드 스플리팅 적용
- 개발 서버 성능 개선
```

#### **특수 키워드**
- **Closes #123**: 이슈 해결 시
- **Fixes #456**: 버그 수정 시
- **BREAKING CHANGE**: 호환성 깨짐이 있는 변경 시
- **WIP**: 작업 진행 중 (Pull Request 제목에 사용)

#### **좋은 커밋 메시지 작성 팁**
1. **제목은 50자 이내로 작성**
2. **제목 첫 글자는 소문자로 시작**
3. **제목 끝에 마침표 사용 금지**
4. **명령형 어조 사용** (add, fix, update 등)
5. **무엇을, 왜 변경했는지 명확하게 작성**
6. **한글로 작성하여 팀원이 이해하기 쉽게**

## 📋 테스트 체크리스트

### 1. 단위 테스트
- [ ] 백엔드 서비스 함수 테스트
- [ ] 프론트엔드 컴포넌트 테스트
- [ ] 유틸리티 함수 테스트
- [ ] 예외 처리 테스트

### 2. 통합 테스트
- [ ] 백엔드 API 엔드포인트 테스트
- [ ] 프론트엔드-백엔드 연동 테스트
- [ ] 데이터베이스 연동 테스트

### 3. 성능 테스트
- [ ] API 응답 시간 측정
- [ ] 메모리 사용량 모니터링
- [ ] 동시 사용자 처리 능력 테스트

### 4. 사용자 테스트
- [ ] 실제 사용 시나리오 테스트
- [ ] UI/UX 사용성 테스트
- [ ] 에러 상황 대응 테스트

## 🎯 다음 단계

### 즉시 실행
1. **테스트 실행**: 리팩토링된 코드의 동작 확인
2. **통합 테스트**: 백엔드와 프론트엔드 연동 테스트
3. **성능 테스트**: 응답 시간 및 메모리 사용량 확인
4. **사용자 테스트**: 실제 사용 시나리오 테스트

### 단기 목표 (1-2주)
- [ ] 모든 테스트 케이스 통과 확인
- [ ] 성능 벤치마크 수립
- [ ] 사용자 피드백 수집 및 반영

### 중기 목표 (1개월)
- [ ] 프로덕션 환경 배포
- [ ] 모니터링 시스템 구축
- [ ] 지속적인 성능 최적화

## 📞 지원 및 문의

- **개발팀**: dev-team@company.com
- **기술지원**: tech-support@company.com
- **문서**: https://docs.company.com

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.



## [프롬프트 예시]
- 요청 사항 : frontend 가격 설정 모달 관련해서 500 에러 개선
    1. 상태: INFO:     127.0.0.1:64481 - "POST /api/price-setting/save HTTP/1.1" 500 Internal Server Error
    2. 참고 :   아래 규칙은 꼭 지킬 것
    3. 추가 요청 : 데이터 구조가 맞는 스키마 확인할 것


- frontend : Vite + TypeScript + React (개발 서버: npm run dev)
- backend : python + FastAPI (개발 서버: uvicorn app.main:app --reload)
- 규칙 :
    1. 실무적인 올바른 설계로 반영 (사양 맞지 않는 파일 제거_예시로 js 파일)
    2. (필요 시) 하드 코딩 제거 / 더미 데이터는 지양
    3. 참조/경로 오류를 방지
    4. (필요 시) 불필요한 코드 (README_AI.md 주석 정책 참고) / 중복 디버깅 코드 제거
    5. 에러 처리 및 로딩 상태 관리 최적화 (필요시 exception 폴더 구조 리팩토링, 일관된 에러 처리)  
    6. 별도의 명령 없이는 CSS 코드 유지
    7. 코드 품질 개선 (타입 안전성 개선, 성능 최적화, 비용 절감을 위한 효율적인 통신 구조 최적화)
    8. (필요 시) README_AI.md 에 필요한 규칙을 업데이트
    9. 데이터 구조/ 무결성/ 유효성 검증 
    10. 단위테스트,(필요 시)프론트엔드 연동 테스트(통신 확인), 성능 테스트(응답 시간 측정) 진행
    11. 에러 발생 시 디버깅 처리 및 에러 해결 후 디버깅 로그 코드 제거
    12. 프로젝트 안의 파일을 직접 수정  


  1~3 은 base_price_setting 컬렉션에 
  1~4 는 ModifiedGoodsDetail 컬렉션에
    1. ExchangeRateInfo
      1) currencyCode
      2) appliedRate
      3) lastUpdated
      4) source
    2. SellingPriceFormulaInfo
      1) baseMarginRate
      2) additionalMargin
      3) baseShippingFee
      4) returnShippingFee
      5) exchangeShippingFee
      6) internationalShippingFee
      7) freeShipping
      8) optimizeShippingFee
    3. PlatformMarginRateInfo
      1) smartstore
      2) coupang
      3) auction
      4) gmarket
      5) elevenst
      6) openmarket
    4. CalculatedItemInfo
      1) ExpectedMargin
      2) ExpectedMarginRate
      3) selling_price