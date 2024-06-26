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


# import os
# import aiofiles
# from fake_useragent import UserAgent

# ua = UserAgent()
# ua.random


class BrandList:

    NAVER_API_BOOK = "https://openapi.naver.com/v1/search/book"

    @staticmethod
    async def fetch(session, url, headers):
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                return result["items"]

    def unit_url(self, keyword, start):
        return {
            "url": f"{self.NAVER_API_BOOK}?query={keyword}&display=10&start={start}",
            "headers": {
                "X-Naver-Client-Id": self.NAVER_API_ID,
                "X-Naver-Client-Secret": self.NAVER_API_SECRET,
            },
        }

    async def search(self, keyword, total_page):
        apis = [self.unit_url(keyword, 1 + i * 10) for i in range(total_page)]
        async with aiohttp.ClientSession() as session:
            all_data = await asyncio.gather(
                *[BrandList.fetch(session, api["url"], api["headers"]) for api in apis]
            )
            result = []
            for data in all_data:
                if data is not None:
                    for book in data:
                        result.append(book)
            return result

    def run(self, keyword, total_page):
        return asyncio.run(self.search(keyword, total_page))


if __name__ == "__main__":
    scraper = BrandList()
    print(scraper.run("파이썬", 3))
