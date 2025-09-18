import axios from "axios";

// Vite 환경변수 VITE_API_BASE_URL 사용. 예: https://allttam.kr
const BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";
// 백엔드는 버전 prefix(`/v1`)를 사용하므로 자동 부착
const baseURL = `${BASE.replace(/\/$/, "")}/v1`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug flag (follow docs '디버그 로그 시스템')
const DEBUG_HTTP = (import.meta as any).env?.DEV === true || String((import.meta as any).env?.VITE_DEBUG_HTTP).toLowerCase() === "true";

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    if (DEBUG_HTTP) {
      console.log("🚀 Axios 요청 인터셉터");
      console.log("📍 요청 URL:", (config.baseURL || baseURL) + (config.url || ""));
      console.log("📋 요청 데이터:", config.data);
      console.log("🔧 요청 설정:", config);
    }
    return config;
  },
  (error) => {
    if (DEBUG_HTTP) console.error("❌ 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG_HTTP) {
      console.log("✅ Axios 응답 인터셉터");
      console.log("📊 응답 상태:", response.status);
      console.log("📦 응답 데이터:", response.data);
    }
    return response;
  },
  (error) => {
    if (DEBUG_HTTP) {
      console.error("❌ 응답 인터셉터 에러:", error);
      console.error("🚫 에러 응답:", error.response);
      console.error("🌐 에러 요청:", error.request);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;