# path: app/models/model_user.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class SocialAccount(BaseModel):
    """소셜 계정 정보"""
    provider: str  # 'naver', 'google', 'kakao'
    provider_id: str
    email: str
    name: str
    profile_image: Optional[str] = None
    connected_at: datetime

class User(BaseModel):
    """사용자 모델"""
    id: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None  # 소셜 로그인 사용자는 None
    name: str
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    
    # 소셜 로그인 연동 정보
    social_accounts: List[SocialAccount] = []
    
    # 계정 상태 관리
    status: str = "active"  # 'active', 'inactive', 'suspended'
    email_verified: bool = False
    phone_verified: bool = False
    
    # 마케팅 동의
    marketing_agreement: bool = False
    
    # 메타데이터
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    # 권한 관리
    roles: List[str] = ["user"]  # ['user', 'admin', 'moderator']
    permissions: List[str] = ["read", "write"]  # 세부 권한
    
    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class UserCreate(BaseModel):
    """사용자 생성 요청 모델"""
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    phone: str
    birth_date: str
    gender: str
    terms_agreement: bool
    privacy_agreement: bool
    marketing_agreement: bool = False

class UserUpdate(BaseModel):
    """사용자 정보 수정 요청 모델"""
    name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    marketing_agreement: Optional[bool] = None

class UserResponse(BaseModel):
    """사용자 응답 모델 (비밀번호 제외)"""
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    status: str
    email_verified: bool
    phone_verified: bool
    marketing_agreement: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    roles: List[str]
    permissions: List[str]
    social_accounts: List[SocialAccount]

class LoginRequest(BaseModel):
    """로그인 요청 모델"""
    email: str
    password: str
    remember_me: bool = False

class SocialLoginRequest(BaseModel):
    """소셜 로그인 요청 모델"""
    provider: str
    code: str
    state: str

class TokenResponse(BaseModel):
    """토큰 응답 모델"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class PasswordChangeRequest(BaseModel):
    """비밀번호 변경 요청 모델"""
    current_password: str
    new_password: str
    confirm_password: str

class EmailVerificationRequest(BaseModel):
    """이메일 인증 요청 모델"""
    email: str

class PhoneVerificationRequest(BaseModel):
    """전화번호 인증 요청 모델"""
    phone: str
    verification_code: str
