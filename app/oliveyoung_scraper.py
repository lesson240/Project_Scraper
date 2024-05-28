from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import aiohttp
import asyncio
import re
from datetime import date
import math
import time
import nest_asyncio

nest_asyncio.apply()


# import os
# import aiofiles
# from fake_useragent import UserAgent

# ua = UserAgent()
# ua.random


class BrandList:

    def unit_url():
        OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"
        url = f"{OLIVEYOUNG_URL}/store/main/getBrandList.do"
        return url

    async def fetch():
        async with aiohttp.ClientSession() as session:
            async with session.get(BrandList.unit_url()) as response:
                soup = BeautifulSoup(await response.text(), "html.parser")
                area_info = soup.select("a[data-ref-onlbrndcd]")
                branddics = []
                for info in area_info:
                    code = info["data-ref-onlbrndcd"]
                    name = info.text
                    collectiontime = date.today()
                    item = [i["code"] for i in branddics]

                    if code in item:
                        pass
                    else:
                        branddic = {
                            "code": f"{code}",
                            "brand": f"{name}",
                            "time": f"{collectiontime}",
                            "status": "Old",
                        }
                        branddics.append(branddic)
                await session.close()
            return branddics

    def run():
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(BrandList.fetch())


# class BrandShop:

#     OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"

#     @staticmethod
#     async def fetch(session, url, headers):
#         async with session.get(url, headers=headers) as response:
#             if response.status == 200:
#                 result = await response.json()
#                 return result["items"]

#     def unit_url(self, keyword, start):
#         return {
#             "url": f"{self.OLIVEYOUNG_URL}/store/main/getBrandList.do",
#             "headers": {
#                 "X-Naver-Client-Id": self.NAVER_API_ID,
#                 "X-Naver-Client-Secret": self.NAVER_API_SECRET,
#             },
#         }

#     async def search(self, keyword, total_page):
#         apis = [self.unit_url(keyword, 1 + i * 10) for i in range(total_page)]
#         async with aiohttp.ClientSession() as session:
#             all_data = await asyncio.gather(
#                 *[BrandList.fetch(session, api["url"], api["headers"]) for api in apis]
#             )
#             result = []
#             for data in all_data:
#                 if data is not None:
#                     for book in data:
#                         result.append(book)
#             return result

#     def run(self, keyword, total_page):
#         return asyncio.run(self.search(keyword, total_page))


class GoodsDetail:
    pass


class SpecialToday:
    pass


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    if loop.is_running():
        print("01")
    else:
        loop.run_until_complete(BrandList.fetch())
