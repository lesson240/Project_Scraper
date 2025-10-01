# path: app/services/service_captcha.py

import httpx
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class CaptchaService:
    """reCAPTCHA v3 검증 서비스"""
    
    def __init__(self):
        self.secret_key = os.getenv("RECAPTCHA_SECRET_KEY", "")
        self.verify_url = "https://www.google.com/recaptcha/api/siteverify"
        self.min_score = float(os.getenv("RECAPTCHA_MIN_SCORE", "0.5"))
    
    async def verify_captcha(self, token: str, remote_ip: Optional[str] = None) -> dict:
        """
        reCAPTCHA 토큰 검증
        
        Args:
            token: reCAPTCHA 토큰
            remote_ip: 클라이언트 IP (선택사항)
            
        Returns:
            dict: 검증 결과
                - success: bool
                - score: float (0.0-1.0)
                - action: str
                - error_codes: list (실패 시)
        """
        if not self.secret_key:
            logger.warning("reCAPTCHA secret key가 설정되지 않음. 검증을 건너뜁니다.")
            return {
                "success": True,
                "score": 1.0,
                "action": "login",
                "error_codes": []
            }
        
        if not token:
            return {
                "success": False,
                "score": 0.0,
                "action": "",
                "error_codes": ["missing-input-response"]
            }
        
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "secret": self.secret_key,
                    "response": token
                }
                
                if remote_ip:
                    data["remoteip"] = remote_ip
                
                response = await client.post(self.verify_url, data=data)
                result = response.json()
                
                logger.info(f"reCAPTCHA 검증 결과: {result}")
                
                return {
                    "success": result.get("success", False),
                    "score": result.get("score", 0.0),
                    "action": result.get("action", ""),
                    "error_codes": result.get("error-codes", [])
                }
                
        except Exception as e:
            logger.error(f"reCAPTCHA 검증 중 오류: {str(e)}")
            return {
                "success": False,
                "score": 0.0,
                "action": "",
                "error_codes": ["network-error"]
            }
    
    def is_score_valid(self, score: float, action: str) -> bool:
        """
        점수가 유효한지 확인
        
        Args:
            score: reCAPTCHA 점수 (0.0-1.0)
            action: 액션 이름
            
        Returns:
            bool: 점수가 유효한지 여부
        """
        # 액션별 최소 점수 설정
        min_scores = {
            "login": self.min_score,
            "signup": self.min_score,
            "password_reset": 0.3,  # 비밀번호 재설정은 더 관대하게
        }
        
        required_score = min_scores.get(action, self.min_score)
        return score >= required_score
    
    async def verify_for_login(self, token: str, remote_ip: Optional[str] = None) -> bool:
        """
        로그인용 reCAPTCHA 검증
        
        Args:
            token: reCAPTCHA 토큰
            remote_ip: 클라이언트 IP
            
        Returns:
            bool: 검증 통과 여부
        """
        result = await self.verify_captcha(token, remote_ip)
        
        if not result["success"]:
            logger.warning(f"reCAPTCHA 검증 실패: {result['error_codes']}")
            return False
        
        if not self.is_score_valid(result["score"], result["action"]):
            logger.warning(f"reCAPTCHA 점수 부족: {result['score']} < {self.min_score}")
            return False
        
        return True
