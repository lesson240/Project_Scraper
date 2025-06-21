import { Login, Signup } from "@/interface/user";
import axiosInstance from "@/utils/axiosInstance";
import Cookies from "js-cookie";

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