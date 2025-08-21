# AI Workflow Documentation

## 📁 폴더 구조 및 파일 관리 규칙

### **전역 폴더 구조 규칙**

#### **1. Hooks 관리 규칙**
- **모든 커스텀 훅은 `src/hooks/` 폴더에서 중앙 관리**
- **컴포넌트별 hooks 폴더는 허용하지 않음**
- **예외**: 특정 도메인에만 사용되는 훅은 해당 도메인 폴더 내 hooks 폴더 허용

```
✅ 올바른 구조:
src/hooks/
├── useExchangeRate.ts
├── usePriceCalculation.ts
├── useImageUpload.ts
└── useCustomsApi.ts

❌ 잘못된 구조:
src/components/ProductUpload/modals/PriceSettingModal/hooks/
├── useExchangeRate.ts
└── usePriceCalculation.ts
```

#### **2. Container 패턴 규칙**
- **모든 모달과 페이지는 Container 패턴으로 구현**
- **index.ts 파일은 Container 컴포넌트를 export**
- **비즈니스 로직과 상태 관리는 Container에서 처리**

```
✅ 올바른 구조:
src/components/ProductUpload/modals/PriceSettingModal/
├── PriceSettingModalContainer.tsx  # 비즈니스 로직, 상태 관리
├── PriceSettingModal.tsx           # UI 컴포넌트
├── PriceSettingModal.css
└── index.ts                        # Container export

❌ 잘못된 구조:
src/components/ProductUpload/modals/PriceSettingModal/
├── PriceSettingModal.tsx           # 비즈니스 로직과 UI 혼재
├── PriceSettingModal.css
└── index.ts                        # 직접 컴포넌트 export
```

#### **3. 폴더 구조 표준**
```
src/
├── components/                      # 재사용 가능한 컴포넌트
│   ├── common/                     # 공통 컴포넌트
│   ├── modals/                     # 모달 컴포넌트
│   └── [도메인명]/                 # 도메인별 컴포넌트
├── hooks/                          # 전역 커스텀 훅
├── apis/                           # API 서비스
├── types/                          # 전역 타입 정의
├── utils/                          # 유틸리티 함수
└── styles/                         # 전역 스타일
```

#### **4. 파일명 규칙**
- **컴포넌트**: PascalCase (예: `PriceSettingModal.tsx`)
- **컨테이너**: PascalCase + Container (예: `PriceSettingModalContainer.tsx`)
- **훅**: camelCase + use (예: `useExchangeRate.ts`)
- **타입**: camelCase + .types (예: `priceSetting.types.ts`)
- **스타일**: 컴포넌트명과 동일 + .css (예: `PriceSettingModal.css`)

#### **5. 모달 컴포넌트 구조 규칙**
```
modals/[모달명]/
├── [모달명]Container.tsx          # 비즈니스 로직, 상태 관리
├── [모달명].tsx                   # UI 컴포넌트
├── [모달명].css                   # 스타일 (컴포넌트와 같은 폴더)
├── sections/                      # 섹션별 컴포넌트
│   ├── [섹션명]Section.tsx
│   └── [섹션명]Section.css
├── types/                         # 모달 전용 타입
│   └── [모달명].types.ts
└── index.ts                       # Container export
```

#### **6. CSS 파일 관리 규칙**
- **컴포넌트별 CSS**: 각 컴포넌트와 같은 폴더에 CSS 파일 배치
- **전역 스타일**: `src/styles/` 폴더에는 공통 스타일만 관리
- **컴포넌트 스타일**: `src/components/[도메인]/[컴포넌트명]/[컴포넌트명].css`

```
✅ 올바른 구조:
src/components/productUpload/modals/PriceSettingModal/
├── PriceSettingModalContainer.tsx
├── PriceSettingModal.tsx
├── PriceSettingModal.css          # 컴포넌트와 같은 폴더
└── sections/
    ├── ExchangeRateSection.tsx
    └── ExchangeRateSection.css    # 섹션별 CSS도 같은 폴더

❌ 잘못된 구조:
src/styles/productUpload/modals/PriceSettingModal.css  # 전역 스타일 폴더에 컴포넌트별 CSS
```

---

## 💱 환율 동기화 시스템 아키텍처

### 🏗️ **시스템 구조**

#### **핵심 컴포넌트**
```
환율 동기화 시스템
├── exchange_rate_sync.py          # 🎯 백엔드 핵심 동기화 로직 (FastAPI)
├── useExchangeRateSync.ts         # 🔄 React 상태 관리 훅
├── ExchangeRateSection.tsx        # 🖥️ UI 표시 및 사용자 인터랙션
├── PriceSettingModalContainer.tsx # 🔗 이벤트 연결 및 상태 관리
└── main.py                        # 🚪 FastAPI 라우터 등록
```

