# path: app/models/odmantics/model_odmantic_user.py

from typing import Optional, List
from datetime import datetime
from odmantic import Model, Field


class SocialAccount(Model):
    provider: str
    provider_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None
    connected_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        collection = "social_accounts_embedded"  # not used as top-level


class User(Model):
    # grouped fields per design (snake_case)
    basic_info: dict
    business_info: dict
    additional_info: dict
    agreement_info: dict
    status_info: dict

    # single social account (optional)
    social_account: Optional[dict] = None

    # internal auth identity
    auth_identity: dict

    class Config:
        collection = "users"


