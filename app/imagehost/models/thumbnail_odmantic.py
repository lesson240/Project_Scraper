from odmantic import Model, Field
from typing import List, Optional
from datetime import datetime


class ThumbnailMetadata(Model):
    origin_goods_code: str
    thumbnail_images: List[str]
    user_id: Optional[str] = None
    tags: List[str] = []
    category: str = "thumbnail"
    saved_at: datetime = Field(default_factory=datetime.utcnow)