#### **역할 분담**
```
프론트엔드 (React)
├── 사용자 인터랙션 처리
├── 환율 데이터 상태 관리
├── 백엔드 API 호출
└── UI 렌더링

백엔드 (FastAPI)
├── 외부 API 프록시 (관세청, 한국수출입은행)
├── MongoDB 데이터 저장/조회
├── 비즈니스 로직 처리
├── 날짜 유효성 검증
├── API 호출 제한 관리
└── 초기 데이터 생성

데이터베이스 (MongoDB)
├── 환율 데이터 영구 저장
├── 날짜별 데이터 관리
└── 데이터 무결성 보장
```

#### **데이터 흐름**
```
사용자 펼치기 토글 클릭
    ↓
ExchangeRateSection.tsx (onSyncRates 호출)
    ↓
PriceSettingModalContainer.tsx (handleSyncRates 실행)
    ↓
useExchangeRateSync.ts (syncExchangeRates 실행)
    ↓
백엔드 API (/api/exchange-rate-sync/sync)
    ↓
ExchangeRateSyncService.sync_exchange_rates()
    ↓
MongoDB에서 환율 데이터 로드 또는 외부 API에서 새 데이터 가져오기
```

### 🔄 **상세 동작 흐름**

#### **1단계: 사용자 인터랙션**
```
가격 설정 모달 → 환율 설정 섹션 → 펼치기 토글 클릭
    ↓
ExchangeRateSection.tsx에서 onSyncRates() 함수 호출
    ↓
PriceSettingModalContainer.tsx의 handleSyncRates() 실행
    ↓
useExchangeRateSync.ts의 syncExchangeRates() 실행
```

#### **2단계: 백엔드 API 호출**
```
POST /api/exchange-rate-sync/sync
    ↓
ExchangeRateSyncService.sync_exchange_rates() 실행
    ↓
데이터베이스 구조 확인 및 초기화
```

#### **3단계: 데이터베이스 구조 검증**
```
ExchangeRateSyncService.ensure_collections_exist()
    ↓
MongoDB 연결 상태 확인
    ↓
필요한 컬렉션 존재 여부 확인 및 생성
    ↓
데이터베이스 경로 검증 완료
```

#### **4단계: 날짜 유효성 검증**
```
ExchangeRateSyncService.sync_exchange_rates()
    ↓
MongoDB에서 저장된 환율 데이터 조회
    ↓
데이터가 없는 경우 → 초기 데이터 자동 생성
    ↓
오늘 날짜와 저장된 데이터 날짜 비교
    ↓
일일고시환율 반영 날짜 vs 오늘 날짜
관세주간환율 종료 날짜 vs 오늘 날짜
```

#### **5단계: 조건부 API 호출**
```
날짜가 다르면 → 외부 API 호출
날짜가 같으면 → MongoDB 캐시 사용

일일고시환율:
├── 날짜 불일치 → 한국수출입은행 API 호출
└── 날짜 일치 → MongoDB 캐시 사용

관세주간환율:
├── 날짜 불일치 → 관세청 API 호출
└── 날짜 일치 → MongoDB 캐시 사용
```

#### **6단계: 데이터 저장 및 통합**
```
외부 API에서 가져온 데이터 → MongoDB에 저장
    ↓
일일고시환율 + 관세주간환율 데이터 통합
    ↓
통합된 환율 데이터를 프론트엔드로 전송
    ↓
React 상태에 반영하여 UI 업데이트
```

### 🎯 **핵심 기능**

#### **자동 초기화**
- **MongoDB에 환율 데이터가 전혀 없는 경우**
- **기본 통화별 초기 환율 데이터 자동 생성**
- **USD, EUR, JPY, CNY 통화별 기본값 설정**
- **컬렉션이 존재하지 않는 경우 자동 생성**

#### **스마트 캐싱**
- **일일 1회 API 호출 제한**
- **날짜 기반 캐시 유효성 검증**
- **불필요한 외부 API 호출 방지**
- **강제 동기화 옵션 제공**

#### **에러 처리 및 복구**
- **API 호출 실패 시 기본값 사용**
- **데이터베이스 연결 실패 시 명확한 에러 메시지**
- **부분적 실패 시에도 시스템 안정성 유지**
- **로깅을 통한 상세한 에러 추적**

### 🔧 **API 호출 제한 정책**

