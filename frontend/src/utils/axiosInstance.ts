import axios from "axios";
import Cookies from "js-cookie";
import { ALLTTAM_URL } from "@/common/baseUrl";

const axiosInstance = axios.create({
    baseURL: ALLTTAM_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (error) => {
        if (error.response.status === 401) {
            const isAccessToken = Cookies.get("accessToken") !== undefined;
            const isRefreshToken = Cookies.get("refreshToken") !== undefined;
            if (
                error.response.data === "Invalid token" ||
                error.response.data.indexOf("Signature validation failed. ") > -1 ||
                error.response.data.indexOf("IDX10214: Audience validation failed.") >
                -1 ||
                !isAccessToken ||
                !isRefreshToken
            ) {
                return Promise.reject(error);
            }
            const res = await axios.post(`${ALLTTAM_URL}/Allddam/auth/refreshToken`, {
                accessToekn: Cookies.get("accessToken"),
                refreshToken: Cookies.get("refreshToken"),
            });
            if (res.data === false) {
                return false;
            }
            Cookies.set("accessToken", res.data.accessToken);
            Cookies.set("refreshToken", res.data.refreshToken);
        }
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;