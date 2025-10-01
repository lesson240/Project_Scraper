# path: app/models/pydantics/model_pydantic_user.py

from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class BasicInfo(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class BusinessInfo(BaseModel):
    business_name: str
    representative: str
    business_registration: str
    business_opening_date: str


class AdditionalInfo(BaseModel):
    phone: str
    referral_code: Optional[str] = None


class AgreementInfo(BaseModel):
    terms_agreement: bool
    privacy_agreement: bool
    marketing_agreement: bool = False


class StatusInfo(BaseModel):
    account_status: Literal["active", "inactive", "suspended"] = "active"
    plan_type: Literal["free", "paid", "manager", "admin"] = "free"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None


class SocialAccount(BaseModel):
    provider: str
    provider_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None
    connected_at: datetime = Field(default_factory=datetime.utcnow)


class AuthIdentity(BaseModel):
    login_type: Literal["email", "social"]
    primary_id: Optional[str] = None
    composite_id: Optional[str] = None
    account_hash: str


class SignupRequest(BaseModel):
    basic_info: BasicInfo
    business_info: BusinessInfo
    additional_info: AdditionalInfo
    agreement_info: AgreementInfo
    social_account: Optional[SocialAccount] = None
    auth_identity: AuthIdentity


class SignupResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None


