#!/usr/bin/env python3
"""
MongoDB 정리 스크립트
- manuel_exchange_rate 컬렉션 제거
- base_price_setting 컬렉션 정리
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

async def cleanup_mongodb():
    """MongoDB 정리 작업을 수행합니다."""
    try:
        # MongoDB 연결
        client = AsyncIOMotorClient("mongodb://localhost:27017/")
        setting_db = client["settings"]
        scrapmarket_db = client["scrapmarket"]
        
        print("🚀 MongoDB 정리 작업 시작...")
        
        # 1. manuel_exchange_rate 컬렉션 제거
        print("📊 1단계: manuel_exchange_rate 컬렉션 제거 중...")
        try:
            await setting_db.manuel_exchange_rate.drop()
            print("✅ manuel_exchange_rate 컬렉션 제거 완료")
        except Exception as e:
            print(f"⚠️ manuel_exchange_rate 컬렉션이 이미 존재하지 않음: {e}")
        
        # 2. base_price_setting 컬렉션 정리
        print("📊 2단계: base_price_setting 컬렉션 정리 중...")
        try:
            # 기존 문서에서 불필요한 필드 제거
            result = await setting_db.base_price_setting.update_many(
                {},  # 모든 문서
                {
                    "$unset": {
                        "platformMargins": "",
                        "calculatedProducts": "",
                        "allttam": ""
                    }
                }
            )
            print(f"✅ base_price_setting 컬렉션 정리 완료: {result.modified_count}개 문서 수정")
        except Exception as e:
            print(f"⚠️ base_price_setting 컬렉션 정리 중 오류: {e}")
        
        # 3. ModifiedGoodsDetail 컬렉션에서 필드명 수정
        print("📊 3단계: ModifiedGoodsDetail 컬렉션 필드명 수정 중...")
        try:
            # sales_price를 selling_price로 변경
            result = await scrapmarket_db.ModifiedGoodsDetail.update_many(
                {"sales_price": {"$exists": True}},
                [
                    {
                        "$set": {
                            "selling_price": "$sales_price"
                        }
                    },
                    {
                        "$unset": ["sales_price", "setting_price"]
                    }
                ]
            )
            print(f"✅ ModifiedGoodsDetail 필드명 수정 완료: {result.modified_count}개 문서 수정")
        except Exception as e:
            print(f"⚠️ ModifiedGoodsDetail 필드명 수정 중 오류: {e}")
        
        print("🎉 MongoDB 정리 작업 완료!")
        
    except Exception as e:
        print(f"❌ MongoDB 정리 작업 중 오류: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_mongodb())
