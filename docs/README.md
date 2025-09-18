# Allttam 프로젝트 문서

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [설치 및 실행](#설치-및-실행)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [배포 가이드](#배포-가이드)

## 🎯 프로젝트 개요

Allttam은 상품 데이터 수집 및 가격 설정 자동화 시스템입니다. 다중 플랫폼(쿠팡, 네이버, 11번가 등)의 상품을 관리하고, 실시간 환율 연동을 통한 마진 계산을 제공합니다.

### 주요 기능
- 🔐 **사용자 인증**: 이메일/소셜 로그인 (네이버, 구글, 카카오)
- 📦 **상품 관리**: 상품 데이터 수집, 등록, 수정
- 💰 **가격 설정**: 실시간 환율 연동 및 마진 계산
- 🛒 **다중 플랫폼**: 쿠팡, 네이버, 11번가 등 통합 관리
- 📊 **대시보드**: 실시간 데이터 모니터링

## 🛠 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Jotai
- **Routing**: React Router v6
- **Styling**: CSS Modules
- **HTTP Client**: Axios
- **Form Management**: React Hook Form + Zod

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB
- **Authentication**: JWT + OAuth 2.0
- **Task Queue**: Celery + Redis
- **API Documentation**: Swagger/OpenAPI

### Infrastructure
- **Container**: Docker + Docker Compose
- **Cache**: Redis
- **File Storage**: AWS S3 (예정)
- **Monitoring**: Prometheus + Grafana (예정)

## 🏗 아키텍처

### 시스템 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Redis Cache   │    │   File Storage  │
│   (Static)      │    │   (Session)     │    │   (S3)          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 폴더 구조
```
Project_Scraper/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── stores/         # 전역 상태 관리 (Jotai)
│   │   ├── apis/           # API 클라이언트
│   │   ├── types/          # TypeScript 타입
│   │   ├── utils/          # 유틸리티 함수
│   │   └── styles/         # 스타일 파일
│   └── package.json
├── app/                     # FastAPI 백엔드
│   ├── routers/            # API 라우터
│   ├── services/           # 비즈니스 로직
│   ├── models/             # 데이터 모델
│   ├── config/             # 설정 파일
│   ├── exceptions/         # 예외 처리
│   └── main.py
├── docs/                   # 프로젝트 문서
│   ├── architecture/       # 아키텍처 문서
│   ├── security/          # 보안 문서
│   └── database/          # 데이터베이스 문서
└── docker-compose.yml
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Project_Scraper
```

### 2. 환경 변수 설정
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_KAKAO_CLIENT_ID=your_kakao_client_id

# app/.env
MONGODB_URL=mongodb://localhost:27017/allttam
JWT_SECRET_KEY=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
```

### 3. 의존성 설치
```bash
# 프론트엔드 (권장)
cd frontend
# lockfile 기반 재현 가능한 설치
npm ci
# 혹은 최초 셋업/lockfile 변경 시
# npm install

# 백엔드
cd app
pip install -r requirements.txt
```

#### 다른 PC에서 pull 후 빠른 설치 명령어
```bash
# 프로젝트 루트에서 실행 (동일 결과)
npm --prefix frontend ci   # 또는: npm --prefix frontend install
```

> 참고: 프론트엔드 의존성은 `frontend/package.json`/`package-lock.json`로 관리되며, 
> 백엔드는 `app/requirements.txt`(또는 루트 `requirements.txt`)로 관리됩니다. 
> Python의 `requirements.txt`만 설치하면 React 패키지(jotai 등)는 설치되지 않습니다.

### 4. 데이터베이스 설정
```bash
# MongoDB 실행
mongod

# Redis 실행
redis-server
```

### 5. 애플리케이션 실행
```bash
# 백엔드 실행
cd app
uvicorn main:app --reload

# 프론트엔드 실행 (새 터미널)
cd frontend
npm run dev
```

#### 트러블슈팅
- 모듈을 찾을 수 없음(예: "Failed to resolve import 'jotai'") 발생 시:
  - 프론트 디렉터리에서 의존성 재설치: `cd frontend && npm ci` (또는 `npm install`)
  - 그래도 안되면 캐시/lockfile 정리 후 재설치:
    ```bash
    cd frontend
    rm -rf node_modules package-lock.json
    npm install
    ```

> 참고: 프론트엔드 의존성은 `frontend/package.json`/`package-lock.json`로 관리되며, 
> 백엔드는 `app/requirements.txt`(또는 루트 `requirements.txt`)로 관리됩니다. 
> Python의 `requirements.txt`만 설치하면 React 패키지(jotai 등)는 설치되지 않습니다.

### 회원가입 폼 구조 변경 내역
- 아이디 필드 제거. 이메일 인증 UI를 기본 정보의 최상단(기존 아이디 위치)으로 이동
- 추가 정보 섹션에 `추천인 코드` 입력 추가(선택 사항)
- 이메일 인증이 완료되지 않으면 회원가입 제출 불가. 경고는 입력 테두리만 사용

저장 스키마 요약
- email, passwordHash
- businessName, representativeName, businessRegistration(숫자만), businessOpeningDate(YYYYMMDD)
- phoneNumber, referralCode(optional)
- userType: free | paid | manager | admin
- createdAt, updatedAt, isActive

## 📚 API 문서

### 인증 API
- `POST /auth/login` - 사용자 로그인
- `POST /auth/signup` - 사용자 회원가입
- `POST /auth/logout` - 사용자 로그아웃
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/profile` - 사용자 프로필 조회
- `GET /auth/social/{provider}/url` - 소셜 로그인 URL 생성
- `POST /auth/social/{provider}/callback` - 소셜 로그인 콜백

### 상품 관리 API
- `GET /products` - 상품 목록 조회
- `POST /products` - 상품 등록
- `PUT /products/{id}` - 상품 수정
- `DELETE /products/{id}` - 상품 삭제

### 가격 설정 API
- `POST /price-setting/save` - 가격 설정 저장
- `GET /price-setting/load/{origin_goods_code}` - 가격 설정 조회
- `GET /price-setting/health` - 서비스 상태 확인

## 🔧 개발 가이드

### 코딩 규칙
- TypeScript 사용 필수
- ESLint + Prettier 설정 준수
- 컴포넌트별 CSS 모듈 사용
- Jotai를 통한 전역 상태 관리
- 에러 처리 체계화

### 커밋 메시지 규칙
```
<type>(<scope>): <subject>

<body>

<footer>
```

**타입**: feat, fix, docs, style, refactor, test, chore
**스코프**: frontend, backend, api, ui, hook, type, modal

### 테스트
```bash
# 프론트엔드 테스트
npm test

# 백엔드 테스트
pytest

# 통합 테스트
npm run test:integration
```

## 🚀 배포 가이드

### Docker를 이용한 배포
```bash
# 전체 빌드
docker-compose build

# 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 환경별 설정
- **개발**: `dev`
- **스테이징**: `staging`
- **프로덕션**: `prod`

## 📊 모니터링

### 메트릭 수집
- 애플리케이션 성능 메트릭
- 인프라 상태 메트릭
- 비즈니스 지표

### 로깅
- 구조화된 로그
- 중앙 집중식 로그 관리
- 실시간 모니터링

## 🔒 보안

### 인증 및 인가
- JWT 기반 인증
- OAuth 2.0 소셜 로그인
- 역할 기반 접근 제어 (RBAC)

### 데이터 보안
- TLS 1.3 암호화
- AES-256-GCM 데이터 암호화
- 개인정보 보호 (GDPR 준수)

## 🤝 기여 가이드

### 개발 프로세스
1. 이슈 생성
2. 브랜치 생성 (`feature/issue-number`)
3. 개발 및 테스트
4. Pull Request 생성
5. 코드 리뷰
6. 머지 및 배포

### 코드 리뷰 체크리스트
- [ ] 하드코딩된 값 제거
- [ ] 타입 안전성 확보
- [ ] 예외 처리 구현
- [ ] 테스트 코드 작성
- [ ] 문서 업데이트

## 📞 지원 및 문의

- **개발팀**: dev-team@allttam.com
- **기술지원**: tech-support@allttam.com
- **문서**: https://docs.allttam.com

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
