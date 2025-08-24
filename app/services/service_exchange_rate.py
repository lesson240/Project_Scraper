# path: app/services/service_exchange_rate.py
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service
from app.services.koreaexim_service import koreaexim_service
from app.services.service_customs import customs_service

class ExchangeRateService:
    """환율 관련 공통 서비스 로직"""
    
    @staticmethod
    async def ensure_external_api_collection_exists(db: AsyncIOMotorClient):
        """external_api 컬렉션이 존재하는지 확인하고, 없으면 생성하고 실제 API 데이터 삽입"""
        try:
            # external_api 컬렉션이 존재하는지 확인
            collection_names = await db.list_collection_names()
            
            if "external_api" not in collection_names:
                print("external_api 컬렉션이 존재하지 않습니다. 새로 생성합니다.")
                
                # 컬렉션 생성
                collection = db.external_api
                
                # 실제 API 호출을 통해 데이터 수집
                print("관세청 API에서 환율 정보를 가져오는 중...")
                customs_rates = await customs_service.get_all_major_currencies()
                
                print("한국수출입은행 API에서 환율 정보를 가져오는 중...")
                koreaexim_rates = await koreaexim_service.get_all_major_currencies()
                
                # 수집된 데이터를 통화별로 정리
                all_rates = []
                
                # 관세청 데이터 추가
                for rate in customs_rates:
                    if rate.get("appliedRate", 0) > 0:
                        all_rates.append(rate)
                        print(f"관세청 {rate['currencyCode']}: {rate['appliedRate']}")
                
                # 한국수출입은행 데이터 추가 (tts 값 우선 사용)
                for rate in koreaexim_rates:
                    if rate.get("appliedRate", 0) > 0:
                        all_rates.append(rate)
                        rate_source = rate.get("rateSource", "unknown")
                        print(f"한국수출입은행 {rate['currencyCode']}: {rate['appliedRate']} (소스: {rate_source})")
                    else:
                        print(f"⚠️ 한국수출입은행 {rate['currencyCode']}: 환율 데이터 없음 (tts/ttb 값 누락)")
                
                if all_rates:
                    # 초기 데이터 삽입
                    result = await collection.insert_many(all_rates)
                    print(f"외부 API 환율 데이터 {len(result.inserted_ids)}개가 생성되었습니다.")
                else:
                    print("⚠️ 외부 API에서 환율 데이터를 가져올 수 없습니다.")
                    # 더미 데이터로 대체
                    fallback_data = [
                        {
                            "currencyCode": "USD",
                            "appliedRate": 1350.0,
                            "source": "manual",
                            "rateType": "weekly",
                            "baseDate": datetime.now().strftime("%Y%m%d"),
                            "isActive": True,
                            "createdAt": datetime.utcnow(),
                            "updatedAt": datetime.utcnow(),
                            "note": "외부 API 실패로 인한 더미 데이터"
                        },
                        {
                            "currencyCode": "JPY",
                            "appliedRate": 135.5,
                            "source": "manual",
                            "rateType": "weekly",
                            "baseDate": datetime.now().strftime("%Y%m%d"),
                            "isActive": True,
                            "createdAt": datetime.utcnow(),
                            "updatedAt": datetime.utcnow(),
                            "note": "외부 API 실패로 인한 더미 데이터"
                        }
                    ]
                    result = await collection.insert_many(fallback_data)
                    print(f"더미 환율 데이터 {len(result.inserted_ids)}개가 생성되었습니다.")
                
            else:
                print("external_api 컬렉션이 이미 존재합니다.")
                
                # 컬렉션에 데이터가 있는지 확인
                collection = db.external_api
                count = await collection.count_documents({})
                
                if count == 0:
                    print("external_api 컬렉션에 데이터가 없습니다. 실제 API 데이터를 수집합니다.")
                    
                    # 실제 API 호출을 통해 데이터 수집
                    print("관세청 API에서 환율 정보를 가져오는 중...")
                    customs_rates = await customs_service.get_all_major_currencies()
                    
                    print("한국수출입은행 API에서 환율 정보를 가져오는 중...")
                    koreaexim_rates = await koreaexim_service.get_all_major_currencies()
                    
                    # 수집된 데이터를 통화별로 정리
                    all_rates = []
                    
                    # 관세청 데이터 추가
                    for rate in customs_rates:
                        if rate.get("appliedRate", 0) > 0:
                            all_rates.append(rate)
                            print(f"관세청 {rate['currencyCode']}: {rate['appliedRate']}")
                    
                    # 한국수출입은행 데이터 추가 (tts 값 우선 사용)
                    for rate in koreaexim_rates:
                        if rate.get("appliedRate", 0) > 0:
                            all_rates.append(rate)
                            rate_source = rate.get("rateSource", "unknown")
                            print(f"한국수출입은행 {rate['currencyCode']}: {rate['appliedRate']} (소스: {rate_source})")
                        else:
                            print(f"⚠️ 한국수출입은행 {rate['currencyCode']}: 환율 데이터 없음 (tts/ttb 값 누락)")
                    
                    if all_rates:
                        # 데이터 삽입
                        result = await collection.insert_many(all_rates)
                        print(f"외부 API 환율 데이터 {len(result.inserted_ids)}개가 추가되었습니다.")
                    else:
                        print("⚠️ 외부 API에서 환율 데이터를 가져올 수 없습니다.")
                
        except Exception as e:
            print(f"외부 API 컬렉션 초기화 중 오류 발생: {str(e)}")
            raise e

    @staticmethod
    async def ensure_collection_exists(db: AsyncIOMotorClient):
        """exchange_rates 컬렉션이 존재하는지 확인하고, 없으면 생성하고 초기 데이터 삽입"""
        try:
            # 컬렉션이 존재하는지 확인
            collection_names = await db.list_collection_names()
            
            if "exchange_rates" not in collection_names:
                print("exchange_rates 컬렉션이 존재하지 않습니다. 새로 생성합니다.")
                
                # 컬렉션 생성 (MongoDB는 컬렉션을 자동으로 생성하지만, 명시적으로 생성)
                collection = db.exchange_rates
                
                # 기본 더미 데이터 생성
                today = datetime.now().strftime("%Y%m%d")
                initial_data = [
                    {
                        "currencyCode": "USD",
                        "appliedRate": 1350.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": today,
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "JPY",
                        "appliedRate": 135.5,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": today,
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "EUR",
                        "appliedRate": 1480.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": today,
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "CNY",
                        "appliedRate": 185.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": today,
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    }
                ]
                
                # 초기 데이터 삽입
                result = await collection.insert_many(initial_data)
                print(f"초기 환율 데이터 {len(result.inserted_ids)}개가 생성되었습니다.")
                
            else:
                print("exchange_rates 컬렉션이 이미 존재합니다.")
                
        except Exception as e:
            print(f"컬렉션 초기화 중 오류 발생: {str(e)}")
            raise e

    @staticmethod
    async def get_external_api_data():
        """외부 API 데이터 조회"""
        try:
            client = mongodb_service.client
            external_api_db = client["external_api"]
            
            # 활성 데이터 조회
            koreaexim_data = await external_api_db.koreaexim.find({"isActive": True}).to_list(length=100)
            customs_data = await external_api_db.customs.find({"isActive": True}).to_list(length=100)
            
            return koreaexim_data, customs_data
        except Exception as e:
            print(f"외부 API 데이터 조회 중 오류: {str(e)}")
            raise e

# 서비스 인스턴스 생성
exchange_rate_service = ExchangeRateService()
