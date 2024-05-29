from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from app.config import MONGO_DB_NAME, MONGO_DB_URL


class MongoDB:
    def __init__(self, url: str, db_name: str):
        self.client = None
        self.db = None
        self.engine = None
        self.url = url
        self.db_name = db_name

    async def connect(self):
        self.client = AsyncIOMotorClient(self.url)
        self.db = self.client[self.db_name]
        self.engine = AIOEngine(client=self.client, database=self.db_name)

    async def close(self):
        self.client.close()
