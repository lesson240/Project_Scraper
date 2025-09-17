# path: app/routers/auth_router.py

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import jwt
import bcrypt
from datetime import datetime, timedelta
import secrets
import hashlib
import logging

from app.models.model_user import User, SocialAccount
from app.services.service_auth import AuthService
from app.services.service_email import EmailService
from app.exceptions.auth_exceptions import (
    AuthenticationError,
    ValidationError,
    UserNotFoundError,
    InvalidCredentialsError
)

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()
logger = logging.getLogger(__name__)

# JWT 설정
SECRET_KEY = "your-secret-key"  # 실제 운영에서는 환경변수로 관리
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Pydantic 모델들
class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    phone: str
    birth_date: str
    gender: str
    terms_agreement: bool
    privacy_agreement: bool
    marketing_agreement: Optional[bool] = False

class SendVerificationCodeRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class SocialLoginRequest(BaseModel):
    code: str
    state: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    roles: list[str] = []
    permissions: list[str] = []
    social_accounts: list[Dict[str, Any]] = []

# 의존성 주입
def get_auth_service() -> AuthService:
    return AuthService()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token")
        # TODO: 실제 사용자 조회 로직 구현
        # user = get_user_by_id(user_id)
        # if user is None:
        #     raise UserNotFoundError("User not found")
        # return user
        return User()  # 임시 반환
    except jwt.PyJWTError:
        raise AuthenticationError("Invalid token")

