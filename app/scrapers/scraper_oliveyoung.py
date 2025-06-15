# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.scrapers.scraper_settings import ScraperSettings

# 라이브러리 불러오기
import re
import math
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
from aiohttp import ClientTimeout, ClientSession
import aiohttp
import asyncio
import nest_asyncio
from datetime import date, datetime
import random
import json
import time
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)

if "uvloop" in str(type(asyncio.get_event_loop())):
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

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
            logger.info("class of BrandList: Brand list fetched successfully.")
            return branddics

        except Exception as e:
            logger.error(f"class of BrandList:An error occurred: {e}")
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
                                    "origin_goods_code": goods_code,
                                    "origin_goods_name": goods_name,
                                    "total_price": self.extract_price(goods_total),
                                    "sold_out": goods_soldout,
                                    "sale": goods_sale,
                                    "coupon": goods_coupon,
                                    "collection_time": collectiontime.strftime(
                                        "%Y년 %m월 %d일"
                                    ),
                                }
                            )
                            accumulated_idx += 1
                    logger.info(
                        f"class of BrandShop:Fetched {len(products)} products from URL: {url}"
                    )
                    return products, accumulated_idx

        except Exception as e:
            logger.error(f"class of BrandShop:An error occurred: {e}")
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
                        logger.info(f"class of BrandShop:Total pages: {total_page}")
                        return total_page
                    elif page_strong_tag:
                        total_page = int(page_strong_tag.text.strip())
                        logger.info(f"class of BrandShop:Total pages: {total_page}")
                        return total_page
                    else:
                        logger.warning(
                            f"class of BrandShop:Could not find the page number in the expected location."
                        )
                        return None

        except Exception as e:
            logger.error(f"class of BrandShop:An error occurred: {e}")
            return None

    async def run(self):
        """Runs the scraping process."""
        total_page = await self.get_total_page()
        if total_page is None:
            logger.warning(
                f"class of BrandShop:Total page number is None, exiting run."
            )
            return []

        all_products = []
        accumulated_idx = 0
        for page_idx in range(1, total_page + 1):
            url = self.unit_url(page_idx)
            products, accumulated_idx = await self.fetch(url, accumulated_idx)
            all_products.extend(products)
            logger.info(
                f"class of BrandShop:Total products fetched: {len(all_products)}"
            )
        return all_products


class SpecialToday:
    """Function for scraping the page of the oliveryoung special today"""

    BASE_URL = "https://www.oliveyoung.co.kr"

    def __init__(self, site_key):
        self.site_key = site_key
        self.settings = self.get_settings()
        self.driver = None

    def get_settings(self):
        settings = ScraperSettings()
        return settings

    def unit_urls(self):
        url = f"{self.BASE_URL}/store/main/getHotdealList.do"
        return url

    def create_driver(self):
        if not self.driver:
            options = webdriver.ChromeOptions()
            options.add_argument("headless")  # no browser
            options.add_argument("window_size=1920x1080")  # --window-size=x,y
            options.add_argument("lang=ko_KR")
            options.add_argument("disable-gpu")  # gpu err 발생시 , --disable-gpu로 변경
            options.add_argument("mute-audio")  # --mute-audio
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            options.add_experimental_option("detach", True)
            self.driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()), options=options
            )

    def close_driver(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

    def scroll_down(self):
        """Scroll down the page to load all contents."""
        last_height = self.driver.execute_script("return document.body.scrollHeight")

        while True:
            self.driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);"
            )
            time.sleep(2)  # Wait for the page to load
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    def fetch(self):
        """Fetches product information from the given URL."""
        url = self.unit_urls()
        self.driver.get(url)
        self.scroll_down()
        html_content = self.driver.page_source

        soup = BeautifulSoup(html_content, "html.parser")
        area_info = soup.find_all("div", class_="prod")
        # DB 적재용 'key : value' setting
        elementlist = []
        for idx_element, info in enumerate(area_info):
            brand_element = info.find("button", {"data-ref-goodsbrand": True}).get(
                "data-ref-goodsbrand", ""
            )
            origin_goods_code_element = info.find(
                "button", {"data-ref-goodsno": True}
            ).get("data-ref-goodsno", "")
            origin_goods_name_element = info.find(
                "span", class_="prod-name double-line"
            ).text.strip()
            goods_total_price_element = re.sub(
                r"(원|,|~|\n)", "", info.find("strong", class_="total").text.strip()
            )
            sold_out_element = (
                info.find("span", class_="status_flag soldout").text
                if info.find("span", class_="status_flag soldout")
                else "판매"
            )
            sale_element = (
                info.find("span", class_="flag sale").text
                if info.find("span", class_="flag sale")
                else "없음"
            )
            coupon_element = (
                info.find("span", class_="flag coupon").text
                if info.find("span", class_="flag coupon")
                else "없음"
            )

            product_info = {
                "idx": f"{idx_element + 1}",
                "market": "올리브영",
                "brand": brand_element,
                "origin_goods_code": origin_goods_code_element,
                "origin_goods_name": origin_goods_name_element,
                "total_price": goods_total_price_element,
                "sold_out": sold_out_element,
                "sale": sale_element,
                "coupon": coupon_element,
                "collection_time": date.today(),
            }

            elementlist.append(product_info)
        return elementlist

    def run(self):
        """Runs the scraping process."""
        self.create_driver()
        try:
            result = self.fetch()  # 동기 함수 fetch를 비동기로 호출
        finally:
            self.close_driver()
        return result


