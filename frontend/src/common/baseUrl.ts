// export const CENTER_URL = "https://center.allttam.com/api";
// export const ALLTTAM_URL = "https://api.allttam.com/api";

// src/common/const/baseUrl.ts
// 운영: allttam.kr, 로컬 개발 시 .env 또는 vite 설정으로 별도 주입 권장
export const ALLTTAM_URL =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
export const CENTER_URL = "https://center.allttam.com/api";
// 혹은 실제 dev 서버 주소 등 환경에 맞게 수정
