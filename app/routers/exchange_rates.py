# path: app/routers/exchange_rates.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service
from app.services.koreaexim_service import koreaexim_service
from app.services.customs_service import customs_service
from app.config.mongodb import MONGO_DB_NAME_EXTERNAL_API

router = APIRouter(prefix="/api/exchange-rates", tags=["ExchangeRates"])

# Pydantic 모델
class ExchangeRateStorage(BaseModel):
    currencyCode: str
    appliedRate: float
    source: str  # 'customs' | 'koreaexim' | 'manual'
    rateType: str  # 'weekly' | 'daily'
    baseDate: str  # YYYYMMDD 형식
    isActive: bool = True

class ExchangeRateResponse(BaseModel):
    success: bool
    data: Optional[List[ExchangeRateStorage]] = None
    message: str

# 데이터베이스 의존성
async def get_db() -> AsyncIOMotorClient:
    return mongodb_service.client

# 외부 API 컬렉션 초기화 및 실제 데이터 수집
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

# 컬렉션 초기화 및 테스트 데이터 생성
async def ensure_collection_exists(db: AsyncIOMotorClient):
    """exchange_rates 컬렉션이 존재하는지 확인하고, 없으면 생성하고 초기 데이터 삽입"""
    try:
        # 외부 API 컬렉션 먼저 확인 및 초기화
        await ensure_external_api_collection_exists(db)
        
        # 컬렉션이 존재하는지 확인
        collection_names = await db.list_collection_names()
        
        if "exchange_rates" not in collection_names:
            print("exchange_rates 컬렉션이 존재하지 않습니다. 새로 생성합니다.")
            
            # 컬렉션 생성 (MongoDB는 컬렉션을 자동으로 생성하지만, 명시적으로 생성)
            collection = db.exchange_rates
            
            # 외부 API 컬렉션에서 실제 데이터를 가져와서 초기 데이터 생성
            external_collection = db.external_api
            external_rates = await external_collection.find({"isActive": True}).to_list(length=100)
            
            if external_rates:
                # 외부 API 데이터를 기반으로 초기 데이터 생성
                initial_data = []
                
                # 통화별로 최신 데이터 선택
                currency_data = {}
                for rate in external_rates:
                    currency = rate.get("currencyCode")
                    if currency and currency not in currency_data:
                        currency_data[currency] = rate
                
                for currency, rate_data in currency_data.items():
                    initial_data.append({
                        "currencyCode": currency,
                        "appliedRate": rate_data.get("appliedRate", 0.0),
                        "source": rate_data.get("source", "external"),
                        "rateType": rate_data.get("rateType", "weekly"),
                        "baseDate": rate_data.get("baseDate", datetime.now().strftime("%Y%m%d")),
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow(),
                        "externalSource": True
                    })
                
                print(f"외부 API 데이터 기반으로 {len(initial_data)}개 통화의 초기 데이터를 생성합니다.")
            else:
                # 외부 API 데이터가 없으면 기본 더미 데이터 생성
                initial_data = [
                    {
                        "currencyCode": "USD",
                        "appliedRate": 1350.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": datetime.now().strftime("%Y%m%d"),
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "JPY",
                        "appliedRate": 135.5,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": datetime.now().strftime("%Y%m%d"),
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "EUR",
                        "appliedRate": 1480.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": datetime.now().strftime("%Y%m%d"),
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    {
                        "currencyCode": "CNY",
                        "appliedRate": 185.0,
                        "source": "manual",
                        "rateType": "weekly",
                        "baseDate": datetime.now().strftime("%Y%m%d"),
                        "isActive": True,
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    }
                ]
                print("외부 API 데이터가 없어 기본 더미 데이터를 생성합니다.")
            
            # 초기 데이터 삽입
            result = await collection.insert_many(initial_data)
            print(f"초기 환율 데이터 {len(result.inserted_ids)}개가 생성되었습니다.")
            
        else:
            print("exchange_rates 컬렉션이 이미 존재합니다.")
            
    except Exception as e:
        print(f"컬렉션 초기화 중 오류 발생: {str(e)}")
        raise e

# 프록시 엔드포인트들은 제거됨 (백엔드 서비스로 대체)

@router.get("/latest")
async def get_latest_exchange_rates(
    rateType: Optional[str] = None,
    db: AsyncIOMotorClient = Depends(get_db)
) -> ExchangeRateResponse:
    """최신 환율 정보 조회"""
    try:
        # 컬렉션 존재 확인 및 초기화
        await ensure_collection_exists(db)
        
        collection = db.exchange_rates
        
        # 필터 조건 구성
        filter_query = {"isActive": True}
        if rateType:
            filter_query["rateType"] = rateType
        
        # 최신 데이터 조회 (baseDate 기준 내림차순)
        cursor = collection.find(filter_query).sort("baseDate", -1)
        rates = await cursor.to_list(length=100)
        
        return ExchangeRateResponse(
            success=True,
            data=[ExchangeRateStorage(**rate) for rate in rates],
            message="최신 환율 정보를 성공적으로 조회했습니다."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"환율 정보 조회 실패: {str(e)}")

@router.post("/bulk")
async def save_exchange_rates(
    exchangeRates: List[ExchangeRateStorage],
    db: AsyncIOMotorClient = Depends(get_db)
) -> ExchangeRateResponse:
    """환율 정보 일괄 저장"""
    try:
        # 컬렉션 존재 확인 및 초기화
        await ensure_collection_exists(db)
        
        collection = db.exchange_rates
        
        # 기존 데이터 비활성화
        for rate in exchangeRates:
            await collection.update_many(
                {
                    "currencyCode": rate.currencyCode,
                    "rateType": rate.rateType,
                    "isActive": True
                },
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
        
        # 새 데이터 저장
        rate_docs = []
        for rate in exchangeRates:
            rate_dict = rate.dict()
            rate_dict["createdAt"] = datetime.utcnow()
            rate_dict["updatedAt"] = datetime.utcnow()
            rate_docs.append(rate_dict)
            
        result = await collection.insert_many(rate_docs)
        
        return ExchangeRateResponse(
            success=True,
            message=f"{len(result.inserted_ids)}개의 환율 정보가 성공적으로 저장되었습니다."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"환율 정보 저장 실패: {str(e)}")

@router.get("/{currency_code}")
async def get_exchange_rate_by_currency(
    currency_code: str,
    db: AsyncIOMotorClient = Depends(get_db)
) -> ExchangeRateResponse:
    """특정 통화의 환율 정보 조회"""
    try:
        # 컬렉션 존재 확인 및 초기화
        await ensure_collection_exists(db)
        
        collection = db.exchange_rates
        
        # 디버깅을 위한 로그 추가
        print(f"조회 요청된 통화: {currency_code}")
        print(f"데이터베이스 연결 상태: {db is not None}")
        print(f"컬렉션 객체: {collection}")
        
        rate = await collection.find_one({
            "currencyCode": currency_code,
            "isActive": True
        })
        
        print(f"조회 결과: {rate}")
        
        if not rate:
            raise HTTPException(status_code=404, detail=f"{currency_code} 통화의 환율 정보를 찾을 수 없습니다.")
        
        return ExchangeRateResponse(
            success=True,
            data=[ExchangeRateStorage(**rate)],
            message=f"{currency_code} 통화의 환율 정보를 성공적으로 조회했습니다."
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"환율 정보 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"환율 정보 조회 실패: {str(e)}")

@router.put("/{currency_code}")
async def update_exchange_rate(
    currency_code: str,
    update_data: dict,
    db: AsyncIOMotorClient = Depends(get_db)
) -> ExchangeRateResponse:
    """환율 정보 업데이트"""
    try:
        # 컬렉션 존재 확인 및 초기화
        await ensure_collection_exists(db)
        
        collection = db.exchange_rates
        
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await collection.update_one(
            {"currencyCode": currency_code, "isActive": True},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"{currency_code} 통화의 활성 환율 정보를 찾을 수 없습니다.")
        
        return ExchangeRateResponse(
            success=True,
            message=f"{currency_code} 통화의 환율 정보가 성공적으로 업데이트되었습니다."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"환율 정보 업데이트 실패: {str(e)}")

@router.get("/")
async def get_all_exchange_rates(
    db: AsyncIOMotorClient = Depends(get_db)
) -> ExchangeRateResponse:
    """모든 환율 정보 조회"""
    try:
        # 컬렉션 존재 확인 및 초기화
        await ensure_collection_exists(db)
        
        collection = db.exchange_rates
        
        cursor = collection.find({"isActive": True})
        rates = await cursor.to_list(length=1000)
        
        return ExchangeRateResponse(
            success=True,
            data=[ExchangeRateStorage(**rate) for rate in rates],
            message="모든 환율 정보를 성공적으로 조회했습니다."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"환율 정보 조회 실패: {str(e)}")

# 데이터베이스 연결 테스트 엔드포인트 추가
@router.get("/test/connection")
async def test_mongodb_connection():
    """MongoDB 연결 상태와 컬렉션 존재 여부를 테스트합니다."""
    try:
        # MongoDB 연결 확인 및 초기화
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        # mongodb_service.db를 직접 사용 (이미 초기화됨)
        database = mongodb_service.db
        
        # external_api를 별도 데이터베이스로 접근
        client = mongodb_service.client
        external_api_db = client["external_api"]
        
        # MongoDB 연결 상태 확인
        await database.command('ping')
        print(f"✅ MongoDB 연결 성공: {mongodb_service.db_name}")
        
        # external_api 데이터베이스 연결 확인
        await external_api_db.command('ping')
        print(f"✅ external_api 데이터베이스 연결 성공")
        
        # 컬렉션 존재 여부 확인 (더 안전한 방법)
        collections_info = {}
        
        # external_api 데이터베이스의 koreaexim 컬렉션 확인
        try:
            test_doc = {"_id": "test", "temp": True}
            await external_api_db.koreaexim.insert_one(test_doc)
            await external_api_db.koreaexim.delete_one({"_id": "test"})
            collections_info["external_api.koreaexim"] = "존재함"
            print("✅ external_api.koreaexim 컬렉션 존재")
        except Exception as e:
            collections_info["external_api.koreaexim"] = f"존재하지 않음 (오류: {str(e)})"
            print(f"❌ external_api.koreaexim 컬렉션 오류: {str(e)}")
        
        # external_api 데이터베이스의 customs 컬렉션 확인
        try:
            test_doc = {"_id": "test", "temp": True}
            await external_api_db.customs.insert_one(test_doc)
            await external_api_db.customs.delete_one({"_id": "test"})
            collections_info["external_api.customs"] = "존재함"
            print("✅ external_api.customs 컬렉션 존재")
        except Exception as e:
            collections_info["external_api.customs"] = f"존재하지 않음 (오류: {str(e)})"
            print(f"❌ external_api.customs 컬렉션 오류: {str(e)}")
        
        return {
            "success": True,
            "message": "MongoDB 연결 테스트 완료",
            "mongodb_connection": "연결됨",
            "database_name": mongodb_service.db_name,
            "external_api_database": "external_api",
            "collections": collections_info,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ MongoDB 연결 테스트 실패: {str(e)}")
        return {
            "success": False,
            "message": f"MongoDB 연결 테스트 실패: {str(e)}",
            "mongodb_connection": "연결 실패",
            "database_name": "unknown",
            "external_api_database": "unknown",
            "collections": {},
            "timestamp": datetime.now().isoformat()
        }

# 외부 API 데이터 새로고침 엔드포인트
@router.post("/refresh/external")
async def refresh_external_api_data():
    """외부 API에서 최신 환율 데이터를 가져와서 external_api 컬렉션을 업데이트합니다."""
    try:
        db = mongodb_service.client
        collection = db.external_api
        
        print("외부 API에서 최신 환율 데이터를 가져오는 중...")
        
        # 기존 데이터 비활성화
        await collection.update_many(
            {"isActive": True},
            {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
        )
        
        # 관세청 API에서 데이터 수집
        print("관세청 API에서 환율 정보를 가져오는 중...")
        customs_rates = await customs_service.get_all_major_currencies()
        
        # 한국수출입은행 API에서 데이터 수집
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
            # 새 데이터 삽입
            result = await collection.insert_many(all_rates)
            
            # exchange_rates 컬렉션도 업데이트
            exchange_collection = db.exchange_rates
            await exchange_collection.update_many(
                {"externalSource": True},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            
            # 새로운 데이터로 exchange_rates 업데이트
            for rate in all_rates:
                await exchange_collection.update_one(
                    {"currencyCode": rate["currencyCode"]},
                    {
                        "$set": {
                            "appliedRate": rate["appliedRate"],
                            "source": rate["source"],
                            "rateType": rate["rateType"],
                            "baseDate": rate["baseDate"],
                            "updatedAt": datetime.utcnow(),
                            "externalSource": True
                        }
                    },
                    upsert=True
                )
            
            return ExchangeRateResponse(
                success=True,
                message=f"외부 API 데이터 {len(result.inserted_ids)}개가 성공적으로 새로고침되었습니다."
            )
        else:
            return ExchangeRateResponse(
                success=False,
                message="외부 API에서 환율 데이터를 가져올 수 없습니다."
            )
            
    except Exception as e:
        print(f"외부 API 데이터 새로고침 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"외부 API 데이터 새로고침 실패: {str(e)}")

# 외부 API 데이터 조회 엔드포인트
@router.get("/external")
async def get_external_api_data():
    """external_api 컬렉션의 데이터를 조회합니다."""
    try:
        db = mongodb_service.client
        collection = db.external_api
        
        # 활성 데이터 조회
        cursor = collection.find({"isActive": True}).sort("currencyCode", 1)
        rates = await cursor.to_list(length=100)
        
        return ExchangeRateResponse(
            success=True,
            data=[ExchangeRateStorage(**rate) for rate in rates],
            message="외부 API 환율 정보를 성공적으로 조회했습니다."
        )
        
    except Exception as e:
        print(f"외부 API 데이터 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"외부 API 데이터 조회 실패: {str(e)}")

# 프론트엔드 환율 설정 섹션 펼침 시 호출할 엔드포인트
@router.get("/frontend/expand")
async def get_exchange_rates_for_frontend():
    """프론트엔드 환율 설정 섹션 펼침 시 호출되는 엔드포인트"""
    try:
        # MongoDB 연결 확인 및 초기화
        from app.services.service_mongodb import ensure_mongodb_connection
        await ensure_mongodb_connection()
        
        # external_api를 별도 데이터베이스로 생성 (scrapmarket과 동등한 위치)
        client = mongodb_service.client
        external_api_db = client["external_api"]  # 별도 데이터베이스
        
        today = datetime.now().strftime("%Y%m%d")
        
        print(f"프론트엔드 환율 설정 섹션 펼침 요청 - 오늘 날짜: {today}")
        print(f"사용 중인 데이터베이스: external_api (scrapmarket과 동등한 위치)")
        
        # 1. external_api 데이터베이스의 koreaexim과 customs 컬렉션 존재 여부 확인
        try:
            # koreaexim 컬렉션 테스트
            test_doc = {"_id": "test", "temp": True}
            await external_api_db.koreaexim.insert_one(test_doc)
            await external_api_db.koreaexim.delete_one({"_id": "test"})
            
            # customs 컬렉션 테스트
            await external_api_db.customs.insert_one(test_doc)
            await external_api_db.customs.delete_one({"_id": "test"})
            
            collections_exist = True
            print("external_api 데이터베이스의 koreaexim과 customs 컬렉션이 이미 존재합니다.")
        except Exception as e:
            collections_exist = False
            print(f"external_api 데이터베이스의 koreaexim 또는 customs 컬렉션이 존재하지 않습니다. 새로 생성합니다.")
        
        if not collections_exist:
            # API 호출하여 데이터 수집
            print("koreaexim API에서 환율 정보를 가져오는 중...")
            koreaexim_rates = await koreaexim_service.get_all_major_currencies()
            
            print("customs API에서 환율 정보를 가져오는 중...")
            customs_rates = await customs_service.get_all_major_currencies()
            
            # koreaexim 컬렉션에 데이터 저장
            if koreaexim_rates:
                for rate in koreaexim_rates:
                    if rate.get("appliedRate", 0) > 0:
                        rate["searchdate"] = today  # koreaexim용 날짜 필드
                        rate["baseDate"] = today
                        rate["isActive"] = True
                        await external_api_db.koreaexim.insert_one(rate)
                        print(f"koreaexim 컬렉션에 저장: {rate['currencyCode']}: {rate['appliedRate']}")
            else:
                print("⚠️ koreaexim API에서 데이터를 가져올 수 없습니다. 기본 데이터를 생성합니다.")
                default_koreaexim = [
                    {"currencyCode": "USD", "appliedRate": 1350.0, "source": "koreaexim", "searchdate": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "EUR", "appliedRate": 1470.0, "source": "koreaexim", "searchdate": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "JPY", "appliedRate": 9.1, "source": "koreaexim", "searchdate": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "CNY", "appliedRate": 185.0, "source": "koreaexim", "searchdate": today, "baseDate": today, "isActive": True}
                ]
                for rate in default_koreaexim:
                    await external_api_db.koreaexim.insert_one(rate)
                    print(f"koreaexim 기본 데이터 생성: {rate['currencyCode']}: {rate['appliedRate']}")
            
            # customs 컬렉션에 데이터 저장
            if customs_rates:
                for rate in customs_rates:
                    if rate.get("appliedRate", 0) > 0:
                        rate["aplyBgnDt"] = today  # customs용 날짜 필드
                        rate["baseDate"] = today
                        rate["isActive"] = True
                        await external_api_db.customs.insert_one(rate)
                        print(f"customs 컬렉션에 저장: {rate['currencyCode']}: {rate['appliedRate']}")
            else:
                print("⚠️ customs API에서 데이터를 가져올 수 없습니다. 기본 데이터를 생성합니다.")
                default_customs = [
                    {"currencyCode": "USD", "appliedRate": 1350.0, "source": "customs", "aplyBgnDt": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "EUR", "appliedRate": 1470.0, "source": "customs", "aplyBgnDt": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "JPY", "appliedRate": 9.1, "source": "customs", "aplyBgnDt": today, "baseDate": today, "isActive": True},
                    {"currencyCode": "CNY", "appliedRate": 185.0, "source": "customs", "aplyBgnDt": today, "baseDate": today, "isActive": True}
                ]
                for rate in default_customs:
                    await external_api_db.customs.insert_one(rate)
                    print(f"customs 기본 데이터 생성: {rate['currencyCode']}: {rate['appliedRate']}")
                
        else:
            # 2. koreaexim 컬렉션 데이터 확인
            koreaexim_data = await external_api_db.koreaexim.find({
                "isActive": True
            }).sort("baseDate", -1).limit(1).to_list(length=1)
            
            needs_koreaexim_update = False
            if not koreaexim_data:
                print("koreaexim 컬렉션에 데이터가 없습니다.")
                needs_koreaexim_update = True
            else:
                koreaexim_date = koreaexim_data[0].get("searchdate", koreaexim_data[0].get("baseDate", ""))
                if koreaexim_date != today:
                    print(f"koreaexim 데이터 날짜 불일치: 저장된 날짜={koreaexim_date}, 오늘 날짜={today}")
                    needs_koreaexim_update = True
                else:
                    print(f"koreaexim 데이터 최신 상태: {koreaexim_date}")
            
            # 3. customs 컬렉션 데이터 확인
            customs_data = await external_api_db.customs.find({
                "isActive": True
            }).sort("baseDate", -1).limit(1).to_list(length=1)
            
            needs_customs_update = False
            if not customs_data:
                print("customs 컬렉션에 데이터가 없습니다.")
                needs_customs_update = True
            else:
                customs_date = customs_data[0].get("aplyBgnDt", customs_data[0].get("baseDate", ""))
                if customs_date != today:
                    print(f"customs 데이터 날짜 불일치: 저장된 날짜={customs_date}, 오늘 날짜={today}")
                    needs_customs_update = True
                else:
                    print(f"customs 데이터 최신 상태: {customs_date}")
            
            # 4. 필요한 경우 API 호출하여 데이터 업데이트
            if needs_koreaexim_update:
                print("koreaexim API에서 최신 환율 정보를 가져오는 중...")
                
                # 기존 koreaexim 데이터 비활성화
                await external_api_db.koreaexim.update_many(
                    {"isActive": True},
                    {"$set": {"isActive": False, "updatedAt": datetime.now()}}
                )
                
                # 새 koreaexim 데이터 수집
                new_koreaexim_rates = await koreaexim_service.get_all_major_currencies()
                
                # API에서 데이터를 가져올 수 없는 경우 기본 데이터 사용
                if not new_koreaexim_rates:
                    print("⚠️ koreaexim API에서 데이터를 가져올 수 없습니다. 기본 데이터를 사용합니다.")
                    default_koreaexim = [
                        {"currencyCode": "USD", "appliedRate": 1350.0, "source": "koreaexim"},
                        {"currencyCode": "EUR", "appliedRate": 1470.0, "source": "koreaexim"},
                        {"currencyCode": "JPY", "appliedRate": 9.1, "source": "koreaexim"},
                        {"currencyCode": "CNY", "appliedRate": 185.0, "source": "koreaexim"}
                    ]
                    new_koreaexim_rates = default_koreaexim
                
                for rate in new_koreaexim_rates:
                    if rate.get("appliedRate", 0) > 0:
                        rate["searchdate"] = today
                        rate["isActive"] = True
                        rate["baseDate"] = today
                        await external_api_db.koreaexim.insert_one(rate)
                        print(f"koreaexim 업데이트: {rate['currencyCode']}: {rate['appliedRate']}")
            
            if needs_customs_update:
                print("customs API에서 최신 환율 정보를 가져오는 중...")
                
                # 기존 customs 데이터 비활성화
                await external_api_db.customs.update_many(
                    {"isActive": True},
                    {"$set": {"isActive": False, "updatedAt": datetime.now()}}
                )
                
                # 새 customs 데이터 수집
                new_customs_rates = await customs_service.get_all_major_currencies()
                
                # API에서 데이터를 가져올 수 없는 경우 기본 데이터 사용
                if not new_customs_rates:
                    print("⚠️ customs API에서 데이터를 가져올 수 없습니다. 기본 데이터를 사용합니다.")
                    default_customs = [
                        {"currencyCode": "USD", "appliedRate": 1350.0, "source": "customs"},
                        {"currencyCode": "EUR", "appliedRate": 1470.0, "source": "customs"},
                        {"currencyCode": "JPY", "appliedRate": 9.1, "source": "customs"},
                        {"currencyCode": "CNY", "appliedRate": 185.0, "source": "customs"}
                    ]
                    new_customs_rates = default_customs
                
                for rate in new_customs_rates:
                    if rate.get("appliedRate", 0) > 0:
                        rate["aplyBgnDt"] = today
                        rate["isActive"] = True
                        rate["baseDate"] = today
                        await external_api_db.customs.insert_one(rate)
                        print(f"customs 업데이트: {rate['currencyCode']}: {rate['appliedRate']}")
        
        # 5. 최종 데이터 조회하여 프론트엔드에 전송
        # koreaexim과 customs 컬렉션에서 데이터를 가져와서 통합
        koreaexim_final = await external_api_db.koreaexim.find({"isActive": True}).to_list(length=100)
        customs_final = await external_api_db.customs.find({"isActive": True}).to_list(length=100)
        
        # 프론트엔드에서 사용할 형식으로 데이터 변환
        frontend_rates = []
        
        # koreaexim 데이터를 dailyRate로 변환
        for rate in koreaexim_final:
            frontend_rate = {
                "currencyCode": rate["currencyCode"],
                "currency": rate["currencyCode"],
                "dailyRate": rate.get("appliedRate", 0),
                "weeklyTariff": 0,  # koreaexim은 dailyRate만 제공
                "appliedRate": rate.get("appliedRate", 0),
                "source": "koreaexim",
                "rateType": "daily",
                "baseDate": rate.get("baseDate", today),
                "isActive": rate.get("isActive", True)
            }
            frontend_rates.append(frontend_rate)
        
        # customs 데이터를 weeklyTariff로 변환
        for rate in customs_final:
            # 이미 존재하는 통화인지 확인
            existing_rate = next((r for r in frontend_rates if r["currencyCode"] == rate["currencyCode"]), None)
            if existing_rate:
                # 기존 데이터에 weeklyTariff 추가
                existing_rate["weeklyTariff"] = rate.get("appliedRate", 0)
            else:
                # 새로운 통화 데이터 생성
                frontend_rate = {
                    "currencyCode": rate["currencyCode"],
                    "currency": rate["currencyCode"],
                    "dailyRate": 0,  # customs는 weeklyTariff만 제공
                    "weeklyTariff": rate.get("appliedRate", 0),
                    "appliedRate": rate.get("appliedRate", 0),
                    "source": "customs",
                    "rateType": "weekly",
                    "baseDate": rate.get("baseDate", today),
                    "isActive": rate.get("isActive", True)
                }
                frontend_rates.append(frontend_rate)
        
        return ExchangeRateResponse(
            success=True,
            data=frontend_rates,
            message="프론트엔드용 환율 정보를 성공적으로 조회했습니다."
        )
        
    except Exception as e:
        print(f"프론트엔드 환율 정보 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"프론트엔드 환율 정보 조회 실패: {str(e)}")
