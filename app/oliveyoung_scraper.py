import re
import math
from datetime import date
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import aiohttp
import asyncio
from datetime import date
from datetime import datetime
import nest_asyncio

nest_asyncio.apply()


# import os
# import aiofiles
# from fake_useragent import UserAgent

# ua = UserAgent()
# ua.random


class BrandList:
    """Function for scraping the brand list of the oliveyoung"""

    @staticmethod
    def unit_url():
        OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"
        url = f"{OLIVEYOUNG_URL}/store/main/getBrandList.do"
        return url

    @staticmethod
    async def fetch():

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(BrandList.unit_url()) as response:
                    soup = BeautifulSoup(await response.text(), "html.parser")
                    area_info = soup.select("a[data-ref-onlbrndcd]")
                    # 데이터를 저장할 리스트
                    branddics = []

                    existing_codes = {item["code"] for item in branddics}
                    collectiontime = datetime.now()
                    idx_counter = 1  # idx 값을 생성하기 위한 카운터

                    for info in area_info:
                        code = info["data-ref-onlbrndcd"]
                        name = info.text.strip()

                        if code not in existing_codes:
                            branddic = {
                                "idx": idx_counter,  # idx 값 생성
                                "code": code,
                                "brand": name,
                                "time": str(collectiontime),
                                "status": "Old",
                            }
                            branddics.append(branddic)
                            existing_codes.add(code)
                            idx_counter += 1  # 다음 idx 값을 위해 카운터 증가
            return branddics

        except Exception as e:
            print(f"An error occurred: {e}")
            return []

    @staticmethod
    def run():
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(BrandList.fetch())


class BrandShop:
    """Function for scraping the detail page of the oliveryoung brand shop"""

    OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"

    def __init__(self, code):
        self.code = code

    def unit_url(self, page_idx):
        url = f"{self.OLIVEYOUNG_URL}/store/display/getBrandShopDetailGoodsPagingAjax.do?onlBrndCd={self.code}&rowsPerPage=48&pageIdx={page_idx}"
        return url

    @staticmethod
    def extract_price(price_str):
        """Extracts price from string and converts to integer."""
        # '~' 문자를 공백으로 대체하여 제거합니다.
        cleaned_price = price_str.replace(",", "").replace("원", "").replace("~", "")
        return int(cleaned_price)

    async def fetch(self, url, page_idx, accumulated_idx):
        """Fetches product information from the given URL."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    soup = BeautifulSoup(await response.text(), "html.parser")

                    area_info = soup.select("div[class=prod]")
                    products = []

                    for info in area_info:
                        goods_code_elem = info.select_one("a")
                        goods_code = (
                            goods_code_elem.attrs.get("data-ref-goodsno")
                            if goods_code_elem
                            else None
                        )

                        goods_name_elem = info.select_one("span.prod-name.double-line")
                        goods_total_elem = info.select_one("strong.total")
                        goods_soldout_elem = info.select_one("span.status_flag.soldout")
                        goods_sale_elem = info.select_one("span.flag.sale")
                        goods_coupon_elem = info.select_one("span.flag.coupon")

                        if goods_name_elem and goods_total_elem:
                            goods_name = goods_name_elem.text.strip()
                            goods_total = goods_total_elem.text.strip()

                            goods_soldout = (
                                goods_soldout_elem.text.strip()
                                if goods_soldout_elem
                                else None
                            )
                            goods_sale = (
                                goods_sale_elem.text.strip()
                                if goods_sale_elem
                                else None
                            )
                            goods_coupon = (
                                goods_coupon_elem.text.strip()
                                if goods_coupon_elem
                                else None
                            )

                            collectiontime = date.today()
                            idx = accumulated_idx + 1

                            products.append(
                                {
                                    "idx": idx,
                                    "code": goods_code,
                                    "name": goods_name,
                                    "price": self.extract_price(goods_total),
                                    "soldout": goods_soldout,
                                    "sale": goods_sale,
                                    "coupon": goods_coupon,
                                    "time": collectiontime.strftime("%Y년 %m월 %d일"),
                                }
                            )
                            accumulated_idx += 1

                    return products, accumulated_idx

        except Exception as e:
            print(f"An error occurred: {e}")
            return [], accumulated_idx

    async def get_total_page(self):
        """Fetches the total number of pages."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.unit_url(1)) as response:
                    soup = BeautifulSoup(await response.text(), "html.parser")
                    total_page = int(soup.select("a[data-page-no]")[-1].text.strip())
                    return total_page

        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    async def run(self):
        """Runs the scraping process."""
        total_page = await self.get_total_page()
        if total_page is None:
            return []

        all_products = []
        accumulated_idx = 0
        for page_idx in range(1, total_page + 1):
            url = self.unit_url(page_idx)
            products, accumulated_idx = await self.fetch(url, page_idx, accumulated_idx)
            all_products.extend(products)
        return all_products


class SpecialToday:
    pass


# class BrandList 출력 test
# if __name__ == "__main__":
#     brand_list = BrandList.run()
# for brand in brand_list:
#     print(brand)
# print(type(brand_list))
# class BrandShop 출력 test
if __name__ == "__main__":
    INPUNT_CODE = "A000003"
    brand_shop = BrandShop(INPUNT_CODE)
    products = asyncio.run(brand_shop.run())
    print(products)
