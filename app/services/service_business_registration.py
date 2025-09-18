# path: app/services/service_business_registration.py

import json
import os
from typing import Dict, Optional
from urllib.parse import urlencode, unquote

import requests


def normalize_business_number(raw_value: str) -> str:
    """하이픈 등 비숫자 문자를 제거하여 10자리 숫자만 반환"""
    digits_only = "".join(ch for ch in raw_value if ch.isdigit())
    return digits_only[:10]


def format_business_number(digits_only: str) -> str:
    """표시용 포맷: 3060965729 -> 306-09-65729"""
    d = normalize_business_number(digits_only)
    if len(d) < 5:
        return d
    if len(d) <= 10:
        return f"{d[0:3]}-{d[3:5]}-{d[5:10]}".rstrip("-")
    return f"{d[0:3]}-{d[3:5]}-{d[5:10]}"


def validate_business_number(raw_value: str) -> bool:
    """국내 사업자등록번호 검증 알고리즘

    규칙(간단형):
    - 10자리 숫자
    - 가중치 합의 1의 자리 보정값이 검증 숫자와 일치
    """
    number = normalize_business_number(raw_value)
    if len(number) != 10 or not number.isdigit():
        return False

    weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
    total = 0
    for i in range(9):
        if i == 8:
            # 9번째 자리(인덱스 8)는 x*5의 각 자리를 더한다
            val = int(number[i]) * weights[i]
            total += (val // 10) + (val % 10)
        else:
            total += int(number[i]) * weights[i]

    check = (10 - (total % 10)) % 10
    return check == int(number[9])

def _load_business_api_key() -> Optional[str]:
    """secrets.json에서 BUSINESSREGISTRATION_API_KEY 로드

    SECRETS_PATH 환경변수를 우선 사용하고, 없으면 프로젝트 루트의 secrets.json을 시도합니다.
    """
    secrets_path = os.getenv("SECRETS_PATH", os.path.join(os.getcwd(), "secrets.json"))
    if not os.path.exists(secrets_path):
        return None
    try:
        with open(secrets_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("BUSINESSREGISTRATION_API_KEY")
    except Exception:
        return None


def verify_with_odcloud(
    *,
    b_no: str,
    start_dt: str,
    p_nm: str,
    p_nm2: str = "",
    b_nm: str = "",
    corp_no: str = "",
    b_sector: str = "",
    b_type: str = "",
    b_adr: str = "",
) -> Dict[str, object]:
    """ODCloud(국세청 연동) 사업자등록 진위확인 API 호출

    문서: https://infuser.odcloud.kr/api/stages/28493/api-docs
    - Base: https://api.odcloud.kr/api
    - Path: /nts-businessman/v1/validate?serviceKey=...

    필수 값: b_no(10자리 숫자), start_dt(YYYYMMDD), p_nm(대표자명)
    반환: { valid: bool, status: str, message: str, raw: dict }
    """
    number = normalize_business_number(b_no)
    if len(number) != 10:
        return {"valid": False, "status": "INVALID_INPUT", "message": "사업자등록번호는 10자리여야 합니다.", "raw": None}

    api_key = _load_business_api_key()
    if not api_key:
        return {"valid": False, "status": "NO_API_KEY", "message": "BUSINESSREGISTRATION_API_KEY 미설정", "raw": None}

    base_url = "https://api.odcloud.kr/api"
    path = "/nts-businessman/v1/validate"
    # serviceKey 이중 인코딩 방지: 이미 %2A 형태가 포함되면 한 번 디코드 시도
    service_key = (api_key or "").strip()
    try:
        if "%25" in service_key or "%2" in service_key.lower():
            service_key = unquote(service_key)
    except Exception:
        pass
    url = f"{base_url}{path}"

    payload = {
        "businesses": [
            {
                "b_no": number,
                "start_dt": start_dt,
                "p_nm": p_nm,
                "p_nm2": p_nm2,
                "b_nm": b_nm,
                "corp_no": corp_no,
                "b_sector": b_sector,
                "b_type": b_type,
                "b_adr": b_adr,
            }
        ]
    }

    try:
        # params로 전달하여 requests가 적절히 인코딩 처리(이중 인코딩 방지)
        resp = requests.post(url, params={"serviceKey": service_key}, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # 응답 포맷 참고: data["data"][0]["valid"] / "status" / "request_cnt" 등
        result = None
        if isinstance(data, dict):
            arr = data.get("data") or data.get("valid_cnt") or data.get("results")
            if isinstance(arr, list) and arr:
                result = arr[0]

        # 일부 스펙에서 status/msg 필드명 다름 대비
        if result:
            valid = bool(result.get("valid") in (True, "01", 1, "T", "true"))
            status = str(result.get("status", ""))
            message = str(result.get("message", result.get("tax_type", "")))
            return {"valid": valid, "status": status, "message": message, "raw": data}

        return {"valid": False, "status": "UNKNOWN_RESPONSE", "message": "응답 형식을 해석할 수 없습니다.", "raw": data}

    except requests.HTTPError as http_err:
        return {"valid": False, "status": "HTTP_ERROR", "message": str(http_err), "raw": None}
    except Exception as e:
        return {"valid": False, "status": "ERROR", "message": str(e), "raw": None}
