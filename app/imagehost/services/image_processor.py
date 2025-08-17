# 이미지 처리 및 최적화 서비스
from PIL import Image, ImageOps
import io
import logging
from typing import Optional, Tuple, Dict, Any
from fastapi import HTTPException

from ..models.storage_model import ImageOptimizationConfig
from ..models.image_model import ImageFormat

logger = logging.getLogger(__name__)

class ImageProcessor:
    """이미지 처리 및 최적화 서비스"""
    
    def __init__(self, config: ImageOptimizationConfig):
        """서비스 초기화"""
        self.config = config
        
    async def process_image(self, image_data: bytes, original_format: str) -> Dict[str, Any]:
        """이미지 처리 및 최적화"""
        try:
            # PIL Image 객체 생성
            image = Image.open(io.BytesIO(image_data))
            
            # 이미지 정보 추출
            width, height = image.size
            format_info = image.format
            
            # 이미지 최적화
            optimized_image = await self._optimize_image(image, original_format)
            
            # 최적화된 이미지 데이터
            output_format = self._get_output_format(original_format)
            optimized_data = await self._convert_to_bytes(optimized_image, output_format)
            
            # 메타데이터 반환
            return {
                'optimized_data': optimized_data,
                'format': output_format,
                'width': width,
                'height': height,
                'original_size': len(image_data),
                'optimized_size': len(optimized_data),
                'compression_ratio': len(optimized_data) / len(image_data),
                'is_optimized': True
            }
            
        except Exception as e:
            logger.error(f"이미지 처리 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="이미지 처리 실패")
    
    async def generate_thumbnails(self, image_data: bytes, format: str) -> Dict[str, bytes]:
        """썸네일 생성"""
        try:
            image = Image.open(io.BytesIO(image_data))
            thumbnails = {}
            
            for size in self.config.thumbnail_sizes:
                width, height = size
                thumbnail = await self._create_thumbnail(image, width, height)
                thumbnail_data = await self._convert_to_bytes(thumbnail, format)
                thumbnails[f"{width}x{height}"] = thumbnail_data
            
            return thumbnails
            
        except Exception as e:
            logger.error(f"썸네일 생성 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="썸네일 생성 실패")
    
    async def resize_image(self, image_data: bytes, target_width: int, target_height: int) -> bytes:
        """이미지 리사이징"""
        try:
            image = Image.open(io.BytesIO(image_data))
            resized_image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # 원본 포맷 유지
            output_format = self._get_image_format(image_data)
            return await self._convert_to_bytes(resized_image, output_format)
            
        except Exception as e:
            logger.error(f"이미지 리사이징 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="이미지 리사이징 실패")
    
    async def convert_format(self, image_data: bytes, target_format: str) -> bytes:
        """이미지 포맷 변환"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # 투명도가 있는 이미지는 PNG로 변환
            if target_format.lower() == 'png' and image.mode in ('RGBA', 'LA'):
                image = image.convert('RGBA')
            elif target_format.lower() in ('jpeg', 'jpg'):
                # JPEG는 투명도를 지원하지 않으므로 흰색 배경 추가
                if image.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = background
                else:
                    image = image.convert('RGB')
            
            return await self._convert_to_bytes(image, target_format)
            
        except Exception as e:
            logger.error(f"이미지 포맷 변환 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="이미지 포맷 변환 실패")
    
    async def _optimize_image(self, image: Image.Image, original_format: str) -> Image.Image:
        """이미지 최적화"""
        try:
            # 이미지 모드 최적화
            if image.mode in ('RGBA', 'LA') and original_format.lower() in ('jpeg', 'jpg'):
                # JPEG로 변환 시 투명도 제거
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # 크기 제한 확인
            if self.config.max_width or self.config.max_height:
                image = await self._resize_with_constraints(image)
            
            # 이미지 품질 최적화
            if original_format.lower() in ('jpeg', 'jpg'):
                image = await self._optimize_jpeg(image)
            elif original_format.lower() == 'png':
                image = await self._optimize_png(image)
            
            return image
            
        except Exception as e:
            logger.error(f"이미지 최적화 실패: {str(e)}")
            return image  # 최적화 실패 시 원본 반환
    
    async def _resize_with_constraints(self, image: Image.Image) -> Image.Image:
        """제약 조건에 따른 이미지 리사이징"""
        width, height = image.size
        
        if self.config.max_width and width > self.config.max_width:
            ratio = self.config.max_width / width
            new_width = self.config.max_width
            new_height = int(height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        if self.config.max_height and height > self.config.max_height:
            ratio = self.config.max_height / height
            new_height = self.config.max_height
            new_width = int(width * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return image
    
    async def _optimize_jpeg(self, image: Image.Image) -> Image.Image:
        """JPEG 최적화"""
        # JPEG 품질 최적화
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # 메타데이터 제거
        if self.config.strip_metadata:
            # PIL에서는 메타데이터 제거가 자동으로 처리됨
            pass
        
        return image
    
    async def _optimize_png(self, image: Image.Image) -> Image.Image:
        """PNG 최적화"""
        # PNG 최적화 (투명도 유지)
        if image.mode not in ('RGBA', 'LA'):
            image = image.convert('RGBA')
        
        return image
    
    async def _create_thumbnail(self, image: Image.Image, width: int, height: int) -> Image.Image:
        """썸네일 생성"""
        # 비율 유지하며 썸네일 생성
        image.thumbnail((width, height), Image.Resampling.LANCZOS)
        return image
    
    async def _convert_to_bytes(self, image: Image.Image, format: str) -> bytes:
        """이미지를 바이트로 변환"""
        output_buffer = io.BytesIO()
        
        if format.lower() in ('jpeg', 'jpg'):
            image.save(output_buffer, format='JPEG', quality=self.config.default_quality, optimize=True)
        elif format.lower() == 'png':
            image.save(output_buffer, format='PNG', optimize=True)
        elif format.lower() == 'webp':
            image.save(output_buffer, format='WebP', quality=self.config.default_quality)
        else:
            image.save(output_buffer, format=format)
        
        output_buffer.seek(0)
        return output_buffer.getvalue()
    
    def _get_output_format(self, original_format: str) -> str:
        """출력 포맷 결정"""
        if self.config.auto_convert_to_webp and original_format.lower() in ('jpeg', 'jpg', 'png'):
            return 'webp'
        return original_format.lower()
    
    def _get_image_format(self, image_data: bytes) -> str:
        """이미지 포맷 감지"""
        try:
            image = Image.open(io.BytesIO(image_data))
            return image.format.lower()
        except:
            return 'jpeg'  # 기본값
    
    async def get_image_info(self, image_data: bytes) -> Dict[str, Any]:
        """이미지 정보 추출"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            return {
                'format': image.format,
                'mode': image.mode,
                'width': image.width,
                'height': image.height,
                'size': len(image_data),
                'has_transparency': image.mode in ('RGBA', 'LA'),
                'is_animated': hasattr(image, 'n_frames') and image.n_frames > 1
            }
            
        except Exception as e:
            logger.error(f"이미지 정보 추출 실패: {str(e)}")
            raise HTTPException(status_code=500, detail="이미지 정보 추출 실패")
