# path: app/config/koreaeximapi.py
# 한국수출입은행 API 설정
import os
import json
from pathlib import Path

def load_secrets():
    """프로젝트 루트의 secrets.json에서 API 키를 로드합니다."""
    try:
        project_root = Path(__file__).parent.parent.parent
        secrets_path = project_root / "secrets.json"
        
        if secrets_path.exists():
            with open(secrets_path, 'r', encoding='utf-8') as f:
                secrets = json.load(f)
                return secrets
        else:
            print(f"⚠️ secrets.json 파일을 찾을 수 없습니다: {secrets_path}")
            return {}
    except Exception as e:
        print(f"⚠️ secrets.json 로드 실패: {e}")
        return {}

# API 설정
secrets = load_secrets()

# 한국수출입은행 API 설정
KOREAEXIM_API_CONFIG = {
    "base_url": "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON",
    "api_key": secrets.get("KOREAEXIM_API_KEY", ""),
    "timeout": 15000,
    "retry_count": 3,
    "major_currencies": ["USD", "JPY", "CNY", "EUR"]  # 통화코드 cur_unit
}

# API 키 유효성 검사
def validate_koreaexim_api_key():
    """한국수출입은행 API 키 설정 상태를 확인합니다."""
    koreaexim_key = KOREAEXIM_API_CONFIG["api_key"]
    
    if not koreaexim_key:
        print("⚠️ 한국수출입은행 API 키가 설정되지 않았습니다.")
        return False
    else:
        print("✅ 한국수출입은행 API 키가 설정되었습니다.")
        return True

# 설정 로드 시 API 키 유효성 검사
if __name__ == "__main__":
    validate_koreaexim_api_key()
