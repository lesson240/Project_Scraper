export interface User {
    accessToken: null | string;
    expireDate: string;
    isAgreeMarketing: boolean;
    isAgreeTerms: boolean;
    isExpire: boolean;
    originalUserName: string;
    plan: string;
    refreshToken: null | string;
    role: string;
    userEmail: string;
    userTelNo: string;
    username: string;
}

export interface Signup {
    account: string;
    userName: string;
    contactTellNo: string;
    email: string;
    password: string;
    passwordCheck: string;
}

export interface Login {
    username: string;
    password: string;
}