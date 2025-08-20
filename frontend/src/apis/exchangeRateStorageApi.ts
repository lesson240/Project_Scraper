// path: frontend/src/apis/exchangeRateStorageApi.ts
import axios from 'axios';

export interface ExchangeRateStorage {
    id?: string;
    currencyCode: string;
    appliedRate: number;
    source: 'customs' | 'koreaexim' | 'manual';
    rateType: 'weekly' | 'daily';  // 주간/일간 구분
    baseDate: string;              // 기준 날짜 (YYYYMMDD)
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface ExchangeRateStorageResponse {
    success: boolean;
    data?: ExchangeRateStorage;
    message?: string;
}

class ExchangeRateStorageApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    }

    /**
     * 환율 정보 저장 (MongoDB) - 주간/일간 분리
     * @param exchangeRates 저장할 환율 정보 배열
     * @returns 저장 결과
     */
    async saveExchangeRates(exchangeRates: Omit<ExchangeRateStorage, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ExchangeRateStorageResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/exchange-rates/bulk`, {
                exchangeRates
            });

            return {
                success: true,
                data: response.data,
                message: '환율 정보가 성공적으로 저장되었습니다.'
            };
        } catch (error) {
            console.error('환율 정보 저장 실패:', error);
            return {
                success: false,
                message: '환율 정보 저장에 실패했습니다.'
            };
        }
    }

    /**
     * 주간 환율 정보 저장 (관세청)
     * @param exchangeRates 주간 환율 정보
     * @param baseDate 기준 날짜
     * @returns 저장 결과
     */
    async saveWeeklyExchangeRates(exchangeRates: Array<{currencyCode: string, appliedRate: number}>, baseDate: string): Promise<ExchangeRateStorageResponse> {
        const weeklyRates = exchangeRates.map(rate => ({
            currencyCode: rate.currencyCode,
            appliedRate: rate.appliedRate,
            source: 'customs' as const,
            rateType: 'weekly' as const,
            baseDate,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        }));

        return this.saveExchangeRates(weeklyRates);
    }

    /**
     * 일간 환율 정보 저장 (한국수출입은행)
     * @param exchangeRates 일간 환율 정보
     * @param baseDate 기준 날짜
     * @returns 저장 결과
     */
    async saveDailyExchangeRates(exchangeRates: Array<{currencyCode: string, appliedRate: number}>, baseDate: string): Promise<ExchangeRateStorageResponse> {
        const dailyRates = exchangeRates.map(rate => ({
            currencyCode: rate.currencyCode,
            appliedRate: rate.appliedRate,
            source: 'koreaexim' as const,
            rateType: 'daily' as const,
            baseDate,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        }));

        return this.saveExchangeRates(dailyRates);
    }

    /**
     * 특정 통화의 저장된 환율 정보 조회
     * @param currencyCode 통화코드
     * @returns 환율 정보
     */
    async getStoredExchangeRate(currencyCode: string): Promise<ExchangeRateStorage | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/exchange-rates/${currencyCode}`);
            return response.data;
        } catch (error) {
            console.error('저장된 환율 정보 조회 실패:', error);
            return null;
        }
    }

    /**
     * 모든 저장된 환율 정보 조회
     * @returns 환율 정보 배열
     */
    async getAllStoredExchangeRates(): Promise<ExchangeRateStorage[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/exchange-rates`);
            return response.data;
        } catch (error) {
            console.error('저장된 환율 정보 전체 조회 실패:', error);
            return [];
        }
    }

    /**
     * 환율 정보 업데이트
     * @param currencyCode 통화코드
     * @param appliedRate 적용환율
     * @returns 업데이트 결과
     */
    async updateExchangeRate(currencyCode: string, appliedRate: number): Promise<ExchangeRateStorageResponse> {
        try {
            const response = await axios.put(`${this.baseUrl}/api/exchange-rates/${currencyCode}`, {
                appliedRate,
                updatedAt: new Date()
            });

            return {
                success: true,
                data: response.data,
                message: '환율 정보가 성공적으로 업데이트되었습니다.'
            };
        } catch (error) {
            console.error('환율 정보 업데이트 실패:', error);
            return {
                success: false,
                message: '환율 정보 업데이트에 실패했습니다.'
            };
        }
    }
}

export const exchangeRateStorageApiService = new ExchangeRateStorageApiService();