# API 엔드포인트들
@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """사용자 로그인"""
    try:
        # 이메일로 사용자 조회
        user = await auth_service.get_user_by_email(request.email)
        if not user:
            raise InvalidCredentialsError("Invalid email or password")
        
        # 비밀번호 검증
        if not bcrypt.checkpw(request.password.encode('utf-8'), user.password.encode('utf-8')):
            raise InvalidCredentialsError("Invalid email or password")
        
        # JWT 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # 사용자 정보 반환
        user_data = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "profile_image": user.profile_image,
            "roles": user.roles,
            "permissions": user.permissions,
            "social_accounts": [social.dict() for social in user.social_accounts]
        }
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_data
        )
        
    except (InvalidCredentialsError, UserNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/signup", response_model=TokenResponse)
async def signup(
    request: SignupRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """사용자 회원가입"""
    try:
        # 비밀번호 확인
        if request.password != request.confirm_password:
            raise ValidationError("Passwords do not match")
        
        # 약관 동의 확인
        if not request.terms_agreement or not request.privacy_agreement:
            raise ValidationError("Terms and privacy agreement required")
        
        # 사용자 생성
        user = await auth_service.create_user(
            email=request.email,
            password=request.password,
            name=request.name,
            phone=request.phone,
            birth_date=request.birth_date,
            gender=request.gender,
            marketing_agreement=request.marketing_agreement
        )
        
        # JWT 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # 사용자 정보 반환
        user_data = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "profile_image": user.profile_image,
            "roles": user.roles,
            "permissions": user.permissions,
            "social_accounts": [social.dict() for social in user.social_accounts]
        }
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_data
        )
        
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """사용자 로그아웃"""
    # TODO: 토큰 블랙리스트에 추가하는 로직 구현
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Dict[str, str],
    auth_service: AuthService = Depends(get_auth_service)
):
    """토큰 갱신"""
    try:
        refresh_token = request.get("refresh_token")
        if not refresh_token:
            raise ValidationError("Refresh token required")
        
        # 리프레시 토큰 검증
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid refresh token")
        
        # 사용자 조회
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError("User not found")
        
        # 새로운 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "profile_image": user.profile_image,
                "roles": user.roles,
                "permissions": user.permissions,
                "social_accounts": [social.dict() for social in user.social_accounts]
            }
        )
        
    except (ValidationError, AuthenticationError, UserNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """사용자 프로필 조회"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        profile_image=current_user.profile_image,
        roles=current_user.roles,
        permissions=current_user.permissions,
        social_accounts=[social.dict() for social in current_user.social_accounts]
    )

# 사용자 관리 API (기존 user_inform.py에서 이동)
@router.get("/users/")
async def get_users():
    """모든 사용자 조회"""
    return {"message": "Get all users"}

@router.get("/users/{user_id}")
async def get_user(user_id: int):
    """특정 사용자 조회"""
    return {"message": f"Get user with ID {user_id}"}

@router.post("/users/")
async def create_user():
    """새 사용자 생성"""
    return {"message": "Create a new user"}

@router.put("/users/{user_id}")
async def update_user(user_id: int):
    """사용자 정보 수정"""
    return {"message": f"Update user with ID {user_id}"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """사용자 삭제"""
    return {"message": f"Delete user with ID {user_id}"}

@router.get("/social/{provider}/url")
async def get_social_auth_url(provider: str):
    """소셜 로그인 URL 생성"""
    # CSRF 방지를 위한 state 생성
    state = secrets.token_urlsafe(32)
    
    # 소셜 플랫폼별 URL 생성
    if provider == "naver":
        client_id = "your_naver_client_id"  # 환경변수로 관리
        redirect_uri = "http://localhost:3000/auth/naver/callback"
        url = f"https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&state={state}"
    elif provider == "google":
        client_id = "your_google_client_id"  # 환경변수로 관리
        redirect_uri = "http://localhost:3000/auth/google/callback"
        url = f"https://accounts.google.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid email profile&state={state}"
    elif provider == "kakao":
        client_id = "your_kakao_client_id"  # 환경변수로 관리
        redirect_uri = "http://localhost:3000/auth/kakao/callback"
        url = f"https://kauth.kakao.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&state={state}"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported provider")
    
    return {"url": url, "state": state}

@router.post("/social/{provider}/callback", response_model=TokenResponse)
async def social_login_callback(
    provider: str,
    request: SocialLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """소셜 로그인 콜백 처리"""
    try:
        # 소셜 플랫폼별 사용자 정보 조회
        user_info = await auth_service.get_social_user_info(provider, request.code)
        
        # 사용자 조회 또는 생성
        user = await auth_service.get_or_create_social_user(provider, user_info)
        
        # JWT 토큰 생성
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # 사용자 정보 반환
        user_data = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "profile_image": user.profile_image,
            "roles": user.roles,
            "permissions": user.permissions,
            "social_accounts": [social.dict() for social in user.social_accounts]
        }
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_data
        )
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/test")
def test_auth_router():
    """인증 라우터 테스트"""
    logger.info("인증 라우터 테스트 호출됨")
    print("🔍 DEBUG: 인증 라우터 테스트 호출됨")
    return {"message": "인증 라우터가 정상적으로 작동합니다."}

@router.post("/send-verification-code")
def send_verification_code(request: SendVerificationCodeRequest):
    """이메일 인증번호 발송"""
    try:
        logger.info(f"인증번호 발송 요청: {request.email}")
        print(f"🔍 DEBUG: 인증번호 발송 요청 받음 - {request.email}")
        
        # EmailService 인스턴스 생성
        email_service = EmailService()
        
        # 동기 함수 직접 호출
        success = email_service.send_verification_code(request.email)
        
        if success:
            return {"message": "인증번호가 발송되었습니다.", "success": True}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="인증번호 발송에 실패했습니다."
            )
            
    except Exception as e:
        logger.error(f"이메일 인증번호 발송 오류: {str(e)}")
        print(f"❌ DEBUG: 에러 발생 - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"인증번호 발송 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/verify-code")
def verify_code(request: VerifyCodeRequest):
    """이메일 인증번호 검증"""
    try:
        email_service = EmailService()
        
        # 동기 함수 직접 호출
        success = email_service.verify_code(request.email, request.code)
        
        if success:
            return {"message": "이메일 인증이 완료되었습니다.", "success": True}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="인증번호가 올바르지 않거나 만료되었습니다."
            )
            
    except Exception as e:
        logger.error(f"이메일 인증번호 검증 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="인증번호 검증 중 오류가 발생했습니다."
        )

# 유틸리티 함수들
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