#### **일일 호출 한도**
```
MAX_DAILY_API_CALLS = 1 (통화 타입별)

일일고시환율: 하루 최대 1회
관세주간환율: 하루 최대 1회
```

#### **호출 카운트 관리**
```
날짜가 바뀌면 카운트 자동 초기화
API 호출 성공 시에만 카운트 증가
한도 초과 시 에러 메시지 반환
강제 동기화 시 제한 우회 가능
```

### 📊 **데이터 구조**

#### **MongoDB 컬렉션 구조**
```
exchange_rates 컬렉션
├── currencyCode: 통화 코드 (USD, EUR, JPY, CNY)
├── appliedRate: 적용 환율
├── source: 데이터 출처 (customs, koreaexim, manual)
├── rateType: 환율 타입 (daily, weekly)
├── baseDate: 기준 날짜 (YYYYMMDD)
└── isActive: 활성 상태
```

#### **프론트엔드 데이터 구조**
```
ExchangeRateData
├── currency: 통화 코드
├── dailyRate: 일일고시환율
├── weeklyTariff: 관세주간환율
├── appliedRate: 적용 환율
```

#### **백엔드 API 응답 구조**
```
ExchangeRateSyncResponse
├── success: 성공 여부
├── data: 통합된 환율 데이터
├── message: 동기화 결과 메시지
├── source: 데이터 출처 (cache/api/initialized)
├── lastUpdated: 마지막 업데이트 시간
├── dailyRateDate: 일일고시환율 날짜
├── weeklyTariffDate: 관세주간환율 날짜
├── isDailyRateValid: 일일고시환율 유효성
└── isWeeklyTariffValid: 관세주간환율 유효성
```

### 🚀 **성능 최적화**

#### **캐시 전략**
- **날짜 기반 캐시 유효성 검증**
- **MongoDB 영구 저장**
- **중복 API 호출 방지**
- **스마트한 동기화 조건 확인**

#### **비동기 처리**
- **FastAPI 비동기 처리**
- **MongoDB 비동기 드라이버 사용**
- **에러 발생 시에도 다른 API 호출 계속 진행**
- **사용자 경험 최적화**

### 🔐 **보안 및 환경변수**

#### **환경변수 관리**
```
프로젝트 루트 (.env)
├── VITE_CUSTOMS_API_KEY: 관세청 API 키
├── VITE_KOREAEXIM_API_KEY: 한국수출입은행 API 키
└── VITE_API_BASE_URL: 백엔드 API 기본 URL
```

#### **API 키 보안**
- **백엔드에서만 API 키 접근**
- **프론트엔드에는 API 키 노출 금지**
- **환경변수를 통한 안전한 키 관리**
- **API 호출 제한을 통한 비용 관리**

---

## 이미지 호스팅 시스템 관리 가이드

### 📁 파일명 규칙 (Naming Convention)

#### **기본 규칙**
```
[상품코드]_[이미지타입]_[날짜]_[UUID8자리].[확장자]

예시:
A00000020711907_thumbnail_20250818_101d9c71.jpg
A00000020711907_detail_01_20250818_101d9c71.jpg
A00000020711907_gallery_01_20250818_101d9c71.jpg
```

#### **규칙 세부사항**
- **상품코드**: `origin_goods_code` 값 사용, 없으면 `unknown`
- **이미지타입**: `thumbnail`, `detail`, `gallery`, `image` 등
- **날짜**: YYYYMMDD 형식 (예: 20250818)
- **UUID**: 전체 UUID의 앞 8자리만 사용하여 가독성 향상
- **확장자**: 원본 파일 확장자 유지 (jpg, png, webp 등)

#### **카테고리별 이미지타입 매핑**
- `thumbnail` → `thumbnail`
- `detail` → `detail`
- `gallery` → `gallery`
- 기타 → `image`

### 🗂️ 메타데이터 저장 구조

#### **썸네일 메타데이터**
```
uploads/metadata/
├── A00000020711907_thumbnails_20250818.json
├── B00000012345678_thumbnails_20250819.json
└── ...
```

#### **메타데이터 내용**
```json
{
  "origin_goods_code": "A00000020711907",
  "thumbnail_images": ["url1", "url2"],
  "saved_at": "2025-08-18T10:30:00",
  "total_images": 2,
  "status": "active"
}
```

### 🔄 이미지 우선순위 정책

#### **로딩 우선순위**
1. **호스팅된 이미지** (`https://pub-b8307bd30f534121a8852e53312218eb.r2.dev/...`)
2. **원본 이미지 URL** (`https://image.oliveyoung.co.kr/...`)
3. **Blob URL** (`blob:http://localhost:5173/...`)

