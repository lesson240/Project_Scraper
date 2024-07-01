import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.utils.util_websocket import (
    ProfileManager,
    BrowserManager,
    ChromePathManager,
    ChromeExPathManager,
    ChromeProfilePathManager,
    PuppeteerManager,
)
from app.services.service_mongodb import mongodb_service

# 라이브러리 불러오기
from selenium import webdriver
from pyppeteer import connect
import asyncio
import os

# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)


class Session:
    def __init__(self, user_id, site_name, url):
        self.user_id = user_id
        self.url = url
        self.site_name = site_name
        self.profile_manager = ProfileManager(refresh_interval_days=1)
        self.chrome_path_manager = ChromePathManager()
        self.chrome_ex_path_manager = ChromeExPathManager()
        self.chrome_profile_path_manager = ChromeProfilePathManager()
        self.browser_manager = BrowserManager()
        self.browser = None
        self.page = None

    async def start_browser(self):
        """기존 브라우저 Profile을 통해 웹소켓 통신을 합니다"""
        chrome_path = await self.chrome_path_manager.get_chrome_path(self.user_id)
        if not chrome_path:
            logger.error(f"No valid Chrome path found for user {self.user_id}.")
            return

        profile_path = await self.chrome_profile_path_manager.get_profile_path(
            self.user_id
        )
        if not profile_path:
            logger.error(f"No valid profile path found for user {self.user_id}.")
            return

        extension_path = await self.chrome_ex_path_manager.get_extension_path(
            self.user_id, "ieelmcmcagommplceebfedjlakkhpden"
        )
        if not extension_path:
            logger.error(f"No valid extension path found for user {self.user_id}.")
            return

        try:
            # 1. 서브프로세스를 통해 디버그 모드이자 헤드리스 모드인 브라우저를 실행
            websocket_url = self.browser_manager.start_chrome_with_profile(
                chrome_path, extension_path, profile_path, self.url, headless=True
            )

            await asyncio.sleep(2)  # 브라우저가 완전히 실행될 때까지 대기

            # 2. load_browser_data를 통해 특정 url을 열고, 세션정보를 반영하여 화면을 유지
            session_loaded = await self.browser_manager.load_browser_data(
                self.url, self.user_id, self.site_name
            )

            # 3. 만약 세션 정보가 없다면 헤드리스 모드를 해제해서 유저에게 로그인 화면을 보여줌
            if not session_loaded:
                logger.info(
                    "No session data found. Switching to non-headless mode for user login."
                )

                # 1) websocket_url 의 창을 강제로 닫기
                await self.close_browser()

                # 2) 헤드리스 모드를 해제한 websocket_url_first 창을 유저에게 보여주기
                websocket_url_first = self.browser_manager.start_chrome_with_profile(
                    chrome_path, extension_path, profile_path, self.url, headless=False
                )
                await asyncio.sleep(5)

                # 3) 로그인 대기 시간 및 재시도 횟수 설정
                logger.info(
                    f"{websocket_url_first}, {self.url}, {self.user_id}, {self.site_name}"
                )
                login_successful = await self.browser_manager.save_browser_data(
                    websocket_url_first,
                    self.url,
                    self.user_id,
                    self.site_name,
                    timeout=5,
                    retries=3,
                )

                # 만약 세션 정보를 저장하지 않았다면 그대로 start_browser(self) 함수 종료
                if not login_successful:
                    logger.error("Failed to obtain login session data.")
                    return

            # 6. 로그인 세션 정보를 저장했다면, 서브프로세스를 통해 디버그 모드이자 헤드리스 모드인 또다른 브라우저를 실행
            websocket_url_work = self.browser_manager.start_chrome_with_profile(
                chrome_path, extension_path, profile_path, self.url, headless=True
            )
            await asyncio.sleep(5)

            # 7. load_browser_data를 통해 특정 url을 열고 세션을 유지
            session_loaded = await self.browser_manager.load_browser_data(
                self.url, self.user_id, self.site_name
            )
            if not session_loaded:
                logger.error("Failed to load session data in headless mode.")
                return

            # 8. 웹소켓통신과 피펫티어를 통해 브라우저를 조작하는 부분
            self.browser = await connect(browserWSEndpoint=websocket_url_work)
            self.page = await self.browser.pages()
            if not self.page:
                self.page = await self.browser.newPage()
            else:
                self.page = self.page[0]

        except Exception as e:
            logger.error(f"Error starting browser: {e}")

    async def get_browser_ws_endpoint(self):
        """디버그 모드로 실행된 브라우저의 WebSocket URL을 동적으로 가져옵니다."""
        try:
            response = await asyncio.wait_for(
                connect(browserWSEndpoint="ws://localhost:9222/json/version"),
                timeout=10,
            )
            browser_ws_endpoint = response["webSocketDebuggerUrl"]
            logger.info(f"WebSocket URL: {browser_ws_endpoint}")
            return browser_ws_endpoint
        except Exception as e:
            logger.error(f"Error getting WebSocket URL: {e}")
            return None

    async def load_session(self):
        """세션을 로드하고 쿠키와 로컬 스토리지 데이터를 적용합니다."""
        cookies_data = await self.profile_manager.get_profile_data(
            self.user_id, self.site_name
        )
        if cookies_data:
            await self.page.setCookie(*cookies_data["cookies"])
            await self.page.evaluate(
                """(local_storage) => {
                    for (const [key, value] of Object.entries(local_storage)) {
                        localStorage.setItem(key, value);
                    }
                }""",
                cookies_data["local_storage"],
            )
            logger.info(
                f"Session loaded for user {self.user_id} on site {self.site_name}."
            )
        else:
            logger.warning(
                f"No cookies found for user {self.user_id} on site {self.site_name}."
            )

    async def save_session(self):
        """쿠키와 로컬 스토리지 데이터를 저장합니다."""
        cookies = await self.page.cookies()
        local_storage = await self.page.evaluate(
            """() => {
                let items = {}; 
                for (let i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);
                    items[key] = localStorage.getItem(key);
                }
                return items;
            }"""
        )
        await self.cookies_manager.save_cookies(
            self.user_id, self.site_name, cookies, local_storage
        )

    async def navigate_to_url(self, url):
        """지정된 URL로 이동합니다."""
        if self.page:
            await self.page.goto(url)
            logger.info(f"Navigated to {url} for user {self.user_id}.")
        else:
            logger.error(f"Page is not initialized for user {self.user_id}.")

    async def click_button(self, selector):
        """지정된 셀렉터의 버튼을 클릭합니다."""
        if self.page:
            await self.page.click(selector)
            logger.info(
                f"Clicked button with selector {selector} for user {self.user_id}."
            )
        else:
            logger.error(f"Page is not initialized for user {self.user_id}.")

    async def input_text(self, selector, text):
        """지정된 셀렉터에 텍스트를 입력합니다."""
        if self.page:
            await self.page.type(selector, text)
            logger.info(
                f"Input text into field with selector {selector} for user {self.user_id}."
            )
        else:
            logger.error(f"Page is not initialized for user {self.user_id}.")

    async def close_browser(self):
        """브라우저를 닫습니다."""
        if self.browser:
            await self.browser.close()
            logger.info(f"Browser closed for user {self.user_id}.")
        else:
            logger.error(f"Browser is not initialized for user {self.user_id}.")
