from odmantic import Model, Field
from typing import Optional
from datetime import datetime


class StoragePolicy(Model):
    name: str
    retention_days: int
    archive_days: int
    soft_delete: bool = True
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserPolicy(Model):
    user_id: str
    policy_id: str
    applied_at: datetime = Field(default_factory=datetime.utcnow)


class CleanupSchedule(Model):
    enabled: bool = False
    frequency: str = "daily"  # daily
    time_utc: str = "03:00"    # HH:MM (UTC)
    mode: str = "archive"      # archive | delete
    older_than_days: int = 90
    category: str = "thumbnail"
    policy_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


