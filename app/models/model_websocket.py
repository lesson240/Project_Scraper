from odmantic import Model
from datetime import datetime


class SessionDataModel(Model):
    user_id: str
    site_name: str
    cookies: list
    local_storage: dict
    last_updated: datetime

    model_config = {"collection": "SessionData"}


class ChromePathModel(Model):
    user_id: str
    path: str

    model_config = {"collection": "ChromePath"}


class ChromeExPathModel(Model):
    user_id: str
    extension_id: str
    path: str

    model_config = {"collection": "ChromeExPath"}


class ChromeProfilePathModel(Model):
    user_id: str
    profile_path: str

    model_config = {"collection": "ChromeProfilePath"}
