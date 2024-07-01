# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger
from app.services.service_mongodb import mongodb_service
from app.models.model_websocket import (
    SessionDataModel,
    ChromePathModel,
    ChromeExPathModel,
    ChromeProfilePathModel,
)

# 라이브러리 불러오기
from datetime import datetime, timedelta
from pyppeteer import launch, connect
from pyppeteer.errors import NetworkError
import asyncio
import os
import subprocess
import platform
import sqlite3
import shutil
import tempfile
import time
import requests
import websockets
import json


# 파일명 자동 추출
file_name = os.path.basename(__file__)
logger_name = os.path.splitext(file_name)[0]

# 로거 설정, __file__을 전달
logger = setup_logger(logger_name, __file__)


class ChromePathManager:
    def __init__(self):
        self.engine = mongodb_service.users_engine

    def get_possible_paths(self, os_name, username):
        """Return a list of possible Chrome paths based on the operating system."""
        paths = []
        if os_name == "Windows":
            paths = [
                "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                "C:\\Users\\{username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
            ]
        elif os_name == "Darwin":  # macOS
            paths = [
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Users/{username}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            ]
        elif os_name == "Linux":
            paths = [
                "/usr/bin/google-chrome",
                "/usr/local/bin/google-chrome",
                "/snap/bin/chromium",
            ]
        # Replace {username} with the actual username
        return [path.format(username=username) for path in paths]

    async def get_chrome_path(self, user_id):
        """Get the Chrome path for the user from the database or file system."""
        # Check if the path is already in the database
        path_record = await self.engine.find_one(
            ChromePathModel, ChromePathModel.user_id == user_id
        )
        if path_record:
            return path_record.path

        # Determine the operating system
        os_name = platform.system()
        username = os.getenv("USERNAME") or os.getenv("USER")
        if not username:
            logger.error("Username not found in environment variables.")
            return None

        paths = self.get_possible_paths(os_name, username)
        for path in paths:
            if os.path.exists(path):
                # Save the path in the database
                await self.engine.save(ChromePathModel(user_id=user_id, path=path))
                logger.info(f"Chrome path found and saved: {path}")
                return path

        logger.error("No valid Chrome path found.")
        return None


class ChromeExPathManager:
    def __init__(self):
        self.engine = mongodb_service.users_engine

    def get_possible_extension_paths(self, os_name, extension_id):
        """Return a list of possible Chrome extension paths based on the operating system."""
        user_home = os.path.expanduser("~")
        paths = []
        if os_name == "Windows":
            base_path = os.path.join(
                user_home,
                "AppData",
                "Local",
                "Google",
                "Chrome",
                "User Data",
                "Default",
                "Extensions",
            )
        elif os_name == "Darwin":  # macOS
            base_path = os.path.join(
                user_home,
                "Library",
                "Application Support",
                "Google",
                "Chrome",
                "Default",
                "Extensions",
            )
        elif os_name == "Linux":
            base_path = os.path.join(
                user_home, ".config", "google-chrome", "Default", "Extensions"
            )
        else:
            raise ValueError("Unsupported operating system")

        extension_path = os.path.join(base_path, extension_id)
        if not os.path.exists(extension_path):
            raise FileNotFoundError(
                f"Extension with ID {extension_id} not found at {extension_path}"
            )

        versions = os.listdir(extension_path)
        latest_version = max(versions, key=lambda v: [int(x) for x in v.split(".")])

        return os.path.join(extension_path, latest_version)

    async def get_extension_path(self, user_id, extension_id):
        """Get the Chrome extension path for the user from the database or file system."""
        # Check if the path is already in the database
        path_record = await self.engine.find_one(
            ChromeExPathModel, {"user_id": user_id, "extension_id": extension_id}
        )
        if path_record:
            return path_record.path

        # Determine the operating system
        os_name = platform.system()
        try:
            extension_path = self.get_possible_extension_paths(os_name, extension_id)
            # Save the path in the database
            await self.engine.save(
                ChromeExPathModel(
                    user_id=user_id, extension_id=extension_id, path=extension_path
                )
            )
            logger.info(f"Extension path found and saved: {extension_path}")
            return extension_path
        except Exception as e:
            logger.error(f"Error finding extension path: {e}")
            return None

    def __init__(self):
        self.engine = mongodb_service.users_engine

    def get_possible_profile_paths(self, os_name):
        """Return a list of possible Chrome profile paths based on the operating system."""
        user_home = os.path.expanduser("~")
        paths = []
        if os_name == "Windows":
            base_path = os.path.join(
                user_home,
                "AppData",
                "Local",
                "Google",
                "Chrome",
                "User Data",
            )
        elif os_name == "Darwin":  # macOS
            base_path = os.path.join(
                user_home,
                "Library",
                "Application Support",
                "Google",
                "Chrome",
                "User Data",
            )
        elif os_name == "Linux":
            base_path = os.path.join(user_home, ".config", "google-chrome", "User Data")
        else:
            raise ValueError("Unsupported operating system")

        return [
            os.path.join(base_path, "Default"),
            os.path.join(base_path, "Default", "Network"),
        ]

    async def get_profile_path(self, user_id):
        """Get the Chrome profile path for the user from the database or file system."""
        # Check if the path is already in the database
        path_record = await self.engine.find_one(
            ChromeProfilePathModel, ChromeProfilePathModel.user_id == user_id
        )
        if path_record:
            return path_record.profile_path

        # Determine the operating system
        os_name = platform.system()

        try:
            possible_paths = self.get_possible_profile_paths(os_name)
            for path in possible_paths:
                cookies_path = os.path.join(path, "Cookies")
                if os.path.exists(cookies_path) and os.path.getsize(cookies_path) > 0:
                    # Save the path in the database
                    await self.engine.save(
                        ChromeProfilePathModel(user_id=user_id, profile_path=path)
                    )
                    logger.info(f"Profile path found and saved: {path}")
                    return path

            logger.error("No valid profile path found.")
            return None
        except Exception as e:
            logger.error(f"Error finding profile path: {e}")
            return None


class ChromeProfilePathManager:
    def __init__(self):
        self.engine = mongodb_service.users_engine

    def get_possible_profile_paths(self, os_name):
        """Return a list of possible Chrome profile paths based on the operating system."""
        user_home = os.path.expanduser("~")
        paths = []
        if os_name == "Windows":
            base_path = os.path.join(
                user_home,
                "AppData",
                "Local",
                "Google",
                "Chrome",
                "User Data",
            )
        elif os_name == "Darwin":  # macOS
            base_path = os.path.join(
                user_home,
                "Library",
                "Application Support",
                "Google",
                "Chrome",
                "User Data",
            )
        elif os_name == "Linux":
            base_path = os.path.join(user_home, ".config", "google-chrome", "User Data")
        else:
            raise ValueError("Unsupported operating system")

        return [
            os.path.join(base_path, "Default"),
            os.path.join(base_path, "Default", "Network"),
        ]

    async def get_profile_path(self, user_id):
        """Get the Chrome profile path for the user from the database or file system."""
        # Check if the path is already in the database
        path_record = await self.engine.find_one(
            ChromeProfilePathModel, ChromeProfilePathModel.user_id == user_id
        )
        if path_record:
            return path_record.profile_path

        # Determine the operating system
        os_name = platform.system()

        try:
            possible_paths = self.get_possible_profile_paths(os_name)
            for path in possible_paths:
                cookies_path = os.path.join(path, "Cookies")
                if os.path.exists(cookies_path) and os.path.getsize(cookies_path) > 0:
                    # Save the path in the database
                    await self.engine.save(
                        ChromeProfilePathModel(user_id=user_id, profile_path=path)
                    )
                    logger.info(f"Profile path found and saved: {path}")
                    return path

            logger.error("No valid profile path found.")
            return None
        except Exception as e:
            logger.error(f"Error finding profile path: {e}")
            return None


class ProfileManager:
    """쿠키와 로컬 스토리지 데이터를 관리하는 클래스"""

    def __init__(self, refresh_interval_days=1):
        self.engine = mongodb_service.users_engine
        self.refresh_interval = timedelta(days=refresh_interval_days)

    def get_profile_cookies(self, profile_path):
        """브라우저 프로파일에서 쿠키 데이터를 가져옵니다."""
        cookies = []
        try:
            cookies_db_path = os.path.join(profile_path, "Cookies")
            # 데이터베이스 파일이 실제로 존재하는지 확인
            if not os.path.exists(cookies_db_path):
                logger.error(f"Cookies database file not found at {cookies_db_path}")
                return cookies

            # 임시 파일에 데이터베이스 복사
            temp_dir = tempfile.mkdtemp()
            temp_cookies_db_path = os.path.join(temp_dir, "Cookies")
            shutil.copy2(cookies_db_path, temp_cookies_db_path)

            # 데이터베이스 파일을 읽기 전용 모드로 열기
            conn = sqlite3.connect(f"file:{temp_cookies_db_path}?mode=ro", uri=True)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT host_key, name, value, path, expires_utc FROM cookies"
            )
            rows = cursor.fetchall()
            for row in rows:
                cookies.append(
                    {
                        "domain": row[0],
                        "name": row[1],
                        "value": row[2],
                        "path": row[3],
                        "expires": row[4],
                    }
                )
            conn.close()
            shutil.rmtree(temp_dir)  # 임시 디렉토리 삭제
        except sqlite3.Error as e:
            logger.error(f"SQLite error: {e}")
        except Exception as e:
            logger.error(f"Error reading cookies from profile: {e}")
        return cookies

    def get_profile_local_storage(self, profile_path):
        """브라우저 프로파일에서 로컬 스토리지 데이터를 가져옵니다."""
        local_storage = {}
        try:
            local_storage_path = os.path.join(profile_path, "Local Storage", "leveldb")
            for root, dirs, files in os.walk(local_storage_path):
                for file in files:
                    if file.endswith(".ldb"):
                        with open(os.path.join(root, file), "rb") as f:
                            data = f.read()
                            local_storage[file] = data
        except Exception as e:
            logger.error(f"Error reading local storage from profile: {e}")
        return local_storage

    async def save_profile_data_to_db(self, user_id, site_name, profile_path):
        """브라우저 프로파일에서 데이터를 읽어와 MongoDB에 저장합니다."""
        cookies = self.get_profile_cookies(profile_path)
        local_storage = self.get_profile_local_storage(profile_path)
        await self.save_profile_data(user_id, site_name, cookies, local_storage)

    async def save_profile_data(self, user_id, site_name, cookies, local_storage):
        """쿠키와 로컬 스토리지 데이터를 MongoDB에 저장합니다."""
        # 기존 데이터를 삭제
        await self.clear_profile_data(user_id, site_name)
        # 새로운 데이터 저장
        cookie_data = ProfileDataModel(
            user_id=user_id,
            site_name=site_name,
            cookies=cookies,
            local_storage=local_storage,
            last_updated=datetime.utcnow(),
        )
        await self.engine.save(cookie_data)
        logger.info(
            f"Profile data for user {user_id} and site {site_name} saved to MongoDB."
        )

    async def get_profile_data(self, user_id, site_name):
        """MongoDB에서 쿠키와 로컬 스토리지 데이터를 가져옵니다."""
        cookie_data = await self.engine.find_one(
            ProfileDataModel, {"user_id": user_id, "site_name": site_name}
        )
        if cookie_data:
            # 갱신 주기 체크
            if datetime.utcnow() - cookie_data.last_updated > self.refresh_interval:
                logger.info(
                    f"Profile data for user {user_id} and site {site_name} need to be refreshed."
                )
                return None
            logger.info(
                f"Profile data for user {user_id} and site {site_name} retrieved from MongoDB."
            )
            return {
                "cookies": cookie_data.cookies,
                "local_storage": cookie_data.local_storage,
            }
        else:
            logger.warning(
                f"No cookies found in MongoDB for user {user_id} and site {site_name}."
            )
            return None

    async def clear_profile_data(self, user_id, site_name):
        """MongoDB에 저장된 특정 유저와 사이트의 쿠키와 로컬 스토리지 데이터를 삭제합니다."""
        await self.engine.remove(
            ProfileDataModel, {"user_id": user_id, "site_name": site_name}
        )
        logger.info(
            f"Profile data for user {user_id} and site {site_name} cleared from MongoDB."
        )


