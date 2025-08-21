from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine


class MongoDB:
    def __init__(
        self, 
        url: str, 
        db_name: str, 
        records_db_name: str, 
        users_db_name: str,
        images_db_name: str = None,
        exchange_rates_db_name: str = None,
        external_api_db_name: str = None
    ):
        self.client = None
        self.db = None
        self.engine = None
        self.records_engine = None
        self.users_engine = None
        self.images_engine = None
        self.exchange_rates_engine = None
        self.external_api_engine = None
        self.url = url
        self.db_name = db_name
        self.records_db_name = records_db_name
        self.users_db_name = users_db_name
        self.images_db_name = images_db_name
        self.exchange_rates_db_name = exchange_rates_db_name
        self.external_api_db_name = external_api_db_name

    async def connect(self):
        self.client = AsyncIOMotorClient(self.url)
        self.db = self.client[self.db_name]
        self.engine = AIOEngine(client=self.client, database=self.db_name)
        self.records_engine = AIOEngine(
            client=self.client, database=self.records_db_name
        )
        self.users_engine = AIOEngine(client=self.client, database=self.users_db_name)
        
        # 새로운 컬렉션 엔진들 초기화
        if self.images_db_name:
            self.images_engine = AIOEngine(
                client=self.client, database=self.images_db_name
            )
        if self.exchange_rates_db_name:
            self.exchange_rates_engine = AIOEngine(
                client=self.client, database=self.exchange_rates_db_name
            )
        if self.external_api_db_name:
            self.external_api_engine = AIOEngine(
                client=self.client, database=self.external_api_db_name
            )

    async def close(self):
        if self.client:
            self.client.close()
