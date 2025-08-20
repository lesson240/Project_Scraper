// path: frontend/src/apis/customsApi.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { customsConfig, MajorCurrency } from '@/config/customs';

export interface CustomsExchangeRateResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: Array<{
                    cntySgn: string;       // 국가기호 (US, CN, EU, JP)
                    fxrt: string;          // 주간관세환율
                    aplyBgnDt: string;     // 적용시작일
                    aplyEndDt: string;     // 적용종료일
                    weekFxrtTpcd: string;  // 주간환율유형코드
                }>;
            };
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
    };
}

export interface ExchangeRateInfo {
    currencyCode: string;
    currencyName: string;
    baseDate: string;
    exchangeRate: number;
    startDate: string;
    endDate: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: string;
}

class CustomsApiService {
    private baseUrl: string;
    private authKey: string;
    private timeout: number;
    private retryCount: number;

    constructor() {
        this.baseUrl = customsConfig.baseUrl;
        this.authKey = customsConfig.serviceKey;
        this.timeout = customsConfig.timeout;
        this.retryCount = customsConfig.retryCount;

        if (!this.authKey) {
            console.warn('관세청 API 키가 설정되지 않았습니다. 환경변수 REACT_APP_CUSTOMS_API_KEY를 확인해주세요.');
        }
    }

    /**
     * API 호출을 위한 axios 인스턴스 생성
     */
    private createAxiosInstance() {
        return axios.create({
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
            // CORS 문제 해결을 위한 설정
            withCredentials: false,
        });
    }

    /**
     * 재시도 로직
     */
    private async retryRequest<T>(
        requestFn: () => Promise<T>,
        retries: number = this.retryCount
    ): Promise<T> {
        try {
            return await requestFn();
        } catch (error) {
            if (retries > 0 && this.isRetryableError(error)) {
                console.log(`API 호출 실패, ${retries}회 재시도 중...`);
                await this.delay(1000); // 1초 대기
                return this.retryRequest(requestFn, retries - 1);
            }
            throw error;
        }
    }

    /**
     * 재시도 가능한 에러인지 확인
     */
    private isRetryableError(error: any): boolean {
        if (error instanceof AxiosError) {
            // 네트워크 에러나 5xx 서버 에러는 재시도
            return !error.response || (error.response.status >= 500 && error.response.status < 600);
        }
        return false;
    }

    /**
     * 지연 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 에러 메시지 정리
     */
    private formatErrorMessage(error: any): string {
        if (error instanceof AxiosError) {
            if (error.code === 'ERR_NETWORK') {
                return '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
            }
            if (error.code === 'ECONNABORTED') {
                return '요청 시간이 초과되었습니다.';
            }
            if (error.response?.status === 403) {
                return 'API 키가 유효하지 않습니다.';
            }
            if (error.response?.status === 429) {
                return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
            }
            return `API 호출 실패: ${error.response?.status} ${error.response?.statusText}`;
        }
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }

    /**
     * 관세청 환율정보 API 호출
     * @param baseDate 기준일자 (YYYYMMDD 형식, 기본값: 오늘)
     * @param currencyCode 통화코드 (기본값: 전체)
     * @returns 환율 정보 배열
     */
    async getExchangeRates(baseDate?: string, currencyCode?: string): Promise<ExchangeRateInfo[]> {
        if (!this.authKey) {
            throw new Error('API 키가 설정되지 않았습니다.');
        }

        const requestFn = async (): Promise<ExchangeRateInfo[]> => {
            try {
                const params = new URLSearchParams({
                    serviceKey: this.authKey,
                    type: 'xml',
                    numOfRows: '100',
                    pageNo: '1',
                    ...(baseDate && { baseDt: baseDate }),
                    ...(currencyCode && { crncCd: currencyCode })
                });

                // CORS 문제 해결을 위해 백엔드 프록시를 통해 호출
                const axiosInstance = this.createAxiosInstance();
                const response: AxiosResponse<CustomsExchangeRateResponse> = await axiosInstance.get(
                    `${customsConfig.proxyUrl}/api/customs/exchange-rates`, {
                        params: {
                            targetUrl: this.baseUrl,
                            ...Object.fromEntries(params)
                        }
                    }
                );
                
                if (response.data.response.header.resultCode !== '00') {
                    throw new Error(`API 응답 오류: ${response.data.response.header.resultMsg}`);
                }

                const items = response.data.response.body.items.item;
                if (!Array.isArray(items)) {
                    return [];
                }

                return items.map(item => ({
                    currencyCode: item.cntySgn,
                    currencyName: this.getCurrencyName(item.cntySgn),
                    baseDate: item.aplyBgnDt,
                    exchangeRate: parseFloat(item.fxrt) || 0,
                    startDate: item.aplyBgnDt,
                    endDate: item.aplyEndDt
                }));

            } catch (error) {
                const errorMessage = this.formatErrorMessage(error);
                console.error('관세청 환율정보 API 호출 실패:', error);
                throw new Error(errorMessage);
            }
        };

        return this.retryRequest(requestFn);
    }

    /**
     * 특정 통화의 최신 환율 정보 조회
     * @param currencyCode 통화코드 (예: USD, EUR, JPY)
     * @returns 환율 정보
     */
    async getLatestExchangeRate(currencyCode: string): Promise<ExchangeRateInfo | null> {
        try {
            const rates = await this.getExchangeRates(undefined, currencyCode);
            return rates.length > 0 ? rates[0] : null;
        } catch (error) {
            console.error(`${currencyCode} 환율 정보 조회 실패:`, error);
            return null;
        }
    }

    /**
     * 주요 통화들의 최신 환율 정보 조회
     * @returns 주요 통화 환율 정보 배열
     */
    async getMajorExchangeRates(): Promise<ExchangeRateInfo[]> {
        const rates: ExchangeRateInfo[] = [];

        for (const currency of customsConfig.majorCurrencies) {
            try {
                const rate = await this.getLatestExchangeRate(currency);
                if (rate) {
                    rates.push(rate);
                }
            } catch (error) {
                console.warn(`${currency} 환율 정보 조회 실패:`, error);
            }
        }

        return rates;
    }

    /**
     * 국가기호를 통화명으로 변환
     * @param cntySgn 국가기호
     * @returns 통화명
     */
    private getCurrencyName(cntySgn: string): string {
        const currencyMap: { [key: string]: string } = {
            'US': 'US Dollar',
            'CN': 'Chinese Yuan',
            'EU': 'Euro',
            'JP': 'Japanese Yen'
        };
        return currencyMap[cntySgn] || cntySgn;
    }

    /**
     * API 상태 확인
     * @returns API 연결 상태
     */
    async checkApiStatus(): Promise<{ isConnected: boolean; message: string; error?: string }> {
        try {
            if (!this.authKey) {
                return {
                    isConnected: false,
                    message: 'API 키가 설정되지 않음',
                    error: 'REACT_APP_CUSTOMS_API_KEY 환경변수를 확인해주세요.'
                };
            }

            const response = await this.createAxiosInstance().get(
                `${this.baseUrl}?serviceKey=${this.authKey}&type=xml&numOfRows=1&pageNo=1`
            );
            
            return {
                isConnected: true,
                message: 'API 연결 성공'
            };
        } catch (error) {
            const errorMessage = this.formatErrorMessage(error);
            return {
                isConnected: false,
                message: 'API 연결 실패',
                error: errorMessage
            };
        }
    }

    /**
     * API 키 유효성 검증
     */
    async validateApiKey(): Promise<boolean> {
        try {
            const status = await this.checkApiStatus();
            return status.isConnected;
        } catch {
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
export const customsApiService = new CustomsApiService();

export default customsApiService;
