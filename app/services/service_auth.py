# path: app/services/auth_service.py

from typing import Optional, Dict, Any
import bcrypt
from datetime import datetime
import httpx
import asyncio

from app.models.model_user import User, SocialAccount
from app.exceptions.auth_exceptions import (
    UserNotFoundError,
    ValidationError,
    AuthenticationError
)
from app.services.user_service import UserService

class AuthService:
    """인증 관련 비즈니스 로직 서비스"""
    
    def __init__(self, user_service: Optional[UserService] = None):
        # UserService 주입 (테스트 용이성 및 결합도 감소)
        self.user_service = user_service or UserService()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return await self.user_service.get_user_by_email(email)
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """ID로 사용자 조회"""
        return await self.user_service.get_user_by_id(user_id)
    
    async def create_user(
        self,
        email: str,
        password: str,
        name: str,
        phone: str,
        birth_date: str,
        gender: str,
        marketing_agreement: bool = False
    ) -> User:
        """새 사용자 생성"""
        # 비밀번호 해시화
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 임시 사용자 객체 생성 (실제 저장은 UserService의 그룹 스키마를 사용할 것을 권장)
        user = User(
            email=email,
            password=hashed_password,
            name=name,
            phone=phone,
            birth_date=birth_date,
            gender=gender,
            marketing_agreement=marketing_agreement,
            roles=["user"],
            permissions=["read", "write"],
            social_accounts=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        return user
    
    async def get_social_user_info(self, provider: str, code: str) -> Dict[str, Any]:
        """소셜 플랫폼에서 사용자 정보 조회"""
        if provider == "naver":
            return await self._get_naver_user_info(code)
        elif provider == "google":
            return await self._get_google_user_info(code)
        elif provider == "kakao":
            return await self._get_kakao_user_info(code)
        else:
            raise ValidationError(f"Unsupported provider: {provider}")
    
    async def _get_naver_user_info(self, code: str) -> Dict[str, Any]:
        """네이버 사용자 정보 조회"""
        return {
            "id": "naver_123456",
            "email": "user@naver.com",
            "name": "네이버 사용자",
            "profile_image": "https://example.com/profile.jpg"
        }
    
    async def _get_google_user_info(self, code: str) -> Dict[str, Any]:
        """구글 사용자 정보 조회"""
        return {
            "id": "google_123456",
            "email": "user@gmail.com",
            "name": "구글 사용자",
            "profile_image": "https://example.com/profile.jpg"
        }
    
    async def _get_kakao_user_info(self, code: str) -> Dict[str, Any]:
        """카카오 사용자 정보 조회"""
        return {
            "id": "kakao_123456",
            "email": "user@kakao.com",
            "name": "카카오 사용자",
            "profile_image": "https://example.com/profile.jpg"
        }
    
    async def get_or_create_social_user(self, provider: str, user_info: Dict[str, Any]) -> User:
        """소셜 사용자 조회 또는 생성"""
        social_account = SocialAccount(
            provider=provider,
            provider_id=user_info["id"],
            email=user_info["email"],
            name=user_info["name"],
            profile_image=user_info.get("profile_image"),
            connected_at=datetime.utcnow()
        )
        
        user = User(
            email=user_info["email"],
            password=None,
            name=user_info["name"],
            phone=None,
            birth_date=None,
            gender=None,
            marketing_agreement=False,
            roles=["user"],
            permissions=["read", "write"],
            social_accounts=[social_account],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        return user
    
    async def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """비밀번호 검증"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    async def hash_password(self, password: str) -> str:
        """비밀번호 해시화"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    async def update_user_last_login(self, user_id: str) -> None:
        """사용자 마지막 로그인 시간 업데이트"""
        # 필요 시 UserService.update_last_login 위임
        await self.user_service.update_last_login(user_id)
    
    async def deactivate_user(self, user_id: str) -> None:
        """사용자 계정 비활성화"""
        await self.user_service.update_user_status(user_id, "inactive")
    
    async def activate_user(self, user_id: str) -> None:
        """사용자 계정 활성화"""
        await self.user_service.update_user_status(user_id, "active")
