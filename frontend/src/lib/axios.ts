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

export default axiosInstance;