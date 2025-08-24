# path: app/services/service_customs.py
import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from app.config.customsapi import CUSTOMS_API_CONFIG

class CustomsService:
    """관세청 환율 API 서비스"""
    
    def __init__(self):
        self.base_url = CUSTOMS_API_CONFIG["base_url"]
        self.service_key = CUSTOMS_API_CONFIG["service_key"]
        self.timeout = CUSTOMS_API_CONFIG["timeout"]
        self.retry_count = CUSTOMS_API_CONFIG["retry_count"]
        self.major_currencies = CUSTOMS_API_CONFIG["major_currencies"]
    
    async def get_exchange_rates(self, curr_sgn: str = None) -> Optional[Dict]:
        """
        관세청에서 환율 정보를 가져옵니다.
        
        Args:
            curr_sgn: 통화기호 (USD, EUR, JPY, CNY) - 필터링용
            
        Returns:
            환율 정보 딕셔너리 또는 None
        """
        if not self.service_key:
            print("⚠️ 관세청 API 키가 설정되지 않았습니다.")
            return None
            
        try:
            # API 문서에 명시된 필수 파라미터만 사용 (보수적 접근)
            params = {
                "serviceKey": self.service_key,
                "aplyBgnDt": datetime.now().strftime("%Y%m%d"),  # 필수: 조회년월일
                "weekFxrtTpcd": "2"  # 필수: 수입(2) 기준
            }
            
            print(f"관세청 API 호출: 전체 통화 조회 (필터링: {curr_sgn if curr_sgn else '전체'})")
            print(f"API URL: {self.base_url}")
            print(f"파라미터: {params}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                
                # 응답 상태 코드 상세 로깅
                print(f"관세청 API 응답 상태: {response.status_code}")
                print(f"관세청 API 응답 헤더: {dict(response.headers)}")
                
                response.raise_for_status()
                
                # XML 응답을 텍스트로 받기
                xml_text = response.text
                print(f"관세청 API XML 응답 길이: {len(xml_text)} 문자")
                
                # XML 파싱을 위한 라이브러리 import
                try:
                    import xml.etree.ElementTree as ET
                    root = ET.fromstring(xml_text)
                    
                    # XML 구조 파싱
                    items = []
                    for item in root.findall('.//item'):
                        item_data = {}
                        for child in item:
                            item_data[child.tag] = child.text
                        items.append(item_data)
                    
                    if len(items) > 0:
                        print(f"관세청 API 응답: {len(items)}개 통화 데이터 수신")
                        
                        # 특정 통화 요청인 경우 - 응답에서 필터링
                        if curr_sgn:
                            # currSgn 필드로 매칭 (대소문자 구분 없이)
                            matching_items = [
                                item for item in items 
                                if item.get("currSgn", "").upper() == curr_sgn.upper()
                            ]
                            if matching_items:
                                print(f"관세청 {curr_sgn} 통화 데이터 찾음: {len(matching_items)}개")
                                return matching_items[0]
                            else:
                                print(f"⚠️ 관세청 {curr_sgn} 통화 데이터를 찾을 수 없습니다.")
                                # 사용 가능한 통화 코드 로깅
                                available_currencies = [item.get("currSgn", "N/A") for item in items[:10]]
                                print(f"사용 가능한 통화 코드 (상위 10개): {available_currencies}")
                                return None
                        
                        # 전체 통화 요청인 경우
                        return items
                    else:
                        print(f"⚠️ 관세청 API 응답 데이터가 비어있습니다: {items}")
                        return None
                        
                except ImportError:
                    print("⚠️ XML 파싱을 위한 라이브러리를 찾을 수 없습니다.")
                    return None
                except ET.ParseError as e:
                    print(f"⚠️ XML 파싱 실패: {str(e)}")
                    print(f"XML 응답 내용: {xml_text[:500]}...")
                    return None
                    
        except httpx.TimeoutException:
            print(f"⚠️ 관세청 API 요청 시간 초과: {curr_sgn}")
            return None
        except httpx.HTTPStatusError as e:
            print(f"⚠️ 관세청 API HTTP 에러: {e.response.status_code} - {curr_sgn}")
            # 에러 응답 내용 확인
            try:
                error_data = e.response.json()
                print(f"에러 응답 내용: {error_data}")
            except:
                print(f"에러 응답 텍스트: {e.response.text}")
            return None
        except Exception as e:
            print(f"⚠️ 관세청 API 요청 실패: {str(e)} - {curr_sgn}")
            return None
    
    async def get_all_major_currencies(self) -> List[Dict]:
        """
        주요 통화들의 환율 정보를 모두 가져옵니다.
        
        Returns:
            주요 통화 환율 정보 리스트
        """
        try:
            print("관세청 API에서 전체 통화 데이터를 한 번에 조회합니다...")
            
            # 한 번의 API 호출로 전체 데이터 조회
            all_rates = await self.get_exchange_rates()
            
            if not all_rates:
                print("⚠️ 관세청 API에서 전체 데이터를 가져올 수 없습니다.")
                return []
            
            # 필요한 통화만 필터링
            target_currencies = ["USD", "EUR", "JPY", "CNY"]
            filtered_rates = []
            
            for currency in target_currencies:
                # 대소문자 구분 없이 매칭
                matching_items = [
                    item for item in all_rates 
                    if item.get("currSgn", "").upper() == currency.upper()
                ]
                
                if matching_items:
                    # 첫 번째 매칭 항목 사용
                    rate_data = matching_items[0]
                    normalized_data = self._normalize_currency_data(rate_data, currency)
                    filtered_rates.append(normalized_data)
                    print(f"관세청 {currency} 통화 데이터 필터링 완료")
                else:
                    print(f"⚠️ 관세청 {currency} 통화 데이터를 찾을 수 없습니다.")
                    # 기본값으로 대체
                    default_data = self._create_default_currency_data(currency)
                    filtered_rates.append(default_data)
            
            print(f"관세청 API 처리 완료: {len(filtered_rates)}개 통화")
            return filtered_rates
            
        except Exception as e:
            print(f"⚠️ 관세청 전체 통화 조회 실패: {str(e)}")
            return []
    
    def _normalize_currency_data(self, rate_data: Dict, currency: str) -> Dict:
        """
        관세청 API 응답 데이터를 표준화합니다.
        
        Args:
            rate_data: API 응답 데이터
            currency: 통화 코드 (원본 통화 코드 사용)
            
        Returns:
            표준화된 환율 데이터
        """
        try:
            normalized = {
                "currencyCode": currency,  # 원본 통화 코드 그대로 사용
                "source": "customs",
                "rateType": "weekly",
                "baseDate": datetime.now().strftime("%Y%m%d"),
                "isActive": True,
                "createdAt": datetime.now(),  # utcnow() 대신 now() 사용
                "updatedAt": datetime.now()
            }
            
            # 환율 값 추출 및 변환
            if "fxrt" in rate_data:
                try:
                    # fxrt는 관세청 환율 값
                    fxrt_value = rate_data["fxrt"]
                    if isinstance(fxrt_value, str):
                        # 쉼표 제거 후 숫자로 변환
                        normalized["appliedRate"] = float(fxrt_value.replace(",", ""))
                    else:
                        normalized["appliedRate"] = float(fxrt_value)
                except (ValueError, AttributeError):
                    normalized["appliedRate"] = 0.0
            else:
                normalized["appliedRate"] = 0.0
            
            # 추가 정보 저장
            normalized["originalData"] = rate_data
            
            # 환율 정보 상세 로깅
            print(f"관세청 {currency}: fxrt={rate_data.get('fxrt', 'N/A')}, 적용값={normalized['appliedRate']}")
            
            return normalized
            
        except Exception as e:
            print(f"⚠️ {currency} 통화 데이터 정규화 실패: {str(e)}")
            return {
                "currencyCode": currency,
                "appliedRate": 0.0,
                "source": "customs",
                "rateType": "weekly",
                "baseDate": datetime.now().strftime("%Y%m%d"),
                "isActive": True,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now(),
                "error": str(e)
            }

    def _create_default_currency_data(self, currency: str) -> Dict:
        """
        기본 통화 데이터를 생성합니다.
        
        Args:
            currency: 통화 코드
            
        Returns:
            기본 통화 데이터
        """
        return {
            "currencyCode": currency,
            "appliedRate": 0.0,
            "source": "customs",
            "rateType": "weekly",
            "baseDate": datetime.now().strftime("%Y%m%d"),
            "isActive": True,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "error": "API 호출 실패로 기본값 사용"
        }

# 서비스 인스턴스
customs_service = CustomsService()
