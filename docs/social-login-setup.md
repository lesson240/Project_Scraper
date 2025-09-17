# 소셜 로그인 API 연동 가이드

## 📋 개요
네이버, 구글, 카카오 소셜 로그인을 위한 API 키 발급 및 설정 가이드입니다.

## 🔑 API 키 발급 가이드

### 1. 네이버 로그인 설정

#### 1.1 네이버 개발자 센터 접속
- URL: https://developers.naver.com/
- 네이버 계정으로 로그인

#### 1.2 애플리케이션 등록
1. **애플리케이션 등록** 메뉴 클릭
2. **애플리케이션 이름**: `Allttam`
3. **사용 API**: `네이버 로그인` 선택
4. **서비스 환경**: `Web` 선택
5. **서비스 URL**: `https://allttam.com` (프로덕션)
6. **네이버 로그인 Callback URL**: `https://allttam.com/api/auth/naver/callback`

#### 1.3 API 키 확인
- **Client ID**: `your_naver_client_id`
- **Client Secret**: `your_naver_client_secret`

#### 1.4 권한 설정
- **회원 이름**: 필수
- **이메일**: 필수
- **별명**: 선택
- **프로필 사진**: 선택

### 2. 구글 로그인 설정

#### 2.1 Google Cloud Console 접속
- URL: https://console.cloud.google.com/
- Google 계정으로 로그인

#### 2.2 프로젝트 생성
1. **새 프로젝트** 클릭
2. **프로젝트 이름**: `Allttam`
3. **생성** 클릭

#### 2.3 OAuth 동의 화면 구성
1. **API 및 서비스** > **OAuth 동의 화면**
2. **사용자 유형**: `외부` 선택
3. **앱 정보**:
   - **앱 이름**: `Allttam`
   - **사용자 지원 이메일**: `support@allttam.com`
   - **개발자 연락처 정보**: `dev@allttam.com`

#### 2.4 사용자 인증 정보 생성
1. **API 및 서비스** > **사용자 인증 정보**
2. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
3. **애플리케이션 유형**: `웹 애플리케이션`
4. **승인된 리디렉션 URI**: `https://allttam.com/api/auth/google/callback`

#### 2.5 API 키 확인
- **클라이언트 ID**: `your_google_client_id`
- **클라이언트 보안 비밀번호**: `your_google_client_secret`

### 3. 카카오 로그인 설정

#### 3.1 카카오 개발자 센터 접속
- URL: https://developers.kakao.com/
- 카카오 계정으로 로그인

#### 3.2 애플리케이션 등록
1. **내 애플리케이션** > **애플리케이션 추가하기**
2. **앱 이름**: `Allttam`
3. **사업자명**: `Allttam`
4. **카테고리**: `기타` 선택

#### 3.3 카카오 로그인 활성화
1. **제품 설정** > **카카오 로그인**
2. **활성화 설정**: `ON`
3. **Redirect URI**: `https://allttam.com/api/auth/kakao/callback`

#### 3.4 동의 항목 설정
1. **제품 설정** > **카카오 로그인** > **동의항목**
2. **필수 동의항목**:
   - **카카오계정(이메일)**: 필수
   - **닉네임**: 필수
   - **프로필 사진**: 선택

#### 3.5 API 키 확인
- **REST API 키**: `your_kakao_client_id`
- **Client Secret**: `보안` 탭에서 활성화 후 확인

## 🔧 환경 변수 설정

### .env 파일 업데이트
```bash
# 소셜 로그인 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 콜백 URL 설정
NAVER_CALLBACK_URL=https://allttam.com/api/auth/naver/callback
GOOGLE_CALLBACK_URL=https://allttam.com/api/auth/google/callback
KAKAO_CALLBACK_URL=https://allttam.com/api/auth/kakao/callback

# 개발 환경용 (로컬 테스트)
NAVER_CALLBACK_URL_DEV=http://localhost:3000/api/auth/naver/callback
GOOGLE_CALLBACK_URL_DEV=http://localhost:3000/api/auth/google/callback
KAKAO_CALLBACK_URL_DEV=http://localhost:3000/api/auth/kakao/callback
```

### frontend/.env 파일 업데이트
```bash
# 소셜 로그인 설정
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_KAKAO_CLIENT_ID=your_kakao_client_id

# API 기본 URL
VITE_API_BASE_URL=https://api.allttam.com
```

## 🚀 구현 단계

### 1단계: 환경 변수 설정
1. 위의 환경 변수들을 `.env` 파일에 추가
2. 실제 API 키 값으로 교체
3. 개발/프로덕션 환경별로 분리 관리

### 2단계: 백엔드 API 구현
1. 소셜 로그인 URL 생성 API
2. 소셜 로그인 콜백 처리 API
3. 사용자 정보 조회 및 저장 로직

### 3단계: 프론트엔드 연동
1. 소셜 로그인 버튼 구현
2. 콜백 처리 로직
3. 에러 처리 및 사용자 피드백

### 4단계: 테스트
1. 각 플랫폼별 로그인 테스트
2. 사용자 정보 저장 확인
3. 에러 케이스 테스트

## ⚠️ 주의사항

### 보안
- **Client Secret**은 절대 프론트엔드에 노출하지 마세요
- 환경 변수는 `.gitignore`에 추가하여 버전 관리에서 제외
- HTTPS를 사용하여 모든 통신을 암호화

### 개발 환경
- 로컬 개발 시 `localhost` URL 사용
- 각 플랫폼의 개발자 도구에서 로컬 URL 등록 필요

### 프로덕션 환경
- 실제 도메인으로 콜백 URL 설정
- SSL 인증서 적용 필수
- 도메인 변경 시 각 플랫폼에서 URL 업데이트 필요

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. API 키가 올바르게 설정되었는지
2. 콜백 URL이 정확한지
3. 네트워크 연결 상태
4. 각 플랫폼의 서비스 상태

추가 문의사항이 있으면 개발팀에 연락하세요.
