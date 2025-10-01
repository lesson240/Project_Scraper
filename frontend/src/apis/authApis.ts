// path: frontend/src/apis/authApis.ts
// ===========================================
// ⚠️  DEPRECATED LEGACY API  ⚠️
// ===========================================
// 이 파일은 기존 시스템과의 호환성을 위해 유지됩니다.
// 새로운 프로젝트에서는 반드시 authApi.ts를 사용하세요.
// 
// 마이그레이션 가이드:
// - getUser() → authApi.getProfile()
// - login() → authApi.login()
// - signup() → authApi.signup()
// - naverCheck() → authApi.socialLogin()
// - naverLogin() → authApi.socialLogin()
// ===========================================

import { Login, Signup } from "@/interface/user";
import axiosInstance from "@/utils/axiosInstance";
import Cookies from "js-cookie";

/**
 * @deprecated 이 파일은 레거시 API입니다. 새로운 프로젝트에서는 authApi.ts를 사용하세요.
 * @see authApi.ts - 새로운 표준화된 API 클라이언트
 */

export const getUser = async () => {
    const res = await axiosInstance.get("/Allddam/Auth/user");
    return res.data;
};

export const login = async (loginValue: Login) => {
    const res = await axiosInstance.post("/Allddam/Auth/login", loginValue);
    if (res.data.accessToken && res.data.refreshToken) {
        Cookies.set("accessToken", res.data.accessToken);
        Cookies.set("refreshToken", res.data.refreshToken);
    }
    return res.data;
};

export const signup = async (signupValue: Signup) => {
    const res = await axiosInstance.post(
        "/Allddam/Account/UserCreate",
        signupValue
    );
    return res;
};

export const naverCheck = async (token: string) => {
    const res = axiosInstance.get(
        `https://api.allttam.com/api/Allddam/Account/NILCheck?token=${token}`
    );
    return res;
};

export const naverLogin = async (token: string) => {
    const res = await axiosInstance.get(
        `https://api.allttam.com/api/Auth/NIL?token=${token}`
    );
    return res;
};