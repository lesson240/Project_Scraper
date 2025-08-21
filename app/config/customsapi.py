# path: app/config/customsapi.py
# 관세청 API 설정
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

# 관세청 API 설정
CUSTOMS_API_CONFIG = {
    "base_url": "https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo",  # 관세청 환율 API
    "service_key": secrets.get("CUSTOMS_API_KEY", ""),
    "timeout": 30000,  # 타임아웃 증가 (15초 → 30초)
    "retry_count": 3,
    "major_currencies": ["USD", "EUR", "JPY", "CNY"]  # 통화기호
}

# API 키 유효성 검사
def validate_customs_api_key():
    """관세청 API 키 설정 상태를 확인합니다."""
    customs_key = CUSTOMS_API_CONFIG["service_key"]
    
    if not customs_key:
        print("⚠️ 관세청 API 키가 설정되지 않았습니다.")
        return False
    else:
        print("✅ 관세청 API 키가 설정되었습니다.")
        return True

# 설정 로드 시 API 키 유효성 검사
if __name__ == "__main__":
    validate_customs_api_key()
