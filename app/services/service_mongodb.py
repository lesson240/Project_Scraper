# path: app/services/service_mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import (
    MONGO_DB_NAME,
    MONGO_DB_URL,
    MONGO_DB_NAME_RECORDS,
    MONGO_DB_NAME_USERS,
    MONGO_DB_NAME_IMAGES,
    MONGO_DB_NAME_EXTERNAL_API,
    MONGO_DB_NAME_SETTINGS,
)

# MongoDB 클라이언트 인스턴스
mongodb_client: AsyncIOMotorClient = None

# MongoDB 서비스의 인스턴스를 생성할 때 환경 변수와 비밀 정보를 사용합니다.
async def get_mongodb_client() -> AsyncIOMotorClient:
    """MongoDB 클라이언트 인스턴스를 반환합니다."""
    global mongodb_client
    if mongodb_client is None:
        mongodb_client = AsyncIOMotorClient(MONGO_DB_URL)
    return mongodb_client

# MongoDB 연결 초기화
async def initialize_mongodb():
    """MongoDB 연결을 초기화합니다."""
    try:
        global mongodb_client
        mongodb_client = AsyncIOMotorClient(MONGO_DB_URL)
        # 연결 테스트
        await mongodb_client.admin.command("ping")
        print(f"✅ MongoDB 연결 초기화 완료: {MONGO_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB 연결 초기화 실패: {str(e)}")
        return False

# MongoDB 연결 상태 확인 및 기본 데이터베이스 설정
async def ensure_mongodb_connection():
    """MongoDB 연결 상태를 확인하고 기본 데이터베이스를 설정합니다."""
    try:
        global mongodb_client
        # 연결이 초기화되지 않았다면 초기화
        if mongodb_client is None:
            await initialize_mongodb()
        
        # 연결 상태 확인
        await mongodb_client.admin.command("ping")
        print(f"✅ MongoDB 연결 성공: {MONGO_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB 연결 실패: {str(e)}")
        return False

