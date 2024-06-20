from odmantic import Model
from datetime import datetime
from typing import List, Optional


class CollectionRecordsModel(Model):
    goodsCodes: List[str]
    brandCode: str
    brandName: str
    status: str
    request_count: int
    success_count: int
    start_date: str
    end_date: Optional[str] = None  # Optional 필드로 설정하고 기본값을 None으로 설정

    model_config = {"collection": "CollectionRecords"}
