from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine


class MongoDB:
    def __init__(self, url: str, db_name: str, records_db_name: str):
        self.client = None
        self.db = None
        self.engine = None
        self.records_engine = None
        self.url = url
        self.db_name = db_name
        self.records_db_name = records_db_name

    async def connect(self):
        self.client = AsyncIOMotorClient(self.url)
        self.db = self.client[self.db_name]
        self.engine = AIOEngine(client=self.client, database=self.db_name)
        self.records_engine = AIOEngine(
            client=self.client, database=self.records_db_name
        )

    async def close(self):
        self.client.close()
