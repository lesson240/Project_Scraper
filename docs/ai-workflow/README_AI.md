# AI Workflow Documentation

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
- `sections/`, `hooks/`, `types/` 폴더로 기능별 분리

#### **폴더 구조 예시**
```
modals/PriceSettingModal/
├── sections/           # 섹션별 컴포넌트
│   ├── ExchangeRateSection.tsx
│   ├── FormulaSection.tsx
│   └── MarginListSection.tsx
├── hooks/             # 커스텀 훅
│   ├── useExchangeRate.ts
│   └── usePriceCalculation.ts
├── types/             # 타입 정의
│   └── priceSetting.types.ts
├── PriceSettingModal.tsx  # 메인 컴포넌트
├── PriceSettingModal.css  # 스타일
└── index.ts           # export
```

#### **외부 API 연동 규칙**
- 환율/관세 정보는 `hooks/useExchangeRate.ts`에서 관리
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
- 에디터 ‘패널 적용’: 업로드 금지, blob 미리보기만 사용.
- ‘저장’ 클릭 시에만 업로드 수행, 성공 후 퍼블릭 URL로 교체.
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

