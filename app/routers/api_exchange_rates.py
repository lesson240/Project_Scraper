# path: app/routers/api_exchange_rates.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.service_mongodb import mongodb_service
from app.services.koreaexim_service import koreaexim_service
from app.services.service_customs import customs_service
from app.services.service_exchange_rate import exchange_rate_service
from app.config.mongodb import MONGO_DB_NAME_EXTERNAL_API
# 공통 모델 import로 변경
from app.models.model_exchange_rate import (
    ExchangeRateBase, 
    ExchangeRateResponse,
    CombinedExchangeRateData,
    CombinedExchangeRateResponse
)

router = APIRouter(prefix="/api/exchange-rates", tags=["ExchangeRates"])

# 데이터베이스 의존성
async def get_db() -> AsyncIOMotorClient:
    return mongodb_service.client

# 특정 통화의 두 컬렉션 통합 데이터 조회
@router.get("/combined/{currency_code}")
async def get_combined_currency_data(
    currency_code: str,
    db: AsyncIOMotorClient = Depends(get_db)
) -> CombinedExchangeRateResponse:
    """특정 통화의 customs와 koreaexim 컬렉션 통합 데이터 조회"""
    try:
        # external_api 데이터베이스 접근
        client = mongodb_service.client
        external_api_db = client["external_api"]
        
        print(f"{currency_code} 통화의 customs와 koreaexim 통합 데이터 조회 시작...")
        
        # 두 컬렉션에서 해당 통화의 최신 데이터 조회
        customs_rate = await external_api_db.customs.find_one({
            "currencyCode": currency_code,
            "isActive": True
        }, sort=[("baseDate", -1)])
        
        koreaexim_rate = await external_api_db.koreaexim.find_one({
            "currencyCode": currency_code,
            "isActive": True
        }, sort=[("baseDate", -1)])
        
        # 결과 데이터 구성 - Dict로 변경하여 타입 오류 해결
        result_data = {
            "currencyCode": currency_code,
            "customs": None,
            "koreaexim": None
        }
        
        # customs 데이터 처리
        if customs_rate:
            result_data["customs"] = {
                "appliedRate": customs_rate.get("appliedRate", 0),
                "baseDate": customs_rate.get("baseDate", ""),
                "aplyBgnDt": customs_rate.get("aplyBgnDt", ""),
                "originalData": customs_rate.get("originalData", {}),
                "isActive": customs_rate.get("isActive", True),
                "source": "customs"
            }
            print(f"{currency_code} customs 데이터: {customs_rate.get('appliedRate')}")
        
        # koreaexim 데이터 처리
        if koreaexim_rate:
            result_data["koreaexim"] = {
                "appliedRate": koreaexim_rate.get("appliedRate", 0),
                "baseDate": koreaexim_rate.get("baseDate", ""),
                "searchdate": koreaexim_rate.get("searchdate", ""),
                "tts": koreaexim_rate.get("tts", 0),
                "ttb": koreaexim_rate.get("ttb", 0),
                "isActive": koreaexim_rate.get("isActive", True),
                "source": "koreaexim"
            }
            print(f"{currency_code} koreaexim 데이터: {koreaexim_rate.get('appliedRate')}")
        
        # 데이터가 하나도 없는 경우
        if not result_data["customs"] and not result_data["koreaexim"]:
            raise HTTPException(
                status_code=404, 
                detail=f"{currency_code} 통화의 데이터를 customs와 koreaexim 컬렉션에서 찾을 수 없습니다."
            )
        
        print(f"{currency_code} 통화 통합 데이터 조회 완료")
        
        return CombinedExchangeRateResponse(
            success=True,
            data=[result_data],
            message=f"{currency_code} 통화의 customs와 koreaexim 통합 데이터를 성공적으로 조회했습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"{currency_code} 통화 통합 데이터 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"{currency_code} 통화 통합 데이터 조회 실패: {str(e)}"
        )

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
        
        print(f"🔍 koreaexim 최종 데이터: {len(koreaexim_final)}개")
        print(f"🔍 customs 최종 데이터: {len(customs_final)}개")
        
        # CombinedExchangeRateResponse 형식으로 데이터 변환
        combined_rates = []
        
        # USD, CNY, JPY, EUR 순서로 처리
        currencies = ['USD', 'CNY', 'JPY', 'EUR']
        
        for currency in currencies:
            # koreaexim 데이터 찾기
            koreaexim_data = next((r for r in koreaexim_final if r["currencyCode"] == currency), None)
            
            # customs 데이터 찾기
            customs_data = next((r for r in customs_final if r["currencyCode"] == currency), None)
            
            print(f"🔍 {currency} 통화 처리:")
            print(f"  - koreaexim: {koreaexim_data}")
            print(f"  - customs: {customs_data}")
            
            # Combined 형식으로 데이터 구성
            combined_rate = {
                "currencyCode": currency,
                "customs": None,
                "koreaexim": None
            }
            
            # customs 데이터 처리
            if customs_data:
                combined_rate["customs"] = {
                    "appliedRate": customs_data.get("appliedRate", 0),
                    "baseDate": customs_data.get("baseDate", today),
                    "aplyBgnDt": customs_data.get("aplyBgnDt", today),
                    "originalData": customs_data.get("originalData", {}),
                    "isActive": customs_data.get("isActive", True),
                    "source": "customs"
                }
                print(f"  ✅ {currency} customs 데이터 구성 완료: {combined_rate['customs']}")
            
            # koreaexim 데이터 처리
            if koreaexim_data:
                combined_rate["koreaexim"] = {
                    "appliedRate": koreaexim_data.get("appliedRate", 0),
                    "baseDate": koreaexim_data.get("baseDate", today),
                    "searchdate": koreaexim_data.get("searchdate", today),
                    "tts": koreaexim_data.get("tts", 0),
                    "ttb": koreaexim_data.get("ttb", 0),
                    "isActive": koreaexim_data.get("isActive", True),
                    "source": "koreaexim"
                }
                print(f"  ✅ {currency} koreaexim 데이터 구성 완료: {combined_rate['koreaexim']}")
            
            combined_rates.append(combined_rate)
            print(f"  🎯 {currency} 통합 데이터 완성: {combined_rate}")
        
        print(f"🎉 최종 combined_rates: {combined_rates}")
        
        # CombinedExchangeRateResponse 형식으로 반환
        from app.models.model_exchange_rate import CombinedExchangeRateResponse
        
        return CombinedExchangeRateResponse(
            success=True,
            data=combined_rates,
            message="프론트엔드용 환율 정보를 성공적으로 조회했습니다."
        )
        
    except Exception as e:
        print(f"프론트엔드 환율 정보 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"프론트엔드 환율 정보 조회 실패: {str(e)}")
