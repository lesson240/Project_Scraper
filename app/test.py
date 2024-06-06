import os
import subprocess
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# WebDriverManager를 사용하여 최신 ChromeDriver 설치 및 경로 확인
chrome_driver_path = ChromeDriverManager().install()
print(f"ChromeDriver 설치 경로: {chrome_driver_path}")

# 설치된 ChromeDriver의 버전 확인
try:
    version_output = subprocess.check_output(
        [chrome_driver_path, "--version"], stderr=subprocess.STDOUT
    )
    version = version_output.decode().strip()
    print(f"설치된 ChromeDriver 버전: {version}")
except subprocess.CalledProcessError as e:
    print(f"ChromeDriver 버전 확인 중 오류 발생: {e.output.decode().strip()}")

# WebDriverManager로 설치된 ChromeDriver를 사용하여 웹 드라이버 설정
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service(chrome_driver_path)
driver = webdriver.Chrome(service=service, options=options)

# Test if driver works
driver.get("https://www.google.com")
print(driver.title)
driver.quit()