class BrandGoodsDetail:
    """Function for scraping the detail page of the oliveryoung brand"""

    OLIVEYOUNG_URL = "https://www.oliveyoung.co.kr"

    def __init__(self, goods_codes):
        self.goods_codes = goods_codes
        self.driver = None

    def unit_url(self, goods_code):
        url = (
            f"{self.OLIVEYOUNG_URL}/store/goods/getGoodsDetail.do?goodsNo={goods_code}"
        )
        return url

    async def create_driver(self):
        if not self.driver:
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")  # no browser
            options.add_argument("--window_size=1920x1080")  # --window-size=x,y
            options.add_argument("--lang=ko_KR")
            options.add_argument(
                "--disable-gpu"
            )  # gpu err 발생시 , --disable-gpu로 변경
            options.add_argument("--mute-audio")  # --mute-audio
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            options.add_experimental_option("detach", True)

            # self.driver = webdriver.Chrome(
            #     service=ChromeService(ChromeDriverManager().install()), options=options
            # )
            service = Service()
            self.driver = webdriver.Chrome(service=service, options=options)

    async def close_driver(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

    async def retry_fetch(self, failed_codes):
        logger.info(f"Retrying for failed codes: {failed_codes}")
        retry_results = []
        for goods_code in failed_codes:
            result = await self.fetch(goods_code)
            if result:
                retry_results.append(result)
        return retry_results

    @staticmethod
    def extract_price(price_str):
        """Extracts price from string and converts to integer."""
        # '~' 문자를 공백으로 대체하여 제거합니다.
        cleaned_price = price_str.replace(",", "").replace("원", "").replace("~", "")
        return int(cleaned_price)

    async def fetch(self, goods_code):
        """scraping from a page of oliveyoung goods detail"""
        await self.create_driver()
        self.driver.get(self.unit_url(goods_code))
        waiting_time = 10
        # DB 적재용 'key : value' setting
        elementlist = {
            "origin_goods_code": f"{goods_code}",
            "collection_time": f"{date.today()}",
        }
        try:
            # 브랜드명/브랜드 코드 추출하는 함수
            brandname_element = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#onlBrndNm"))
            )
            brandname = brandname_element.get_attribute("value")
            elementlist["brand_name"] = f"{brandname}"

            brandcode_element = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#onlBrndCd"))
            )
            brandcode = brandcode_element.get_attribute("value")
            elementlist["brand_code"] = f"{brandcode}"

            # 상품명 추출하는 함수
            goodsname_element = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_element_located(
                    (By.XPATH, '//*[@id="Contents"]/div[2]/div[2]/div/p[2]')
                )
            )
            goodsname = goodsname_element.text.strip()
            elementlist["origin_goods_name"] = f"{goodsname}"

            # 상품 url 추출하는 함수
            # elementlist["goods_url"] = f"{self.unit_url()}"

            # 가격 정보 추출하는 함수
            WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_element_located((By.CLASS_NAME, "price"))
            )
            price_class = self.driver.find_elements(By.CLASS_NAME, "price")
            if len(price_class) == 1:
                goodspricelist = self.driver.find_element(By.CLASS_NAME, "price").text
                goodstotal = self.extract_price(goodspricelist)
                elementlist["total_price"] = f"{goodstotal}"
            else:
                # 혜택 정보 추출 함수
                self.driver.find_element(By.ID, "btnSaleOpen").click()

                # saleLayer가 나타날 때까지 대기
                WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located((By.ID, "saleLayer"))
                )

                # saleLayer의 텍스트를 가져오기
                goodspricelist = self.driver.find_element(By.ID, "saleLayer").text

                # 불필요한 단어와 기호 제거
                sub_condition = re.sub(
                    r"(혜택|정보|판매가|원|최적가|레이어|닫기|\n)", " ", goodspricelist
                )

                # 문자열 치환 조건 설정
                replace_condition = {
                    ",": "_",
                    ".": "-",
                    "(": "_",
                    ")": "_",
                    "~": "_",
                    "-": "_",
                }

                # 치환 조건을 적용하여 문자열 정리
                extract_value = (
                    sub_condition.translate(str.maketrans(replace_condition))
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
                            elementlist["total_price"] = f"{extract_value[7]}"
                            elementlist["goods_origin"] = f"{extract_value[0]}"
                            elementlist["sale_start"] = f"{extract_value[1]}"
                            elementlist["sale_end"] = f"{extract_value[2]}"
                            elementlist["sale_price"] = f"{extract_value[3]}"
                            elementlist["coupon_start"] = f"{extract_value[4]}"
                            elementlist["coupon_end"] = f"{extract_value[5]}"
                            elementlist["coupon_price"] = f"{extract_value[6]}"
                            elementlist["sale"] = "세일"
                            elementlist["coupon"] = "쿠폰"

                        else:
                            logger.warning(
                                "class of BranGoodsDetail:len_extract_value does not match"
                            )
                    else:
                        if len(extract_value) == 5:
                            elementlist["total_price"] = f"{extract_value[4]}"
                            elementlist["goods_origin"] = f"{extract_value[0]}"
                            elementlist["coupon_start"] = f"{extract_value[1]}"
                            elementlist["coupon_end"] = f"{extract_value[2]}"
                            elementlist["coupon_price"] = f"{extract_value[3]}"
                            elementlist["coupon"] = "쿠폰"
                            elementlist["sale"] = "없음"

                        else:
                            logger.warning(
                                "class of BranGoodsDetail:len_extract_value does not match"
                            )
                elif "세일" in extract_value:
                    sale = extract_value.index("세일")
                    del extract_value[sale]
                    if len(extract_value) == 5:
                        elementlist["total_price"] = f"{extract_value[4]}"
                        elementlist["goods_origin"] = f"{extract_value[0]}"
                        elementlist["sale_start"] = f"{extract_value[1]}"
                        elementlist["sale_end"] = f"{extract_value[2]}"
                        elementlist["sale_price"] = f"{extract_value[3]}"
                        elementlist["coupon"] = "없음"
                        elementlist["sale"] = "세일"

                    else:
                        logger.warning(
                            "class of BranGoodsDetail:len_extract_value does not match"
                        )
                else:
                    elementlist["total_price"] = f"{extract_value[4]}"
                    elementlist["goods_origin"] = f"{extract_value[0]}"
                    elementlist["coupon"] = "없음"
                    elementlist["sale"] = "없음"

            # # 2+1, 세일, 쿠폰, 증정 등 행사 유무 정보를 추출하는 함수
            # goods_promotion_element = WebDriverWait(self.driver, waiting_time).until(
            #     EC.presence_of_element_located((By.XPATH, '//*[@id="icon_area"]'))
            # )
            # goods_promotion_dict = {}

            # # "\n"을 기준으로 split 하여 딕셔너리에 저장
            # goods_promotion_line = goods_promotion_element.text.split("\n")

            # if goods_promotion_line:
            #     for idx, line in enumerate(goods_promotion_line, start=1):
            #         goods_promotion_dict[f"프로모션{idx}"] = line.strip()

            # # 결과를 elementlist에 저장
            # elementlist["goods_promotion"] = goods_promotion_dict

            # 배송 정보 추출하는 함수
            delivery_xpath = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_all_elements_located(
                    (
                        By.XPATH,
                        '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li',
                    )
                )
            )

            # 배송 정보 추출 및 딕셔너리로 저장
            goodsdelivery_dict = {}

            if len(delivery_xpath) == 1:
                goodsdelivery_element = WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located(
                        (
                            By.XPATH,
                            '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li',
                        )
                    )
                )
                delivery_text = goodsdelivery_element.text
            else:
                goodsdelivery_element = WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located(
                        (
                            By.XPATH,
                            '//*[@id="Contents"]/div[2]/div[2]/div/div[3]/div[1]/ul/li[1]/div',
                        )
                    )
                )
                delivery_text = goodsdelivery_element.text

            # "\n"을 기준으로 split 하여 딕셔너리에 저장
            delivery_lines = delivery_text.split("\n")
            for idx, line in enumerate(delivery_lines, start=1):
                goodsdelivery_dict[f"배송정보{idx}"] = line.strip()

            # 결과를 elementlist에 저장
            elementlist["delivery"] = goodsdelivery_dict

            # 옵션 정보 추출 함수
            option_class = self.driver.find_elements(By.ID, "buy_option_box")
            goodsoptions = {}
            if len(option_class) == 1:
                self.driver.find_element(By.ID, "buy_option_box").click()
                WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "option_value"))
                )
                options_list = self.driver.find_element(By.ID, "option_list")
                options = options_list.find_elements(By.TAG_NAME, "li")
                for option in options:
                    option_value_text = option.find_element(
                        By.CLASS_NAME, "option_value"
                    ).text
                    option_value_element = option_value_text.split("\n")

                    if len(option_value_element) == 2:
                        option_value = option_value_element[0].strip()
                        option_price = re.sub(
                            "[원,]", "", option_value_element[1].strip()
                        )
                    else:
                        option_value = option_value_text
                        option_price = ""
                    goodsoptions[f"{option_value}"] = option_price
                elementlist["option"] = goodsoptions

            # 일시품절 text 추출 함수
            soldout_css_element = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "div.prd_btn_area.new-style.type1")
                )
            )
            soldout_css = soldout_css_element.text.strip()
            sub_condition = re.sub("\n", " ", soldout_css).split()
            elementlist["sold_out"] = (
                "일시품절" if sub_condition[0] == "일시품절" else "판매"
            )

            # 썸네일(5개) src 추출 함수
            thumbcount_element = WebDriverWait(self.driver, waiting_time).until(
                EC.presence_of_all_elements_located(
                    (By.XPATH, '//*[@id="prd_thumb_list"]/li')
                )
            )
            thumbcount = len(thumbcount_element)
            goodsthumb = {}
            for thumb in range(1, thumbcount + 1):
                WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located(
                        (By.XPATH, f'//*[@id="prd_thumb_list"]/li[{thumb}]')
                    )
                ).click()
                thumburl_element = WebDriverWait(self.driver, waiting_time).until(
                    EC.presence_of_element_located((By.ID, "mainImg"))
                )
                thumburl = thumburl_element.get_attribute("src")
                goodsthumb[f"thumb{thumb}"] = thumburl
            elementlist["thumb"] = goodsthumb

            # 상품정보 제공고시 png 생성 함수
            # btn_buyinfo = self.driver.find_element(By.ID, "buyInfo")
            # if bool(btn_buyinfo) == True:
            #     btn_buyinfo.click()
            #     buy_info = self.driver.find_element(By.ID, "artcInfo")
            #     buy_info.screenshot(f"{self.goodscode}.png")
            # else:
            #     pass

            return elementlist

        except TimeoutException as e:
            logger.error(
                f"Timeout occurred during fetching for goods_code: {goods_code} - {e}"
            )
            return None
        except Exception as e:
            logger.error(
                f"An error occurred during fetching for goods_code: {goods_code} - {e}"
            )
            return None

    async def run(self):
        await self.create_driver()
        try:
            # print(self.goods_codes)
            goods_codes_list = list(self.goods_codes)
            tasks = [self.fetch(goods_code) for goods_code in goods_codes_list]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            failed_codes = []
            successful_results = []
            for idx, result in enumerate(results):
                if isinstance(result, Exception) or result is None:
                    logger.error(
                        f"Failed to fetch details for goods_code: {goods_codes_list[idx]} - {result}"
                    )
                    failed_codes.append(goods_codes_list[idx])
                else:
                    successful_results.append(result)
            # print(failed_codes)
            # Retry fetching for failed codes
            max_retries = 2
            attempt = 1
            while attempt <= max_retries and failed_codes:
                logger.info(f"Retry attempt {attempt} for failed codes: {failed_codes}")
                retry_results = await self.retry_fetch(failed_codes)
                logger.debug(f"Retry results: {retry_results}")

                successful_results.extend(
                    [result for result in retry_results if result is not None]
                )

                # Update failed_codes with those that failed again
                new_failed_codes = []
                for idx, code in enumerate(failed_codes):
                    if idx < len(retry_results) and retry_results[idx] is None:
                        new_failed_codes.append(code)
                failed_codes = new_failed_codes
                logger.info(f"Failed codes after attempt {attempt}: {failed_codes}")
                attempt += 1
            return successful_results
        finally:
            await self.close_driver()


