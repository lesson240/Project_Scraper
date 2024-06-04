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
import json

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
                    existing_codes = set()
                    collectiontime = date.today()
                    idx_counter = 1  # idx 값을 생성하기 위한 카운터

                    for info in area_info:
                        code = info["data-ref-onlbrndcd"]
                        name = info.text.strip()

                        if code not in existing_codes:
                            branddic = {
                                "idx": idx_counter,  # idx 값 생성
                                "code": code,
                                "brand": name,
                                "time": collectiontime.strftime("%Y년 %m월 %d일"),
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

    def __init__(self, code, brand):
        self.code = code
        self.brand = brand

    def unit_url(self, page_idx):
        url = f"{self.OLIVEYOUNG_URL}/store/display/getBrandShopDetailGoodsPagingAjax.do?onlBrndCd={self.code}&rowsPerPage=48&pageIdx={page_idx}"
        return url

    @staticmethod
    def extract_price(price_str):
        """Extracts price from string and converts to integer."""
        # '~' 문자를 공백으로 대체하여 제거합니다.
        cleaned_price = price_str.replace(",", "").replace("원", "").replace("~", "")
        return int(cleaned_price)

    async def fetch(self, url, accumulated_idx):
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
                                    "brand": self.brand,
                                    "brand_code": self.code,
                                    "code": goods_code,
                                    "name": goods_name,
                                    "price": self.extract_price(goods_total),
                                    "sold_out": goods_soldout,
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
                    # 첫 번째 케이스: strong 태그 확인
                    page_strong_tag = soup.select_one("div.pageing strong")

                    # 두 번째 케이스: data-page-no 속성을 가진 a 태그 확인
                    page_a_tags = soup.select("div.pageing a[data-page-no]")

                    if page_a_tags:
                        # data-page-no 속성이 가장 큰 값을 총 페이지 수로 간주
                        total_page = max(
                            int(tag["data-page-no"]) for tag in page_a_tags
                        )
                        return total_page
                    elif page_strong_tag:
                        total_page = int(page_strong_tag.text.strip())
                        return total_page
                    else:
                        print(
                            "Could not find the page number in the expected location."
                        )
                        return None

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
            products, accumulated_idx = await self.fetch(url, accumulated_idx)
            all_products.extend(products)
        return all_products


class SpecialToday:
    pass


class BrandGoodsDetail:
    """Function for scraping the detail page of the oliveryoung brand"""

    OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"

    def __init__(self, goodscode):
        self.goodscode = goodscode
        self.driver = None

    def unit_url(self):
        url = f"{self.OLIVEYOUNG_URL}/store/goods/getGoodsDetail.do?goodsNo={self.goodscode}"
        return url

    async def create_driver(self):
        if not self.driver:
            options = webdriver.ChromeOptions()
            options.add_argument("headless")  # no browser
            options.add_argument("window_size=1920x1080")  # --window-size=x,y
            options.add_argument("lang=ko_KR")
            options.add_argument("disable-gpu")  # gpu err 발생시 , --disable-gpu로 변경
            options.add_argument("mute-audio")  # --mute-audio
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            options.add_experimental_option("detach", True)
            self.driver = webdriver.Chrome(options=options)

    async def close_driver(self):
        if self.driver:
            self.driver.quit()

    @staticmethod
    def extract_price(price_str):
        """Extracts price from string and converts to integer."""
        # '~' 문자를 공백으로 대체하여 제거합니다.
        cleaned_price = price_str.replace(",", "").replace("원", "").replace("~", "")
        return int(cleaned_price)

    async def fetch(self):
        """Fetches product information from the given URL."""

        """scraping from a page of oliveyoung goods detail"""
        await self.create_driver()
        self.driver.get(self.unit_url())

        # DB 적재용 'key : value' setting
        elementlist = {
            "code": f"{self.goodscode}",
            "collectiontime": f"{date.today()}",
        }

        # 상품명 추출하는 함수
        goodsname = self.driver.find_element(
            By.XPATH, '//*[@id="Contents"]/div[2]/div[2]/div/p[2]'
        ).text.strip()
        elementlist["name"] = f"{goodsname}"

        # 가격 정보 추출하는 함수
        price_class = self.driver.find_elements(By.CLASS_NAME, "price")

        if len(price_class) == 1:
            goodspricelist = self.driver.find_element(By.CLASS_NAME, "price").text
            goodstotal = re.sub("(원|,|\n)", "", goodspricelist)
            elementlist["total_price"] = f"{goodstotal}"

        else:
            self.driver.find_element(By.ID, "btnSaleOpen").click()
            goodspricelist = self.driver.find_element(By.ID, "saleLayer").text
            sub_condition = re.sub(
                "(혜택|정보|판매가|원|최적가|레이어|닫기|\n)", " ", goodspricelist
            )
            replace_condition = {
                ",": "_",
                ".": "-",
                "(": "_",
                ")": "_",
                "~": "_",
                "-": "_",
            }
            condition_key = "".join(list(replace_condition.keys()))
            condition_value = "".join(list(replace_condition.values()))
            extract_value = (
                sub_condition.translate(str.maketrans(condition_key, condition_value))
                .replace("_", "")
                .strip()
                .split()
            )

            if "쿠폰" in extract_value:
                coupon = extract_value.index("쿠폰")
                del extract_value[coupon]
                del extract_value[coupon - 1]
                if "세일" in extract_value:
                    sale = extract_value.index("세일")
                    del extract_value[sale]
                    if len(extract_value) == 8:
                        elementlist["totalprice"] = f"{extract_value[7]}"
                        elementlist["goodsorigin"] = f"{extract_value[0]}"
                        elementlist["salestart"] = f"{extract_value[1]}"
                        elementlist["saleend"] = f"{extract_value[2]}"
                        elementlist["saleprice"] = f"{extract_value[3]}"
                        elementlist["couponstart"] = f"{extract_value[4]}"
                        elementlist["couponend"] = f"{extract_value[5]}"
                        elementlist["couponprice"] = f"{extract_value[6]}"
                    else:
                        return print("len_extract_value dose not match")
                else:
                    if len(extract_value) == 5:
                        elementlist["totalprice"] = f"{extract_value[4]}"
                        elementlist["goodsorigin"] = f"{extract_value[0]}"
                        elementlist["couponstart"] = f"{extract_value[1]}"
                        elementlist["couponend"] = f"{extract_value[2]}"
                        elementlist["couponprice"] = f"{extract_value[3]}"
                    else:
                        return print("len_extract_value dose not match")
            elif "세일" in extract_value:
                sale = extract_value.index("세일")
                del extract_value[sale]
                if len(extract_value) == 5:
                    elementlist["totalprice"] = f"{extract_value[4]}"
                    elementlist["goodsorigin"] = f"{extract_value[0]}"
                    elementlist["salestart"] = f"{extract_value[1]}"
                    elementlist["saleend"] = f"{extract_value[2]}"
                    elementlist["saleprice"] = f"{extract_value[3]}"
                else:
                    return print("len_extract_value dose not match")

        # 배송 정보 추출하는 함수  # 배송 정보 최적화 함수 만들기
        delivery_xpath = self.driver.find_elements(
            By.XPATH, '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li'
        )
        if len(delivery_xpath) == 1:
            goodsdelivery = self.driver.find_element(
                By.XPATH,
                '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li/div/b[1]',
            ).text
        else:
            goodsdelivery = self.driver.find_element(
                By.XPATH,
                '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li[1]/div',
            ).text

        elementlist["delivery"] = f"{goodsdelivery}"

        # 일시품절 text 추출 함수
        soldout_css = self.driver.find_element(
            By.CSS_SELECTOR, "div.prd_btn_area.new-style.type1"
        ).text
        sub_condition = re.sub("\n", " ", soldout_css).split()
        if sub_condition[0] == "일시품절":
            goodssoldout = "일시품절"
        else:
            goodssoldout = "판매"

        elementlist["solde_out"] = f"{goodssoldout}"

        # 썸네일(5개) src 추출 함수
        thumbcount = len(
            self.driver.find_elements(By.XPATH, '//*[@id="prd_thumb_list"]/li')
        )
        goodsthumb = {}
        for thumb in range(1, thumbcount + 1):
            self.driver.find_element(
                By.XPATH, f'//*[@id="prd_thumb_list"]/li[{thumb}]'
            ).click()
            thumburl = self.driver.find_element(By.ID, "mainImg").get_attribute("src")
            goodsthumb[f"thumb{thumb}"] = f"{thumburl}"
        elementlist["thumb"] = goodsthumb

        # 상품정보 제공고시 png 생성 함수
        btn_buyinfo = self.driver.find_element(By.ID, "buyInfo")
        if bool(btn_buyinfo) == True:
            btn_buyinfo.click()
            buy_info = self.driver.find_element(By.ID, "artcInfo")
            buy_info.screenshot(f"{self.goodscode}.png")
        else:
            pass

        return elementlist

    async def run(self):
        await self.create_driver()
        try:
            result = await self.fetch()
        finally:
            await self.close_driver()
        return result


async def scrape_goods(goods_codes):
    tasks = [BrandGoodsDetail(code).run() for code in goods_codes]
    return await asyncio.gather(*tasks)


# class BrandList 출력 test
# if __name__ == "__main__":
#     brand_list = BrandList.run()
# for brand in brand_list:
#     print(brand)
# print(type(brand_list))

# # class BrandShop 출력 test
if __name__ == "__main__":
    INPUNT_CODE = "A000149"
    BRAND = "아벤느"
    brand_shop = BrandShop(INPUNT_CODE, BRAND)
    products = asyncio.run(brand_shop.run())
    print(products)

# class BrandGoodsDetail 출력 test
# if __name__ == "__main__":
#     INPUT_CODES = ["A000000205905", "A000000166296"]
#     loop = asyncio.get_event_loop()
#     products = loop.run_until_complete(scrape_goods(INPUT_CODES))
#     print(json.dumps(products, indent=2, ensure_ascii=False))
