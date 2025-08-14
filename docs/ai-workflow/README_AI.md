# AI 개발 가이드 (README_AI.md)

> 이 문서는 Cursor/Claude Code/GitHub Copilot 등 생성형 AI가 이 프로젝트를 개발할 때 참고해야 하는 컨텍스트와 템플릿을 모아둔 파일입니다.  
> 모든 AI 작업은 이 가이드와 `.cursorrules` 규칙을 함께 준수합니다.

---

## 1. 프로젝트 개요
- **프로젝트명**: Project_Scraper
- **목적**: 상품 데이터 수집 및 가공, 이미지 편집, 스마트스토어/쿠팡같은 오픈마켓과의 상품데이터 통신, 오픈마켓의 주문 데이터 수집 및 가공 등 다양한 기능 제공.
- **주요 기술 스택**:
  - **Frontend**: React 19.1, TypeScript, Recoil, React Query, React Bootstrap, TailwindCSS
  - **Backend**: Python 3.11, FastAPI, WebSocket
  - **DB**: MongoDB
  - **패키지 매니저**: npm
  - **버전 관리**: Git / GitHub
- **코드 스타일**: `.cursorrules`에 정의된 규칙 준수 (200줄 이상 파일 분리, 타입스크립트 엄격 모드 등)

---

## 2. 리포지토리 구조 요약

```plaintext
frontend/ (Vite + React + TypeScript)
 ├── src/
 │   ├── assets/           # 정적 리소스(이미지, 아이콘 등)
 │   ├── common/           # baseUrl.ts
 │   ├── components/       # UI 컴포넌트
 │   │   ├── common/       # 공용 버튼, 입력창 등
 │   │   ├── modals/       # 재사용 가능한 모달
 │   │   │   └── ThumbModal/ # 썸네일 편집 모달 (리팩토링 완료)
 │   │   │       ├── lib/     # 로컬 hooks + types
 │   │   │       │   ├── useThumbnailTransform.ts
 │   │   │       │   ├── useThumbnailPanel.ts
 │   │   │       │   ├── useThumbnailReorder.ts
 │   │   │       │   └── thumbnail.types.ts
 │   │   │       ├── components/ # 로컬 로직 컴포넌트
 │   │   │       │   └── ThumbnailTransformSync.tsx
 │   │   │       ├── parts/      # 메인 UI 컴포넌트
 │   │   │       │   ├── ThumbnailPanel.tsx
 │   │   │       │   ├── EditorMain.tsx
 │   │   │       │   ├── ViewerPanel.tsx
 │   │   │       │   └── ...
 │   │   │       ├── ThumbnailModal.tsx
 │   │   │       └── ThumbnailModalContainer.tsx
 │   │   ├── productCollect/    # 수집사이트(올리브영)로부터 상품 DB 수집 관련 UI
 │   │   ├── productUpload/     # 상품 DB 가공(편집)/업로드 관련 UI
 │   │   ├── productManagement/ # 업로드한 상품 DB 가공(편집) 관련 UI
 │   │   ├── orderManagement/   # 오픈마켓으로부터 주문 상품 DB 수집, 가공(편집), 배송대행지와의 통신 관련 UI
 │   │   ├── admin/             # 사용자 관리, 공지사항, 결제내역, 로그 관리 관련 UI
 │   │   ├── pay/               # 사용 요금/결제 관련 UI
 │   │   └── setting/           # 마켓 계정/api 등 정보 셋팅 관련 UI
 │   ├── hooks/                 # 전역 커스텀 훅 (useCanvasTransform 등)
 │   ├── types/                 # 전역 타입 정의
 │   ├── lib/                   # 전역 공통 유틸리티 및 로직
 │   ├── styles/                # CSS/SCSS 모듈
 │   ├── pages/                 # 페이지 단위 컴포넌트
 │   └── utils/                 # 유틸리티 함수
 ├── public/                    # 정적 파일 (default-thumb.jpg 등)
 ├── package.json
 └── tsconfig.json

backend/ (FastAPI 기반)
└── app/
    ├── models/           # DB 모델 정의 (SQLAlchemy 등)
    ├── routers/          # API 라우터 모음
    ├── scrapers/         # 데이터 수집/크롤링 로직
    ├── services/         # 비즈니스 로직, 서비스 계층
    ├── tmp/               # 임시 저장소 (작업 중 데이터/파일)
    ├── utils/            # 공용 유틸 함수
    ├── websockets/       # WebSocket 관련 기능
    ├── __init__.py
    ├── config.py         # 환경 설정
    └── main.py           # FastAPI 엔트리 포인트

---

## 3. 폴더 구조 설계 원칙

### 3-1. 전역 vs 로컬 폴더 구분
- **전역 폴더** (`src/` 직하위): 프로젝트 전체에서 공통 사용
  - `hooks/`: 전역 커스텀 훅
  - `types/`: 전역 타입 정의
  - `lib/`: 전역 공통 유틸리티 및 로직
  - `utils/`: 전역 유틸리티 함수
- **로컬 폴더** (컴포넌트 내부): 해당 컴포넌트에서만 사용
  - `lib/`: 로컬 hooks + types 통합
  - `components/`: 로직이 포함된 컴포넌트 (ThumbnailTransformSync 등)
  - `parts/`: 메인 UI 컴포넌트 (ThumbnailPanel, EditorMain 등)
  - `hooks/`, `types/`: 전역 레벨에서만 사용

### 3-2. 폴더 명명 규칙
- **`lib/`**: hooks와 types를 통합하여 관리 (로컬 레벨)
- **`components/`**: 로직이 포함된 컴포넌트 (ThumbnailTransformSync 등)
- **`parts/`**: 메인 UI 렌더링 컴포넌트 (ThumbnailPanel, EditorMain 등)
- **`hooks/`, `types/`**: 전역 레벨에서만 사용

### 3-3. 파일 분리 기준
- **200줄 이상**: 기능 단위로 파일 분리
- **재사용 가능 로직**: hooks/util로 이동
- **컴포넌트별 로직**: 해당 컴포넌트의 lib 폴더에 배치

---

## 4. 빌드 & 실행

### Backend
```bash
개발 모드 실행
uvicorn app.main:app --reload

