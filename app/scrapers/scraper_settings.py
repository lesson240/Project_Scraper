# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# 프로젝트 Module 불러오기
from app.utils.util_logging import setup_logger

# 라이브러리 불러오기
import json
import random


class ScraperSettings:
    def __init__(self, json_file="user_agents.json"):
        self.json_file = json_file
        self.data = self.load_json()

    def load_json(self):
        try:
            with open(self.json_file, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def save_json(self):
        with open(self.json_file, "w") as f:
            json.dump(self.data, f, indent=4)

    def get_random_user_agent(self, site_key):
        default_user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1",
            "Mozilla/5.0 (Linux; Android 7.0; Nexus 5X Build/NBD90W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
            "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1",
        ]

        if site_key not in self.data:
            self.data[site_key] = {"user_agents": [], "headers": {}}
            self.save_json()

        user_agents = self.data[site_key]["user_agents"]
        if not user_agents:
            user_agents = default_user_agents

        return random.choice(user_agents)

    def get_headers(self, site_key):
        default_headers = {
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }

        if site_key not in self.data:
            self.data[site_key] = {"user_agents": [], "headers": default_headers}
            self.save_json()

        headers = self.data[site_key]["headers"]
        headers["User-Agent"] = self.get_random_user_agent(site_key)
        return headers

    def save_successful_user_agent(self, site_key, user_agent):
        if site_key not in self.data:
            self.data[site_key] = {"user_agents": [], "headers": {}}

        if user_agent not in self.data[site_key]["user_agents"]:
            self.data[site_key]["user_agents"].append(user_agent)
            self.save_json()

    def remove_user_agent(self, site_key, user_agent):
        if site_key in self.data and user_agent in self.data[site_key]["user_agents"]:
            self.data[site_key]["user_agents"].remove(user_agent)
            self.save_json()
