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
            if (!saveData.originGoodsCode) {
                throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', saveData.originGoodsCode);
            }
            
            if (!saveData.exchangeRates || saveData.exchangeRates.length === 0) {
                throw new ValidationError('환율 데이터가 없습니다.', 'exchangeRates', saveData.exchangeRates);
            }
            
            if (!saveData.calculatedProducts || saveData.calculatedProducts.length === 0) {
                throw new ValidationError('계산된 상품 데이터가 없습니다.', 'calculatedProducts', saveData.calculatedProducts);
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
                    smartstore: saveData.platformMargins.smartstore,
                    coupang: saveData.platformMargins.coupang,
                    auction: saveData.platformMargins.auction,
                    gmarket: saveData.platformMargins.gmarket,
                    elevenst: saveData.platformMargins.elevenst,
                    openmarket: saveData.platformMargins.openmarket
                },
                marginListByItems: {
                    items: Object.fromEntries(
                        saveData.calculatedProducts.map(product => [
                            product.originGoodsCode,
                            {
                                smartstore: {
                                    ExpectedMargin: product.marginList.smartstore?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.smartstore?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.smartstore?.selling_price || 0
                                },
                                coupang: {
                                    ExpectedMargin: product.marginList.coupang?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.coupang?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.coupang?.selling_price || 0
                                },
                                auction: {
                                    ExpectedMargin: product.marginList.auction?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.auction?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.auction?.selling_price || 0
                                },
                                gmarket: {
                                    ExpectedMargin: product.marginList.gmarket?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.gmarket?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.gmarket?.selling_price || 0
                                },
                                elevenst: {
                                    ExpectedMargin: product.marginList.elevenst?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.elevenst?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.elevenst?.selling_price || 0
                                },
                                openmarket: {
                                    ExpectedMargin: product.marginList.openmarket?.ExpectedMargin || 0,
                                    ExpectedMarginRate: product.marginList.openmarket?.ExpectedMarginRate || 0,
                                    selling_price: product.marginList.openmarket?.selling_price || 0
                                }
                            }
                        ])
                    )
                }
            };
            
            if (import.meta.env.DEV) {
                console.log('🚀 프론트엔드에서 백엔드로 전송하는 데이터:', transformedData);
                console.log('📊 데이터 구조:', {
                    exchangeRatesInfo: transformedData.exchangeRatesInfo.length,
                    sellingPriceFormulaInfo: Object.keys(transformedData.sellingPriceFormulaInfo),
                    platformMarginRateInfo: Object.keys(transformedData.platformMarginRateInfo),
                    marginListByItems: Object.keys(transformedData.marginListByItems.items)
                });
            }
            
            const response = await priceSettingApiClient.post('/api/price-setting/save', transformedData);
            return response.data;
            
        } catch (error) {
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
            const response = await priceSettingApiClient.get('/api/price-setting/load/info');
            return response.data;
            
        } catch (error) {
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
     * 저장된 가격 설정 데이터를 조회합니다.
     * @param originGoodsCode 원본 상품 코드
     * @returns 저장된 가격 설정 데이터
     */
    load: async (originGoodsCode: string): Promise<any> => {
        try {
            if (!originGoodsCode) {
                throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', originGoodsCode);
            }
            
            const response = await axios.get(`${API_BASE_URL}/api/price-setting/load/${originGoodsCode}`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                return null;
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            
            throw new NetworkError('가격 설정 데이터 로드 중 오류가 발생했습니다.', error as Error);
        }
    }
};
