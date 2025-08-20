// path: frontend/src/apis/koreaEximApi.ts
import axios, { AxiosResponse } from 'axios';

export interface KoreaEximExchangeRateResponse {
    result: number;           // 조회 결과 (1: 성공, 2: DATA코드 오류, 3: 인증코드 오류, 4: 일일제한횟수 마감)
    cur_unit: string;         // 통화코드 (USD, JPY, CNY, EUR 등)
    cur_nm: string;           // 국가/통화명
    ttb: string;              // 전신환(송금) 받으실때
    tts: string;              // 전신환(송금) 보내실때
    deal_bas_r: string;       // 매매 기준율 (일일고시환율)
    bkpr: string;             // 장부가격
    yy_efee_r: string;        // 년환가료율
    ten_dd_efee_r: string;    // 10일환가료율
    kftc_deal_bas_r: string;  // 서울외국환중개 매매기준율
    kftc_bkpr: string;        // 서울외국환중개 장부가격
}

export interface KoreaEximExchangeRateInfo {
    currencyCode: string;
    currencyName: string;
    exchangeRate: number;     // deal_bas_r (매매 기준율)
    ttb: number;              // 전신환 매도율
    tts: number;              // 전신환 매입율
    bkpr: number;             // 장부가격
}

class KoreaEximApiService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = 'https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON';
        this.apiKey = import.meta.env.VITE_KOREAEXIM_API_KEY || '';
    }

    /**
     * 일일고시환율 조회 (한국수출입은행)
     * @param searchDate 검색날짜 (YYYYMMDD 형식, 기본값: 현재일)
     * @returns 환율 정보 배열
     */
    async getDailyExchangeRates(searchDate?: string): Promise<KoreaEximExchangeRateInfo[]> {
        try {
            if (!this.apiKey) {
                throw new Error('한국수출입은행 API 키가 설정되지 않았습니다.');
            }

            const params = new URLSearchParams({
                authkey: this.apiKey,
                searchdate: searchDate || this.getCurrentDate(),
                data: 'AP01'  // AP01: 환율
            });

            const response: AxiosResponse<KoreaEximExchangeRateResponse[]> = await axios.get(
                `${this.baseUrl}?${params}`
            );

            // 응답이 배열 형태로 반환됨
            if (!Array.isArray(response.data)) {
                throw new Error('API 응답 형식이 올바르지 않습니다.');
            }

            // 에러 체크 (result 필드가 1이 아닌 경우)
            const errorItem = response.data.find(item => item.result !== 1);
            if (errorItem) {
                const errorMessages = {
                    2: 'DATA코드 오류',
                    3: '인증코드 오류',
                    4: '일일제한횟수 마감'
                };
                throw new Error(`API 오류: ${errorMessages[errorItem.result as keyof typeof errorMessages] || '알 수 없는 오류'}`);
            }

            return response.data.map(item => ({
                currencyCode: item.cur_unit,
                currencyName: item.cur_nm,
                exchangeRate: parseFloat(item.deal_bas_r.replace(/,/g, '')) || 0,
                ttb: parseFloat(item.ttb.replace(/,/g, '')) || 0,
                tts: parseFloat(item.tts.replace(/,/g, '')) || 0,
                bkpr: parseFloat(item.bkpr.replace(/,/g, '')) || 0
            }));

        } catch (error) {
            console.error('한국수출입은행 일일고시환율 API 호출 실패:', error);
            throw new Error('일일고시환율 조회에 실패했습니다.');
        }
    }

    /**
     * 특정 통화의 일일고시환율 조회
     * @param currencyCode 통화코드 (USD, JPY, CNY, EUR 등)
     * @param searchDate 검색날짜
     * @returns 환율 정보
     */
    async getDailyExchangeRate(currencyCode: string, searchDate?: string): Promise<KoreaEximExchangeRateInfo | null> {
        try {
            const rates = await this.getDailyExchangeRates(searchDate);
            return rates.find(rate => rate.currencyCode === currencyCode) || null;
        } catch (error) {
            console.error(`${currencyCode} 일일고시환율 조회 실패:`, error);
            return null;
        }
    }

    /**
     * 현재 날짜를 YYYYMMDD 형식으로 반환
     */
    private getCurrentDate(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}

export const koreaEximApiService = new KoreaEximApiService();
