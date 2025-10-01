# path: app/services/user_service.py

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import bcrypt
import logging
import hashlib

from app.config.database import get_database
from app.models.model_user import User, SocialAccount, UserCreate, UserUpdate
from app.models.pydantics.model_pydantic_user import SignupRequest, SignupResponse
from app.exceptions.auth_exceptions import (
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
    ValidationError
)

logger = logging.getLogger(__name__)

class UserService:
    """사용자 관련 비즈니스 로직 서비스"""
    
    def __init__(self):
        self.db = get_database()
        self.users_collection = self.db.users
    
    async def create_user(self, user_data: UserCreate) -> User:
        """새 사용자 생성 (기존 방식 - 레거시)"""
        try:
            # 이메일 중복 확인
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                raise UserAlreadyExistsError("Email already exists")
            
            # 비밀번호 해시화
            hashed_password = bcrypt.hashpw(
                user_data.password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
            # 사용자 데이터 생성
            user_dict = {
                "email": user_data.email,
                "password": hashed_password,
                "name": user_data.name,
                "phone": user_data.phone,
                "birth_date": user_data.birth_date,
                "gender": user_data.gender,
                "status": "active",
                "email_verified": False,
                "phone_verified": False,
                "marketing_agreement": user_data.marketing_agreement,
                "roles": ["user"],
                "permissions": ["read", "write"],
                "social_accounts": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_login_at": None
            }
            
            # 데이터베이스에 저장
            result = await self.users_collection.insert_one(user_dict)
            user_dict["_id"] = result.inserted_id
            user_dict["id"] = str(result.inserted_id)
            
            logger.info(f"User created successfully: {user_data.email}")
            return User(**user_dict)
            
        except UserAlreadyExistsError:
            raise
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise ValidationError("Failed to create user")

    async def create_user_from_signup(self, signup_data: SignupRequest) -> SignupResponse:
        """새 사용자 생성 (그룹화 스키마 방식)"""
        try:
            # 사업자등록번호 중복 확인은 인증 단계에서 수행되므로 가입 단계에서는 생략
            normalized_brn = ''.join(ch for ch in signup_data.business_info.business_registration if ch.isdigit())
            
            # 이메일 중복 확인 (직접 가입인 경우)
            if signup_data.basic_info.email:
                existing_email = await self.users_collection.find_one({
                    "basic_info.email": signup_data.basic_info.email
                })
                if existing_email:
                    raise UserAlreadyExistsError("Email already exists")
            
            # 소셜 계정 중복 확인 (소셜 가입인 경우)
            if signup_data.social_account:
                existing_social = await self.users_collection.find_one({
                    "social_account.provider": signup_data.social_account.provider,
                    "social_account.provider_id": signup_data.social_account.provider_id
                })
                if existing_social:
                    raise UserAlreadyExistsError("Social account already exists")
            
            # 비밀번호 해시화 (직접 가입인 경우)
            hashed_password = None
            if signup_data.basic_info.password:
                hashed_password = bcrypt.hashpw(
                    signup_data.basic_info.password.encode('utf-8'), 
                    bcrypt.gensalt()
                ).decode('utf-8')
            
            # 계정 해시 생성
            primary_id = signup_data.basic_info.email or f"{signup_data.social_account.provider}:{signup_data.social_account.provider_id}"
            account_hash = hashlib.sha256(primary_id.encode('utf-8')).hexdigest()
            
            # 사용자 데이터 생성 (그룹화 스키마)
            now = datetime.utcnow()
            user_dict = {
                "basic_info": {
                    "email": signup_data.basic_info.email,
                    "password": hashed_password
                },
                "business_info": {
                    "business_name": signup_data.business_info.business_name,
                    "representative": signup_data.business_info.representative,
                    "business_registration": normalized_brn,
                    "business_opening_date": signup_data.business_info.business_opening_date
                },
                "additional_info": {
                    "phone": signup_data.additional_info.phone,
                    "referral_code": signup_data.additional_info.referral_code
                },
                "agreement_info": {
                    "terms_agreement": signup_data.agreement_info.terms_agreement,
                    "privacy_agreement": signup_data.agreement_info.privacy_agreement,
                    "marketing_agreement": signup_data.agreement_info.marketing_agreement
                },
                "status_info": {
                    "account_status": "active",
                    "plan_type": "free",
                    "created_at": now,
                    "updated_at": now,
                    "last_login_at": None
                },
                "social_account": signup_data.social_account.dict() if signup_data.social_account else None,
                "auth_identity": {
                    "login_type": signup_data.auth_identity.login_type,
                    "primary_id": primary_id,
                    "composite_id": f"{signup_data.business_info.business_registration}:{primary_id}",
                    "account_hash": account_hash
                }
            }
            
            # 데이터베이스에 저장
            result = await self.users_collection.insert_one(user_dict)
            user_id = str(result.inserted_id)
            
            logger.info(f"User created successfully: {primary_id}")
            return SignupResponse(
                success=True,
                message="User created successfully",
                user_id=user_id
            )
            
        except UserAlreadyExistsError:
            raise
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise ValidationError("Failed to create user")
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """ID로 사용자 조회"""
        try:
            user_doc = await self.users_collection.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                user_doc["id"] = str(user_doc["_id"])
                return User(**user_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get user by ID: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회 (그룹 스키마 대응)

        그룹화된 도큐먼트 구조:
          - basic_info.email
          - basic_info.password
          - status_info.*
        를 레거시 `User` 모델에 맞춰 납작(flat)하게 매핑하여 반환한다.
        """
        try:
            # 1) 신규 그룹 스키마 조회
            user_doc = await self.users_collection.find_one({"basic_info.email": email})
            if user_doc:
                now = datetime.utcnow()
                basic = (user_doc.get("basic_info") or {})
                addi = (user_doc.get("additional_info") or {})
                biz = (user_doc.get("business_info") or {})
                status = (user_doc.get("status_info") or {})

                transformed: Dict[str, Any] = {
                    "id": str(user_doc.get("_id")),
                    "_id": user_doc.get("_id"),
                    "email": basic.get("email"),
                    "password": basic.get("password"),
                    "name": addi.get("name") or biz.get("representative") or (basic.get("email") or "User"),
                    "phone": addi.get("phone"),
                    "birth_date": None,
                    "gender": None,
                    "marketing_agreement": (user_doc.get("agreement_info") or {}).get("marketing_agreement", False),
                    "roles": ["user"],
                    "permissions": ["read", "write"],
                    "social_accounts": user_doc.get("social_accounts") or [],
                    "created_at": status.get("created_at") or now,
                    "updated_at": status.get("updated_at") or now,
                    "last_login_at": status.get("last_login_at"),
                    "profile_image": None,
                    "status": status.get("account_status", "active"),
                }
                return User(**transformed)

            # 2) 레거시 납작 스키마 조회 (기존 데이터 호환)
            legacy_doc = await self.users_collection.find_one({"email": email})
            if legacy_doc:
                legacy_doc["id"] = str(legacy_doc.get("_id"))
                return User(**legacy_doc)

            return None
        except Exception as e:
            logger.error(f"Failed to get user by email: {e}")
            return None
    
    async def get_user_by_social_account(self, provider: str, provider_id: str) -> Optional[User]:
        """소셜 계정으로 사용자 조회"""
        try:
            user_doc = await self.users_collection.find_one({
                "social_accounts.provider": provider,
                "social_accounts.provider_id": provider_id
            })
            if user_doc:
                user_doc["id"] = str(user_doc["_id"])
                return User(**user_doc)
            return None
        except Exception as e:
            logger.error(f"Failed to get user by social account: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: UserUpdate) -> Optional[User]:
        """사용자 정보 수정"""
        try:
            update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                return await self.get_user_by_id(user_id)
            return None
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            return None
    
    async def delete_user(self, user_id: str) -> bool:
        """사용자 삭제 (소프트 삭제)"""
        try:
            result = await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"status": "deleted", "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to delete user: {e}")
            return False
    
    async def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """비밀번호 검증"""
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            logger.error(f"Failed to verify password: {e}")
            return False
    
    async def update_last_login(self, user_id: str) -> bool:
        """마지막 로그인 시간 업데이트"""
        try:
            result = await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update last login: {e}")
            return False
    
    async def add_social_account(self, user_id: str, social_account: SocialAccount) -> bool:
        """소셜 계정 추가"""
        try:
            result = await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {"social_accounts": social_account.dict()},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to add social account: {e}")
            return False
    
    async def get_users(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[User]:
        """사용자 목록 조회"""
        try:
            query = {}
            if status:
                query["status"] = status
            
            cursor = self.users_collection.find(query).skip(skip).limit(limit)
            users = []
            
            async for user_doc in cursor:
                user_doc["id"] = str(user_doc["_id"])
                users.append(User(**user_doc))
            
            return users
        except Exception as e:
            logger.error(f"Failed to get users: {e}")
            return []
    
    async def get_user_count(self, status: Optional[str] = None) -> int:
        """사용자 수 조회"""
        try:
            query = {}
            if status:
                query["status"] = status
            
            return await self.users_collection.count_documents(query)
        except Exception as e:
            logger.error(f"Failed to get user count: {e}")
            return 0
    
    async def search_users(self, search_term: str, skip: int = 0, limit: int = 100) -> List[User]:
        """사용자 검색"""
        try:
            query = {
                "$or": [
                    {"name": {"$regex": search_term, "$options": "i"}},
                    {"email": {"$regex": search_term, "$options": "i"}},
                    {"phone": {"$regex": search_term, "$options": "i"}}
                ]
            }
            
            cursor = self.users_collection.find(query).skip(skip).limit(limit)
            users = []
            
            async for user_doc in cursor:
                user_doc["id"] = str(user_doc["_id"])
                users.append(User(**user_doc))
            
            return users
        except Exception as e:
            logger.error(f"Failed to search users: {e}")
            return []
    
    async def update_user_status(self, user_id: str, status: str) -> bool:
        """사용자 상태 업데이트"""
        try:
            valid_statuses = ["active", "inactive", "suspended", "deleted"]
            if status not in valid_statuses:
                raise ValidationError(f"Invalid status: {status}")
            
            result = await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update user status: {e}")
            return False
