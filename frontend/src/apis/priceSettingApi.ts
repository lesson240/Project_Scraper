// path: frontend/src/apis/priceSettingApi.ts
import axios, { AxiosInstance } from 'axios';
import {
    PriceSettingRequest,
    PriceSettingResponse,
    ExchangeRateInfo,
    SaveData,
    SellingPriceFormulaInfo,
    PlatformMarginRateInfo,
    MarginListByItems
} from '@/types/priceSetting.types';
import {
    ValidationError,
    APIError,
    NetworkError
} from '@/exceptions';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Axios 인스턴스 생성
const priceSettingApiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000, // 5초로 단축
    headers: {
        'Content-Type': 'application/json',
    },
});

// 응답 인터셉터 설정
priceSettingApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            throw new NetworkError('요청 시간이 초과되었습니다.', error);
        }

        if (error.response) {
            const { status, data } = error.response;

            if (status === 422) {
                throw new ValidationError(
                    data.detail?.message || '데이터 검증에 실패했습니다.',
                    'request',
                    data.detail?.details || data
                );
            }

            if (status >= 500) {
                throw new APIError(`서버 오류 (${status})`, status, data.detail || data);
            }

            if (status >= 400) {
                throw new APIError(`클라이언트 오류 (${status})`, status, data.detail || data);
            }
        }

        if (error.request) {
            throw new NetworkError('네트워크 연결에 실패했습니다.', error);
        }

        throw new NetworkError('알 수 없는 오류가 발생했습니다.', error);
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
                    optimizeShippingFee: saveData.formulaSettings.optimizeShippingFee
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

            // if (import.meta.env.DEV) {
            //     console.log('🚀 프론트엔드에서 백엔드로 전송하는 데이터:', transformedData);
            //     console.log('📊 데이터 구조:', {
            //         exchangeRatesInfo: transformedData.exchangeRatesInfo.length,
            //         sellingPriceFormulaInfo: Object.keys(transformedData.sellingPriceFormulaInfo),
            //         platformMarginRateInfo: Object.keys(transformedData.platformMarginRateInfo),
            //         marginListByItems: Object.keys(transformedData.marginListByItems.items)
            //     });
            //     console.log('🔍 exchangeRatesInfo 상세:', JSON.stringify(transformedData.exchangeRatesInfo, null, 2));
            //     console.log('🔍 marginListByItems 상세:', JSON.stringify(transformedData.marginListByItems, null, 2));
            //     console.log('�� platformMarginRateInfo 상세:', JSON.stringify(transformedData.platformMarginRateInfo, null, 2));
            // }

            const response = await priceSettingApiClient.post('/api/price-setting/save', transformedData);
            return response.data;

        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ API 호출 실패 상세:', {
                    error,
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
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

            // const startTime = Date.now();
            // console.log(`🕐 [타임아웃 디버깅] 개별 상품 데이터 로드 시작: ${originGoodsCode}`);
            
            const response = await priceSettingApiClient.get(`/api/price-setting/load/${originGoodsCode}`);
            
            // const endTime = Date.now();
            // const duration = endTime - startTime;
            // console.log(`🕐 [타임아웃 디버깅] 개별 상품 데이터 로드 완료: ${originGoodsCode} (${duration}ms)`);
            
            return response.data;

        } catch (error) {
            // const endTime = Date.now();
            // const duration = endTime - startTime;
            // console.log(`🕐 [타임아웃 디버깅] 개별 상품 데이터 로드 에러: ${originGoodsCode} (${duration}ms)`);
            // console.error('🕐 [타임아웃 디버깅] 에러 상세:', error);
            
            if (error instanceof APIError && error.statusCode === 404) {
                return null;
            }

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
            // const startTime = Date.now();
            // console.log('🕐 [타임아웃 디버깅] 프론트엔드 API 호출 시작');
            
            const response = await priceSettingApiClient.get('/api/price-setting/load/info');
            
            // const endTime = Date.now();
            // const duration = endTime - startTime;
            // console.log(`🕐 [타임아웃 디버깅] 프론트엔드 API 응답 시간: ${duration}ms`);
            
            // 응답 구조에 따라 데이터 반환
            if (response.data.success) {
                return response.data.data;
            } else if (response.data) {
                return response.data;
            } else {
                return null;
            }

        } catch (error) {
            // const endTime = Date.now();
            // const duration = endTime - startTime;
            // console.log(`🕐 [타임아웃 디버깅] 프론트엔드 API 에러 발생 시간: ${duration}ms`);
            // console.error('🕐 [타임아웃 디버깅] 에러 상세:', error);
            
            if (error instanceof APIError && error.statusCode === 404) {
                return null;
            }

            if (error instanceof ValidationError || error instanceof APIError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('가격 설정 정보 조회 중 오류가 발생했습니다.', error as Error);
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
