# path: app/services/koreaexim_service.py
import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from app.config.koreaeximapi import KOREAEXIM_API_CONFIG

class KoreaEximService:
    """한국수출입은행 환율 API 서비스"""
    
    def __init__(self):
        self.base_url = KOREAEXIM_API_CONFIG["base_url"]
        self.api_key = KOREAEXIM_API_CONFIG["api_key"]
        self.timeout = KOREAEXIM_API_CONFIG["timeout"]
        self.retry_count = KOREAEXIM_API_CONFIG["retry_count"]
        self.major_currencies = KOREAEXIM_API_CONFIG["major_currencies"]
    
    async def get_exchange_rates(self, cur_unit: str = None) -> Optional[Dict]:
        """
        한국수출입은행에서 환율 정보를 가져옵니다.
        
        Args:
            cur_unit: 통화 코드 (USD, JPY, EUR, CNY)
            
        Returns:
            환율 정보 딕셔너리 또는 None
        """
        if not self.api_key:
            print("⚠️ 한국수출입은행 API 키가 설정되지 않았습니다.")
            return None
            
        try:
            # 한국수출입은행 API용 통화 코드 매핑
            currency_mapping = {
                "USD": "USD",
                "EUR": "EUR", 
                "JPY": "JPY(100)",  # JPY는 JPY(100)으로 변경
                "CNY": "CNH"         # CNY는 CNH로 변경
            }
            
            # API 호출용 통화 코드 변환
            api_cur_unit = currency_mapping.get(cur_unit, cur_unit)
            
            params = {
                "authkey": self.api_key,
                "searchdate": datetime.now().strftime("%Y%m%d"),
                "data": "AP01"  # AP01: 환율
            }
            
            if cur_unit:
                params["cur_unit"] = api_cur_unit
                print(f"한국수출입은행 API 호출: {cur_unit} → {api_cur_unit}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # 특정 통화 요청인 경우
                    if cur_unit:
                        return data[0] if data else None
                    # 전체 통화 요청인 경우
                    return data
                else:
                    print(f"⚠️ 한국수출입은행 API 응답 데이터가 비어있습니다: {data}")
                    return None
                    
        except httpx.TimeoutException:
            print(f"⚠️ 한국수출입은행 API 요청 시간 초과: {cur_unit}")
            return None
        except httpx.HTTPStatusError as e:
            print(f"⚠️ 한국수출입은행 API HTTP 에러: {e.response.status_code} - {cur_unit}")
            return None
        except Exception as e:
            print(f"⚠️ 한국수출입은행 API 요청 실패: {str(e)} - {cur_unit}")
            return None
    
    async def get_all_major_currencies(self) -> List[Dict]:
        """
        주요 통화들의 환율 정보를 모두 가져옵니다.
        
        Returns:
            주요 통화 환율 정보 리스트
        """
        rates = []
        
        for currency in self.major_currencies:
            try:
                rate_data = await self.get_exchange_rates(currency)
                if rate_data:
                    # 통화 코드를 표준화
                    normalized_data = self._normalize_currency_data(rate_data, currency)
                    rates.append(normalized_data)
                
                # API 호출 간격 조절
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"⚠️ {currency} 통화 환율 조회 실패: {str(e)}")
                continue
        
        return rates
    
    def _normalize_currency_data(self, rate_data: Dict, currency: str) -> Dict:
        """
        한국수출입은행 API 응답 데이터를 표준화합니다.
        
        Args:
            rate_data: API 응답 데이터
            currency: 통화 코드 (원본 통화 코드 사용)
            
        Returns:
            표준화된 환율 데이터
        """
        try:
            normalized = {
                "currencyCode": currency,  # 원본 통화 코드 그대로 사용
                "source": "koreaexim",
                "rateType": "daily",
                "baseDate": datetime.now().strftime("%Y%m%d"),
                "isActive": True,
                "createdAt": datetime.now(),  # utcnow() 대신 now() 사용
                "updatedAt": datetime.now()
            }
            
            # 환율 값 추출 및 변환 - 프론트엔드에서 사용하는 tts 값 우선 사용
            if "tts" in rate_data:
                # 매매기준율 (TTS - Tell, Transfer, Sight) - 프론트엔드에서 사용
                try:
                    tts_value = rate_data["tts"]
                    if isinstance(tts_value, str):
                        normalized["appliedRate"] = float(tts_value.replace(",", ""))
                    else:
                        normalized["appliedRate"] = float(tts_value)
                    normalized["rateSource"] = "tts"  # tts 값 사용 표시
                except (ValueError, AttributeError):
                    normalized["appliedRate"] = 0.0
                    normalized["rateSource"] = "error"
            elif "ttb" in rate_data:
                # 매입기준율 (TTB - Tell, Transfer, Buy) - tts가 없을 때 대체
                try:
                    ttb_value = rate_data["ttb"]
                    if isinstance(ttb_value, str):
                        normalized["appliedRate"] = float(ttb_value.replace(",", ""))
                    else:
                        normalized["appliedRate"] = float(ttb_value)
                    normalized["rateSource"] = "ttb"  # ttb 값 사용 표시
                except (ValueError, AttributeError):
                    normalized["appliedRate"] = 0.0
                    normalized["rateSource"] = "error"
            else:
                normalized["appliedRate"] = 0.0
                normalized["rateSource"] = "none"
            
            # 추가 정보 저장
            normalized["originalData"] = rate_data
            
            # 환율 정보 상세 로깅
            print(f"한국수출입은행 {currency}: tts={rate_data.get('tts', 'N/A')}, ttb={rate_data.get('ttb', 'N/A')}, 사용값={normalized['appliedRate']}")
            
            return normalized
            
        except Exception as e:
            print(f"⚠️ {currency} 통화 데이터 정규화 실패: {str(e)}")
            return {
                "currencyCode": currency,
                "appliedRate": 0.0,
                "source": "koreaexim",
                "rateType": "daily",
                "baseDate": datetime.now().strftime("%Y%m%d"),
                "isActive": True,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now(),
                "error": str(e),
                "rateSource": "error"
            }

# 서비스 인스턴스
koreaexim_service = KoreaEximService()
