// path: frontend/src/apis/priceSettingApi.ts
import axios, { AxiosResponse } from 'axios';
import type { 
    PriceSettingRequest, 
    PriceSettingResponse, 
    SaveData,
    ExchangeRateInfo
} from '@/types/priceSetting.types';
import { 
    ValidationError, 
    APIError, 
    NetworkError 
} from '@/exceptions/PriceSettingExceptions';

// API 클라이언트 설정
const priceSettingApiClient = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 응답 인터셉터 - 에러 처리
priceSettingApiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response) {
            // 서버에서 응답을 받았지만 에러 상태 코드
            const { status, data } = error.response;
            throw new APIError(
                data?.message || `서버 오류 (${status})`,
                status,
                data
            );
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못함
            throw new NetworkError('네트워크 오류가 발생했습니다.', error);
        } else {
            // 요청 설정 중 오류 발생
            throw new NetworkError('요청 설정 중 오류가 발생했습니다.', error);
        }
    }
);

// 가격 설정 API
export const priceSettingApi = {
    /**
     * 가격 설정 데이터 저장 API
     * @param saveData - 저장할 가격 설정 데이터
     * @returns 저장 결과
     */
    save: async (saveData: SaveData): Promise<PriceSettingResponse> => {
        try {
            // 데이터 검증
            if (!saveData.exchangeRates || saveData.exchangeRates.length === 0) {
                throw new ValidationError('환율 데이터가 없습니다.', 'exchangeRates', saveData.exchangeRates);
            }

            if (!saveData.marginListByItems || !saveData.marginListByItems.items || Object.keys(saveData.marginListByItems.items).length === 0) {
                throw new ValidationError('계산된 상품 데이터가 없습니다.', 'marginListByItems', saveData.marginListByItems);
            }

            if (!saveData.platformMarginRateInfo) {
                throw new ValidationError('플랫폼 마진 정보가 없습니다.', 'platformMarginRateInfo', saveData.platformMarginRateInfo);
            }


            // 🆕 백엔드 모델에 맞게 데이터 변환
            const transformedData: PriceSettingRequest = {
                exchangeRatesInfo: saveData.exchangeRates.map(rate => ({
                    currencyCode: rate.currency,
                    appliedRate: rate.value,
                    lastUpdated: new Date().toISOString().slice(0, 10),
                    source: 'manual'
                })),
                sellingPriceFormulaInfo: {
                    baseMarginRate: saveData.formulaSettings.baseMarginRate,
                    additionalMargin: saveData.formulaSettings.additionalMargin,
                    baseShippingFee: saveData.formulaSettings.baseShippingFee,
                    returnShippingFee: saveData.formulaSettings.returnShippingFee,
                    exchangeShippingFee: saveData.formulaSettings.exchangeShippingFee,
                    internationalShippingFee: saveData.formulaSettings.internationalShippingFee,
                    freeShipping: saveData.formulaSettings.freeShipping,
                    optimizeShippingFee: saveData.formulaSettings.optimizeShippingFee,
                    baseDiscount: saveData.formulaSettings.baseDiscount,
                    baseDiscountUnit: saveData.formulaSettings.baseDiscountUnit
                },
                platformMarginRateInfo: {
                    smartstore: saveData.platformMarginRateInfo.smartstore,
                    coupang: saveData.platformMarginRateInfo.coupang,
                    auction: saveData.platformMarginRateInfo.auction,
                    gmarket: saveData.platformMarginRateInfo.gmarket,
                    elevenst: saveData.platformMarginRateInfo.elevenst,
                    openmarket: saveData.platformMarginRateInfo.openmarket
                },
                marginListByItems: saveData.marginListByItems
            };

            if (import.meta.env.DEV) {
                console.log('📤 가격 설정 데이터 전송 중...');
            }

            const response = await priceSettingApiClient.post('/api/price-setting/save', transformedData);
            return response.data;

        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ 가격 설정 저장 실패:', error.message);
            }

            if (error instanceof ValidationError || error instanceof APIError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('가격 설정 저장 중 오류가 발생했습니다.', error as Error);
        }
    },

    /**
     * ModifiedGoodsDetail 컬렉션에서 가격 설정 데이터 조회 API
     * @param originGoodsCode - 상품 코드
     * @returns 저장된 가격 설정 데이터
     */
    get: async (originGoodsCode: string) => {
        try {
            if (!originGoodsCode) {
                throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', originGoodsCode);
            }

            const response = await priceSettingApiClient.get(`/api/price-setting/load/${originGoodsCode}`);
            return response.data;

        } catch (error) {
            if (error instanceof ValidationError || error instanceof APIError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('가격 설정 조회 중 오류가 발생했습니다.', error as Error);
        }
    },

    /**
     * BasePriceSetting 컬렉션에서 공통 가격 설정 정보 조회 API
     * @returns 공통 가격 설정 정보
     */
    getInfo: async () => {
        try {
            const response = await priceSettingApiClient.get('/api/price-setting/load/info');
            return response.data;

        } catch (error) {
            if (error instanceof APIError && error.statusCode === 404) {
                return null;
            }
            if (error instanceof ValidationError || error instanceof APIError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('공통 가격 설정 조회 중 오류가 발생했습니다.', error as Error);
        }
    },

    /**
     * 가격 설정 데이터 삭제 API
     * @param originGoodsCode - 상품 코드
     * @returns 삭제 결과
     */
    delete: async (originGoodsCode: string) => {
        try {
            if (!originGoodsCode) {
                throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', originGoodsCode);
            }

            const response = await priceSettingApiClient.delete(`/api/price-setting/delete/${originGoodsCode}`);
            return response.data;

        } catch (error) {
            if (error instanceof ValidationError || error instanceof APIError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('가격 설정 삭제 중 오류가 발생했습니다.', error as Error);
        }
    },

    /**
     * BasePriceSetting 컬렉션에 공통 설정 저장 API
     * @param settingType - 설정 타입 ('exchangeRate' | 'formulaAndMargin')
     * @param data - 저장할 설정 데이터
     * @returns 저장 결과
     */
    saveBaseSetting: async (settingType: 'exchangeRate' | 'formulaAndMargin', data: any): Promise<PriceSettingResponse> => {
        try {
            if (!settingType || !data) {
                throw new ValidationError('설정 타입과 데이터가 필요합니다.', 'settingType', settingType);
            }

            const response = await priceSettingApiClient.post(`/api/price-setting/save/info/${settingType}`, data);
            return response.data;

        } catch (error) {
            if (error instanceof APIError && error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }
};