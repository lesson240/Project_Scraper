
import axios from '@/lib/axios';

export type BusinessVerifyRequest = {
    b_no: string;        // 306-09-65729 (하이픈 허용)
    start_dt: string;    // YYYYMMDD
    p_nm: string;        // 대표자명
    b_nm?: string;       // 상호명(optional)
};

export type BusinessVerifyResponse = {
    valid: boolean;
    status: string;
    message: string;
};

export async function verifyBusiness(req: BusinessVerifyRequest): Promise<BusinessVerifyResponse> {
    const { data } = await axios.post('/business/verify', req);
    return data;
}