class BrowserManager:
    """브라우저 세션을 관리하는 클래스"""

    @staticmethod
    def start_chrome_with_profile(
        chrome_path, extension_path, profile_path, url, headless=True
    ):
        """서브프로세스를 통해 디버그 모드로 브라우저를 실행합니다."""
        try:
            headless_flag = "--headless" if headless else ""
            command = [
                chrome_path,
                f"--user-data-dir={profile_path}",
                "--remote-debugging-port=9222",
                f"--load-extension={extension_path}",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-site-isolation-trials",
                "--disable-gpu",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                url,
                headless_flag,
            ]

            logger.info(f"Starting Chrome with command: {' '.join(command)}")

            subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
            )
            # DevTools 프로토콜을 통해 WebSocket URL 가져오기
            response = requests.get("http://localhost:9222/json")
            response_json = response.json()

            # WebSocket URL 찾기
            websocket_url = None
            for entry in response_json:
                if entry.get("webSocketDebuggerUrl"):
                    websocket_url = entry["webSocketDebuggerUrl"]
                    break

            if websocket_url:
                logger.info(f"WebSocket URL: {websocket_url}")
                return websocket_url
            else:
                logger.error("WebSocket URL을 찾을 수 없습니다.")
                return None

        except Exception as e:
            logger.error(f"Error starting Chrome in debug mode: {e}")
            return None

    async def save_browser_data(
        self, websocket_url_first, url, user_id, site_name, timeout=5, retries=3
    ):
        """특정 URL에 접속하여 브라우저의 쿠키와 로컬 스토리지 데이터를 가져옵니다."""
        logger.info(f"{websocket_url_first}, {url}, {user_id}, {site_name}")
        try:
            async with websockets.connect(websocket_url_first) as websocket:
                for attempt in range(retries):
                    start_time = time.time()
                    while time.time() - start_time < timeout:
                        # 쿠키 가져오기
                        command_cookies = {
                            "id": 1,
                            "method": "Network.getCookies",
                            "params": {},
                        }
                        await websocket.send(json.dumps(command_cookies))
                        response_cookies = await websocket.recv()
                        cookies = (
                            json.loads(response_cookies)
                            .get("result", {})
                            .get("cookies", [])
                        )

                        # 특정 쿠키로 로그인 여부를 확인 (예: 로그인 세션 쿠키)
                        if any(
                            cookie["name"] == "session_cookie_name"
                            for cookie in cookies
                        ):
                            # 로컬 스토리지 가져오기
                            command_local_storage = {
                                "id": 2,
                                "method": "Runtime.evaluate",
                                "params": {
                                    "expression": """
                                        (() => {
                                            let items = {};
                                            for (let i = 0; i < localStorage.length; i++) {
                                                let key = localStorage.key(i);
                                                items[key] = localStorage.getItem(key);
                                            }
                                            return items;
                                        })();
                                    """
                                },
                            }
                            await websocket.send(json.dumps(command_local_storage))
                            response_local_storage = await websocket.recv()
                            local_storage = (
                                json.loads(response_local_storage)
                                .get("result", {})
                                .get("result", {})
                                .get("value", {})
                            )

                            session_data = {
                                "user_id": user_id,
                                "site_name": site_name,
                                "cookies": cookies,
                                "local_storage": local_storage,
                                "last_updated": datetime.utcnow(),
                            }
                            await mongodb_service.users_engine.save(
                                SessionDataModel(**session_data)
                            )
                            logger.info(
                                "Browser data (cookies and local storage) saved to MongoDB."
                            )
                            return True
                        await asyncio.sleep(2)
                    logger.warning(
                        f"Attempt {attempt + 1}/{retries} failed to find login session."
                    )

            raise TimeoutError(
                "Login not completed within the timeout period after retries."
            )
        except TimeoutError as te:
            logger.error(te)
            return False
        except Exception as e:
            logger.error(f"Error saving browser data: {e}")
            return False

    async def load_browser_data(self, url, user_id, site_name):
        """MongoDB에서 브라우저 세션 데이터를 가져와 페이지에 적용합니다."""
        session_data = await mongodb_service.users_engine.find_one(
            SessionDataModel, {"user_id": user_id, "site_name": site_name}
        )
        if session_data:
            cookies = session_data.cookies
            local_storage = session_data.local_storage
            for cookie in cookies:
                await url.setCookie(cookie)
            for key, value in local_storage.items():
                await url.evaluate(f'localStorage.setItem("{key}", "{value}");')
            logger.info("Browser data (cookies and local storage) loaded from MongoDB.")
            return True
        else:
            logger.error(
                f"No session data found for user {user_id} and site {site_name}."
            )
            return False