(옵션) 빌드/배포 시
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
개발 서버
npm install
npm run dev

빌드
npm run build

빌드된 파일 로컬 미리보기
npm run preview
```

---

## 5. 프롬프트 템플릿
### 5-1. 컴포넌트 생성
[컨텍스트]
- React 19 + TypeScript + Vite + Recoil
- CSS: SCSS 모듈(/styles)
- 함수형 컴포넌트만 사용, any 타입 금지

[목표]
상품 썸네일 모달 생성, 기존 modal 공용 레이아웃 재사용

[요구사항]
1. props: isOpen, onClose, images[]
2. 모바일/데스크탑 반응형
3. 이미지 클릭 시 확대 보기
4. SCSS 모듈 /styles/modalThumbnail.module.scss 생성

[출력 형식]
- TSX 코드 + SCSS 코드
- 주요 동작 주석 포함

[금지 사항]
- class형 컴포넌트
- 인라인 스타일
- 불필요한 외부 라이브러리

### 5-2. 코드 리뷰
[컨텍스트]
- 동일 프로젝트
- eslint/prettier 규칙 준수

[목표]
ItemRow.tsx 리팩토링

[요구사항]
1. 반복 로직 함수로 분리
2. 불필요한 state 제거
3. useEffect 의존성 배열 최적화

[출력 형식]
- 변경된 코드와 변경 이유

---

## 6. 코드 작성& 리뷰 규칙
1. 코드 스타일
- eslint / prettier 자동 포맷 유지
- 함수형 컴포넌트, any 타입 금지
- SCSS 모듈 사용, 인라인 스타일 금지
2. 파일 분리 기준
- 200줄 이상 → 기능 단위로 분리
- 재사용 가능 로직 → hooks/util로 이동
3. 릴리즈 태그 정책
- v[주버전].[부버전].[패치]
- 기능 추가: 부버전 ↑
- 버그 수정: 패치 ↑
4. 실행 스크립트 통일
- Backend: npm run backend:dev
- Frontend: npm run frontend:dev
5. AI 접근 제한
- 보안 키/민감 데이터는 프롬프트에 절대 포함 금지