# class BrandList 출력 test
# if __name__ == "__main__":
#     brand_list = BrandList.run()
# for brand in brand_list:
#     print(brand)
# print(type(brand_list))

# class BrandShop 출력 test
# if __name__ == "__main__":
#     INPUNT_CODE = "A000149"
#     BRAND = "아벤느"
#     brand_shop = BrandShop(INPUNT_CODE, BRAND)
#     products = asyncio.run(brand_shop.run())
#     print(products)

# class BrandGoodsDetail 출력 test
if __name__ == "__main__":
    INPUT_CODES = ["A000000223761"]
    # INPUT_CODES = [
    #     "A000000180506",
    #     "A000000190321",
    #     "B000000140968",
    #     "A000000159504",
    #     "B000000206526",
    #     "A000000204123",
    #     "A000000202491",
    #     "A000000206474",
    #     "A000000207130",
    #     "A000000202343",
    #     "A000000200397",
    #     "A000000207456",
    #     "A000000191798",
    #     "A000000206971",
    #     "A000000128051",
    #     "A000000188737",
    #     "A000000205407",
    #     "A000000159648",
    #     "A000000158469",
    #     "A000000200646",
    #     "A000000181223",
    #     "A000000207112",
    #     "A000000206155",
    #     "A000000205746",
    #     "A000000201103",
    # ]
    scrap_func = BrandGoodsDetail(INPUT_CODES)
    loop = asyncio.get_event_loop()
    successful_results = loop.run_until_complete(scrap_func.run())
    products = json.dumps(successful_results, indent=2, ensure_ascii=False)

    print(products)

# class SpecialToday 출력 test
# if __name__ == "__main__":
#     SITE_KEY = "oliveyoung"
#     scrap_func = SpecialToday(SITE_KEY)
#     products = scrap_func.run()
#     print(products)
