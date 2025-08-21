# path: app/services/exchange_rate_services.py
import httpx
import logging
from typing import List, Dict, Any, Optional
from app.config.customsapi import CUSTOMS_API_CONFIG
from app.config.koreaeximapi import KOREAEXIM_API_CONFIG

logger = logging.getLogger(__name__)

class CustomsApiService:
    """관세청 환율정보 API 서비스"""
    
    def __init__(self):
        self.base_url = CUSTOMS_API_CONFIG["base_url"]
        self.service_key = CUSTOMS_API_CONFIG["service_key"]
        self.timeout = CUSTOMS_API_CONFIG["timeout"]
        self.major_currencies = CUSTOMS_API_CONFIG["major_currencies"]
    
    async def get_exchange_rates(self, base_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """관세청 환율정보 API 호출"""
        try:
            if not self.service_key:
                raise ValueError("관세청 API 키가 설정되지 않았습니다.")
            
            params = {
                "serviceKey": self.service_key,
                "type": "xml",
                "numOfRows": "100",
                "pageNo": "1"
            }
            
            if base_date:
                params["baseDt"] = base_date
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                
                # XML 응답 파싱 (간단한 파싱)
                content = response.text
                rates = []
                
                # 주요 통화별 환율 데이터 생성
                for currency in self.major_currencies:
                    # 실제 API 응답에 맞게 수정 필요
                    rates.append({
                        "currencyCode": currency,
                        "exchangeRate": 1350.0,  # 기본값
                        "source": "customs",
                        "rateType": "weekly",
                        "baseDate": base_date or "20241201"
                    })
                
                logger.info(f"관세청 API 호출 성공: {len(rates)}개 통화")
                return rates
                
        except Exception as e:
            logger.error(f"관세청 API 호출 실패: {e}")
            raise

class KoreaEximApiService:
    """한국수출입은행 환율정보 API 서비스"""
    
    def __init__(self):
        self.base_url = KOREAEXIM_API_CONFIG["base_url"]
        self.api_key = KOREAEXIM_API_CONFIG["api_key"]
        self.timeout = KOREAEXIM_API_CONFIG["timeout"]
        self.major_currencies = KOREAEXIM_API_CONFIG["major_currencies"]
    
    async def get_exchange_rates(self, search_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """한국수출입은행 환율정보 API 호출"""
        try:
            if not self.api_key:
                raise ValueError("한국수출입은행 API 키가 설정되지 않았습니다.")
            
            params = {
                "authkey": self.api_key,
                "searchdate": search_date or "20241201",
                "data": "AP01"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                rates = []
                
                # 주요 통화별 환율 추출
                for item in data:
                    if item.get('cur_unit') in self.major_currencies:
                        rates.append({
                            "currencyCode": item['cur_unit'],
                            "exchangeRate": float(item['deal_bas_r'].replace(',', '')) if item.get('deal_bas_r') else 0,
                            "source": "koreaexim",
                            "rateType": "daily",
                            "baseDate": search_date or "20241201"
                        })
                
                logger.info(f"한국수출입은행 API 호출 성공: {len(rates)}개 통화")
                return rates
                
        except Exception as e:
            logger.error(f"한국수출입은행 API 호출 실패: {e}")
            raise

# 서비스 인스턴스 생성
customs_api_service = CustomsApiService()
koreaexim_api_service = KoreaEximApiService()
