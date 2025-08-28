// path: frontend/src/apis/exchangeRateApi.ts
import apiConfig from '@/config/api';

export interface ExchangeRateResponse {
    success: boolean;
    data: Array<{
        currencyCode: string;
        appliedRate: number;
        source: string;
        rateType: string;
        baseDate: string;
        isActive: boolean;
    }>;
    message: string;
}

export interface ExchangeRateData {
    currencyCode: string;
    appliedRate: number;
    source: string;
    rateType: string;
    baseDate: string;
    isActive: boolean;
}

/**
 * 특정 통화의 환율 정보를 가져오는 API
 * @param currencyCode 통화 코드 (예: USD, JPY, EUR, CNY)
 * @returns 환율 정보 응답
 */
export const getExchangeRateByCurrency = async (
    currencyCode: string
): Promise<ExchangeRateResponse> => {
    try {
        const response = await fetch(
            `${apiConfig.baseUrl}/api/exchange-rates/combined/${currencyCode}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ExchangeRateResponse = await response.json();
        return data;
    } catch (error) {
        console.error('환율 정보 조회 실패:', error);
        throw error;
    }
};

/**
 * 모든 통화의 환율 정보를 가져오는 API
 * @returns 모든 환율 정보 응답
 */
export const getAllExchangeRates = async (): Promise<ExchangeRateResponse> => {
    try {
        const response = await fetch(
            `${apiConfig.baseUrl}/api/exchange-rates`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ExchangeRateResponse = await response.json();
        return data;
    } catch (error) {
        console.error('전체 환율 정보 조회 실패:', error);
        throw error;
    }
};

/**
 * 프론트엔드 환율 설정 섹션 펼침 시 호출하는 API
 * MONGO_DB_NAME_EXTERNAL_API 컬렉션을 확인하고 필요시 API 호출하여 데이터 업데이트
 * @returns 프론트엔드용 환율 정보 응답
 */
export const getExchangeRatesForFrontend = async (): Promise<ExchangeRateResponse> => {
    try {
        const response = await fetch(
            `${apiConfig.baseUrl}/api/exchange-rates/frontend/expand`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ExchangeRateResponse = await response.json();
        return data;
    } catch (error) {
        console.error('프론트엔드 환율 정보 조회 실패:', error);
        throw error;
    }
};