# ODMantic 호환 엔진 클래스
class ODManticCompatibleEngine:
    """ODMantic과 호환되는 엔진 클래스"""
    
    def __init__(self, client: AsyncIOMotorClient, db_name: str):
        self.client = client
        self.db_name = db_name
    
    async def find(self, model, filters=None):
        """모델에 해당하는 컬렉션에서 데이터를 조회합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        # 모델의 컬렉션 이름을 가져옵니다
        collection_name = getattr(model, '__collection__', model.__name__.lower())
        collection = self.client[self.db_name][collection_name]
        
        if filters is None:
            filters = {}
        
        cursor = collection.find(filters)
        results = await cursor.to_list(length=None)
        
        # ODMantic 모델 인스턴스로 변환하여 반환
        # 기존 ODMantic 코드와의 호환성을 위해
        model_instances = []
        for doc in results:
            try:
                # _id 필드를 id로 변환 (ODMantic 호환성)
                if '_id' in doc:
                    doc['id'] = str(doc['_id'])
                    del doc['_id']
                
                # 모델 인스턴스 생성
                model_instance = model(**doc)
                model_instances.append(model_instance)
            except Exception as e:
                # 모델 변환 실패 시 원본 딕셔너리 반환
                model_instances.append(doc)
        
        return model_instances
    
    async def find_one(self, model, filters=None):
        """모델에 해당하는 컬렉션에서 단일 데이터를 조회합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        # 모델의 컬렉션 이름을 가져옵니다
        collection_name = getattr(model, '__collection__', model.__name__.lower())
        collection = self.client[self.db_name][collection_name]
        
        if filters is None:
            filters = {}
        
        result = await collection.find_one(filters)
        
        if result is None:
            return None
        
        # ODMantic 모델 인스턴스로 변환하여 반환
        try:
            # _id 필드를 id로 변환 (ODMantic 호환성)
            if '_id' in result:
                result['id'] = str(result['_id'])
                del result['_id']
            
            # 모델 인스턴스 생성
            model_instance = model(**result)
            return model_instance
        except Exception as e:
            # 모델 변환 실패 시 원본 딕셔너리 반환
            return result
    
    async def save(self, model_instance):
        """모델 인스턴스를 저장합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        # 모델의 컬렉션 이름을 가져옵니다
        model_class = type(model_instance)
        collection_name = getattr(model_class, '__collection__', model_class.__name__.lower())
        collection = self.client[self.db_name][collection_name]
        
        # 모델 인스턴스를 딕셔너리로 변환
        if hasattr(model_instance, 'dict'):
            data = model_instance.dict()
        elif hasattr(model_instance, '__dict__'):
            data = model_instance.__dict__
        else:
            data = model_instance
        
        # _id 필드 제거 (MongoDB가 자동 생성)
        if '_id' in data:
            del data['_id']
        
        result = await collection.insert_one(data)
        return result.inserted_id
    
    async def save_all(self, model_instances):
        """여러 모델 인스턴스를 일괄 저장합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        if not model_instances:
            return []
        
        # 첫 번째 인스턴스의 모델 클래스를 가져옵니다
        model_class = type(model_instances[0])
        collection_name = getattr(model_class, '__collection__', model_class.__name__.lower())
        collection = self.client[self.db_name][collection_name]
        
        # 모든 인스턴스를 딕셔너리로 변환
        documents = []
        for instance in model_instances:
            if hasattr(instance, 'dict'):
                data = instance.dict()
            elif hasattr(instance, '__dict__'):
                data = instance.__dict__
            else:
                data = instance
            
            # _id 필드 제거
            if '_id' in data:
                del data['_id']
            
            documents.append(data)
        
        result = await collection.insert_many(documents)
        return result.inserted_ids
    
    async def remove(self, model, filters):
        """모델에 해당하는 컬렉션에서 데이터를 삭제합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        # 모델의 컬렉션 이름을 가져옵니다
        collection_name = getattr(model, '__collection__', model.__name__.lower())
        collection = self.client[self.db_name][collection_name]
        
        result = await collection.delete_many(filters)
        return result.deleted_count
    
    def get_collection(self, model):
        """모델에 해당하는 컬렉션을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다.")
        
        # 모델의 컬렉션 이름을 가져옵니다
        collection_name = getattr(model, '__collection__', model.__name__.lower())
        return self.client[self.db_name][collection_name]

# MongoDB 서비스 객체 (기존 코드와의 호환성을 위해)
class MongoDBService:
    def __init__(self):
        self.client = None
    
    async def connect(self):
        """MongoDB에 연결합니다."""
        self.client = await get_mongodb_client()
    
    async def close(self):
        """MongoDB 연결을 종료합니다."""
        if self.client:
            self.client.close()
            self.client = None
            print("✅ MongoDB 연결 종료 완료")
    
    @property
    def db(self):
        """기본 데이터베이스를 반환합니다."""
        return self.client[MONGO_DB_NAME] if self.client else None
    
    @property
    def engine(self):
        """기본 데이터베이스 엔진을 반환합니다 (ODMantic 호환)."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME)
    
    @property
    def users_engine(self):
        """사용자 데이터베이스 엔진을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME_USERS)
    
    @property
    def records_engine(self):
        """레코드 데이터베이스 엔진을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME_RECORDS)
    
    @property
    def images_engine(self):
        """이미지 데이터베이스 엔진을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME_IMAGES)
    
    @property
    def external_api_engine(self):
        """외부 API 데이터베이스 엔진을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME_EXTERNAL_API)
    
    @property
    def settings_engine(self):
        """설정 데이터베이스 엔진을 반환합니다."""
        if not self.client:
            raise RuntimeError("MongoDB 클라이언트가 초기화되지 않았습니다. connect()를 먼저 호출하세요.")
        return ODManticCompatibleEngine(self.client, MONGO_DB_NAME_SETTINGS)

# 서비스 인스턴스
mongodb_service = MongoDBService()
