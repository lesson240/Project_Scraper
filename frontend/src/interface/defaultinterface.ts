export interface UserInfoType {
    expireDate: string;
    isExpire: boolean;
    originalUserName: string;
    plan: string;
    role: string;
    userEmail: string;
    userTelNo: string;
    username: string;
}

export interface NoticeData {
    id: number;
    title: string;
    writer: string;
    updateDate: string;
}

export interface CollectLog {
    collectRequestCount: number;
    collectSuccessCount: number;
    endTime: string;
    groupName: string;
    keyword: string;
    memo: string;
    site: string;
    startTime: string;
    workNumber: number;
}

export interface UploadLog {
    endTime: string;
    market: string;
    startTime: string;
    uploadSuccessCount: number;
    uploadTotalCount: number;
    workNumber: number;
}

export interface UserPlanInfo {
    collectionCount: number;
    collectionLimit: number;
    expireDate: string;
    joinDate: string;
    planName: string;
    uploadCount: number;
    usePerioud: string;
}