class PuppeteerManager:
    @staticmethod
    async def connect_to_browser(websocket_url):
        """기존 브라우저 세션에 연결합니다."""
        try:
            # WebSocket URL 검증
            if not websocket_url.startswith("ws://") and not websocket_url.startswith(
                "wss://"
            ):
                raise ValueError(f"Invalid WebSocket URL: {websocket_url}")

            logger.info(f"Connecting to WebSocket URL: {websocket_url}")

            # Pyppeteer 디버그 로그 활성화
            import logging

            logging.basicConfig(level=logging.DEBUG)
            logging.getLogger("pyppeteer").setLevel(logging.DEBUG)

            # 타임아웃을 설정하여 연결 시도
            logger.info(f"WebSocket URL before connecting: {websocket_url}")
            connect_task = connect(browserWSEndpoint=websocket_url)
            logger.info("Waiting for the connection task to complete")
            browser = await asyncio.wait_for(connect_task, timeout=5)

            logger.info("Successfully connected to the existing browser session.")
            return browser
        except asyncio.TimeoutError:
            logger.error(
                f"Connection attempt to WebSocket URL {websocket_url} timed out."
            )
        except NetworkError:
            logger.error(
                f"Failed to connect to the browser using WebSocket URL {websocket_url}: No existing session."
            )
        except Exception as e:
            logger.error(
                f"Failed to connect to the browser using WebSocket URL {websocket_url}: {e}"
            )

        return None

    @staticmethod
    async def apply_anti_detection(page):
        """브라우저 탐지 방지 기술을 적용합니다."""
        await page.evaluateOnNewDocument(
            """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """
        )
        logger.info("Anti-detection measures applied.")
