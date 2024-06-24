# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.logging_config import setup_logger
from app.scrapers.scraper_settings import ScraperSettings

# 라이브러리 불러오기
from bs4 import BeautifulSoup
from aiohttp import ClientTimeout, ClientSession
import asyncio
import random
import nest_asyncio
import re
from datetime import datetime
import math
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

if "uvloop" in str(type(asyncio.get_event_loop())):
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

nest_asyncio.apply()


class WinnerPriceInquiry:
    """Function for scraping the winner price of the Coupang Goods Detail Page"""

    BASE_URL = "https://www.coupang.com"

    def __init__(self, goodscode, site_key):
        self.goodscode = goodscode
        self.site_key = site_key
        self.settings = self.get_settings()
        self.today = datetime.today()

    def get_settings(self):
        settings = ScraperSettings()
        return settings

    def unit_url(self):
        url = f"{self.BASE_URL}/vp/products/{self.goodscode}"
        return url

    def today_date(self):
        return self.today.strftime("%m/%d")

    def extract_date(self, goodsdelivery_element):
        for element in goodsdelivery_element:
            try:
                # 날짜 형식으로 변환을 시도
                datetime.strptime(element, "%m/%d")
                arrival_date = element
                break
            except ValueError:
                # 변환이 실패하면 다음 항목으로 이동
                continue
        else:
            raise ValueError("No valid date found in the list")

        return arrival_date

    def calculate_date_difference(self, arrival_date):
        target_date = datetime.strptime(arrival_date, "%m/%d")
        # 주어진 날짜의 연도를 현재 연도로 설정
        target_date = target_date.replace(year=self.today.year)
        # 날짜 차이 계산
        difference = (target_date - self.today).total_seconds() / (24 * 3600)
        difference = math.ceil(difference)
        return difference

    async def fetch_with_retries(
        self, url: str, max_retries: int = 3, delay_range: tuple = (1, 3)
    ):
        for attempt in range(max_retries):
            headers = self.settings.get_headers(self.site_key)
            try:
                timeout = ClientTimeout(total=3)
                async with ClientSession(timeout=timeout) as session:
                    async with session.get(url, headers=headers) as response:
                        if response.status == 200:
                            self.settings.save_successful_user_agent(
                                self.site_key, headers["User-Agent"]
                            )
                            html_content = await response.text()
                            if not html_content:
                                raise Exception("Empty content")
                            return html_content
                        else:
                            logger.error(
                                f"Failed to retrieve content: {response.status}"
                            )
                            self.settings.remove_user_agent(
                                self.site_key, headers["User-Agent"]
                            )
            except asyncio.TimeoutError:
                logger.error("The request timed out")
                self.settings.remove_user_agent(self.site_key, headers["User-Agent"])
            except Exception as e:
                logger.error(f"An error occurred while fetching data: {e}")
                self.settings.remove_user_agent(self.site_key, headers["User-Agent"])

            logger.info(f"Retrying ({attempt + 1}/{max_retries})...")
            await asyncio.sleep(random.uniform(*delay_range))

    async def fetch(self, url: str):
        """Fetches product information from the given URL."""
        html_content = await self.fetch_with_retries(url)
        if html_content:
            soup = BeautifulSoup(html_content, "html.parser")
            area_info = soup.select_one("div[class=prod-atf-main]")

            if not area_info:
                raise Exception("Empty area_info")

            elementlist = {}

            # 가격 정보 추출하는 함수
            goodstotalprice_element = area_info.select_one("span.total-price")
            if goodstotalprice_element:
                goodstotal = re.sub("(원|,|\n)", "", goodstotalprice_element.text)
            else:
                goodstotal = "none"
                logger.error("Failed to scrap the goodstotalprice")

            # 배송 정보 추출하는 함수
            goodsdelivery_element = area_info.select_one(
                "div[class=prod-shipping-fee]"
            ).text.split()
            if len(goodsdelivery_element) > 0:
                goodsdelivery = goodsdelivery_element[0]
            else:
                goodsdelivery = "none"
                logger.error("Failed to scrap the goodsdelivery")

            # 배송 소요일 추출하는 함수
            goodsdeliveryday_element = area_info.select_one(
                "div[class=prod-pdd-container]"
            ).text.split()
            if len(goodsdeliveryday_element) > 1:
                arrival_date = self.extract_date(goodsdeliveryday_element)
                goodsdeliveryday = self.calculate_date_difference(arrival_date)

            else:
                goodsdeliveryday = "none"
                logger.error("Failed to scrap the goodsdeliverytime")

            # 결과를 elementlist에 저장
            elementlist["total_price"] = goodstotal
            elementlist["delivery"] = goodsdelivery
            elementlist["deliveryday"] = goodsdeliveryday

            return elementlist
        else:
            logger.error("Failed to retrieve content after retries")
            return None

    async def run(self):
        """Runs the scraping process."""
        result = await self.fetch(self.unit_url())
        return result


# class WinnerPriceInquiry 출력 test
if __name__ == "__main__":
    INPUNT_CODE = "8168223189"
    SITE_KEY = "coupang"
    scrap_func = WinnerPriceInquiry(INPUNT_CODE, SITE_KEY)
    products = asyncio.run(scrap_func.run())
    print(products)