#### **모달 재열기 시 동작**
- 호스팅된 이미지가 있으면 우선 표시
- 외부 이미지는 백업으로 사용
- 사용자 경험 최적화

### 🎨 모달 컴포넌트 구조 규칙

#### **새로운 모달 생성 시**
- `src/components/productUpload/modals/` 폴더 내에 모달명 폴더 생성
- `modals/모달명/` 구조로 하위 컴포넌트 분리
- `sections/`, `types/` 폴더로 기능별 분리
- **Container 패턴 필수 적용**

#### **폴더 구조 예시**
```
modals/PriceSettingModal/
├── sections/           # 섹션별 컴포넌트
│   ├── ExchangeRateSection.tsx
│   ├── FormulaSection.tsx
│   └── MarginListSection.tsx
├── types/             # 타입 정의
│   └── priceSetting.types.ts
├── PriceSettingModalContainer.tsx  # 비즈니스 로직
├── PriceSettingModal.tsx           # UI 컴포넌트
├── PriceSettingModal.css           # 스타일
└── index.ts           # Container export
```

#### **외부 API 연동 규칙**
- 환율/관세 정보는 `src/hooks/useCustomsApi.ts`에서 관리
- 실제 API 연동 시 TODO 주석으로 표시
- 개발 중에는 더미 데이터 사용

---

## 네트워크 최적화 규칙(필수)

### 업로드/전달 캐시 정책
- 모든 업로드 객체에는 아래 헤더를 반드시 설정한다.
  - `Cache-Control: public, max-age=31536000, immutable`
- 이유: 동일 URL을 패널/뷰어가 연속 참조할 때 네트워크 왕복을 제거하고 캐시로 처리되도록 하기 위함.

### 이미지 URL 표준화
- 공개 URL은 환경변수 기반으로 생성한다.
  - 개발(r2.dev): `CLOUDFLARE_R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev/<bucket>`
  - 운영(커스텀 도메인): `CLOUDFLARE_R2_PUBLIC_URL=https://img.allttam.kr`
- 메타데이터에는 오브젝트 키만 저장 권장(베이스 URL 중복 방지).

### 중복 요청 방지
- 에디터 '패널 적용': 업로드 금지, blob 미리보기만 사용.
- '저장' 클릭 시에만 업로드 수행, 성공 후 퍼블릭 URL로 교체.
- 동일 URL 다중 렌더링은 캐시로 처리되므로 추가 최적화는 선택.

---

## 관리자 기능 계획

### 🎛️ 이미지 호스팅 서버 관리 UI

#### **설정 관리**
- **보관 기간 설정**: 기본값 365일, 관리자별 커스터마이징
- **아카이브 전환 기간**: 활성 → 아카이브 → 삭제 단계별 관리
- **용량 제한**: 사용자별/프로젝트별 스토리지 할당량
- **압축 품질**: WebP 변환 품질, 썸네일 크기 등

#### **사용자별 관리**
- **개별 사용자 설정**: 보관 기간, 용량 제한, 권한 등
- **그룹별 정책**: 팀/부서별 이미지 관리 정책
- **권한 관리**: 업로드, 삭제, 수정 권한 세분화

#### **정리 및 아카이브**
- **자동 정리**: 설정된 기간에 따른 자동 삭제/아카이브
- **수동 정리**: 관리자가 직접 이미지 선택 삭제
- **일괄 작업**: 조건별 이미지 일괄 처리
- **복구 기능**: 실수로 삭제된 이미지 복구

#### **모니터링 및 통계**
- **사용량 통계**: 사용자별, 기간별 이미지 사용량
- **성능 모니터링**: 업로드 속도, 에러율 등
- **비용 분석**: 스토리지 비용 추적 및 예측

---

## 향후 확장 계획

### **고급 기능**
- **AI 이미지 태깅**: 자동으로 이미지 내용 분석하여 태그 생성
- **중복 이미지 감지**: 유사한 이미지 자동 감지 및 중복 제거
- **이미지 최적화**: 자동으로 이미지 품질 최적화
- **CDN 연동**: Cloudflare R2 등 외부 스토리지 연동

### **보안 및 규정 준수**
- **GDPR 준수**: 개인정보 포함 이미지 자동 감지 및 처리
- **접근 제어**: IP 기반, 시간 기반 접근 제한
- **감사 로그**: 모든 이미지 관련 작업 로그 기록
- **백업 및 복구**: 정기적인 백업 및 재해 복구 계획

