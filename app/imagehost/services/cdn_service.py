# CDN 서비스
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException
import httpx

from ..models.storage_model import CDNConfig, CDNProvider

logger = logging.getLogger(__name__)

class CDNService:
    """CDN 서비스"""
    
    def __init__(self, config: CDNConfig):
        """서비스 초기화"""
        self.config = config
        self.domain = config.domain
        
    async def get_cdn_url(self, file_path: str) -> str:
        """CDN URL 생성"""
        if not file_path.startswith('/'):
            file_path = f"/{file_path}"
        
        return f"https://{self.domain}{file_path}"
    
    async def purge_cache(self, file_paths: list[str]) -> Dict[str, Any]:
        """CDN 캐시 퍼지"""
        try:
            if self.config.provider == CDNProvider.CLOUDFLARE:
                return await self._purge_cloudflare_cache(file_paths)
            else:
                logger.warning(f"지원하지 않는 CDN 제공자: {self.config.provider}")
                return {"success": False, "message": "지원하지 않는 CDN 제공자"}
                
        except Exception as e:
            logger.error(f"CDN 캐시 퍼지 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="CDN 캐시 퍼지 실패")
    
    async def get_cache_status(self, file_path: str) -> Dict[str, Any]:
        """캐시 상태 조회"""
        try:
            if self.config.provider == CDNProvider.CLOUDFLARE:
                return await self._get_cloudflare_cache_status(file_path)
            else:
                return {"success": False, "message": "지원하지 않는 CDN 제공자"}
                
        except Exception as e:
            logger.error(f"캐시 상태 조회 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="캐시 상태 조회 실패")
    
    async def _purge_cloudflare_cache(self, file_paths: list[str]) -> Dict[str, Any]:
        """Cloudflare 캐시 퍼지"""
        try:
            # Cloudflare API를 통한 캐시 퍼지
            # 실제 구현에서는 Cloudflare API 키와 Zone ID가 필요
            logger.info(f"Cloudflare 캐시 퍼지 요청: {file_paths}")
            
            # 임시 구현 (실제로는 Cloudflare API 호출)
            return {
                "success": True,
                "provider": "cloudflare",
                "purged_files": file_paths,
                "message": "캐시 퍼지 요청이 성공적으로 처리되었습니다"
            }
            
        except Exception as e:
            logger.error(f"Cloudflare 캐시 퍼지 실패: {str(e)}")
            return {
                "success": False,
                "provider": "cloudflare",
                "error": str(e)
            }
    
    async def _get_cloudflare_cache_status(self, file_path: str) -> Dict[str, Any]:
        """Cloudflare 캐시 상태 조회"""
        try:
            # Cloudflare API를 통한 캐시 상태 조회
            logger.info(f"Cloudflare 캐시 상태 조회: {file_path}")
            
            # 임시 구현 (실제로는 Cloudflare API 호출)
            return {
                "success": True,
                "provider": "cloudflare",
                "file_path": file_path,
                "cache_status": "cached",  # cached, uncached, expired
                "cache_ttl": 3600  # 초 단위
            }
            
        except Exception as e:
            logger.error(f"Cloudflare 캐시 상태 조회 실패: {str(e)}")
            return {
                "success": False,
                "provider": "cloudflare",
                "error": str(e)
            }
    
    def get_cache_headers(self) -> Dict[str, str]:
        """캐시 헤더 반환"""
        headers = {
            "Cache-Control": self.config.cache_control,
            "X-CDN-Provider": self.config.provider.value
        }
        
        # 추가 캐시 헤더
        headers.update(self.config.cache_headers)
        
        return headers
    
    def get_security_headers(self) -> Dict[str, str]:
        """보안 헤더 반환"""
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        
        # 추가 보안 헤더
        headers.update(self.config.security_headers)
        
        return headers
    
    async def validate_cdn_health(self) -> Dict[str, Any]:
        """CDN 상태 검증"""
        try:
            # CDN 도메인에 대한 헬스 체크
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"https://{self.domain}/health")
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "provider": self.config.provider.value,
                        "domain": self.domain,
                        "response_time": response.elapsed.total_seconds(),
                        "status": "healthy"
                    }
                else:
                    return {
                        "success": False,
                        "provider": self.config.provider.value,
                        "domain": self.domain,
                        "status_code": response.status_code,
                        "status": "unhealthy"
                    }
                    
        except Exception as e:
            logger.error(f"CDN 상태 검증 실패: {str(e)}")
            return {
                "success": False,
                "provider": self.config.provider.value,
                "domain": self.domain,
                "error": str(e),
                "status": "error"
            }
    
    def get_optimization_settings(self) -> Dict[str, Any]:
        """CDN 최적화 설정 반환"""
        return {
            "compression": self.config.compression,
            "minify": self.config.minify,
            "provider": self.config.provider.value,
            "domain": self.domain
        }
