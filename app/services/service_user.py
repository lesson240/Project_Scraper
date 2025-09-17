# path: app/services/user_service.py

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import bcrypt
import logging

from app.config.database import get_database
from app.models.model_user import User, SocialAccount, UserCreate, UserUpdate
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
        """새 사용자 생성"""
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
        """이메일로 사용자 조회"""
        try:
            user_doc = await self.users_collection.find_one({"email": email})
            if user_doc:
                user_doc["id"] = str(user_doc["_id"])
                return User(**user_doc)
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
