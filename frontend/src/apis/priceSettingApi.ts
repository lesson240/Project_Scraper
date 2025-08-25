// path: frontend/src/apis/priceSettingApi.ts

import axios from 'axios';
import type { PriceSettingRequest } from '@/types/priceSetting.types';
import { createExchangeRateData } from '@/types/priceSetting.types';

// API 기본 설정 - 기존 환경변수 패턴 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30초

// Axios 인스턴스 생성
const priceSettingApiClient = axios.create({
    baseURL: `${API_BASE_URL}`,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - 로깅
priceSettingApiClient.interceptors.request.use(
    (config) => {
        console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ API 요청 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
priceSettingApiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API 응답: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API 응답 에러:', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

/**
 * 가격 설정 데이터 저장 API
 */
export const priceSettingApi = {
    /**
     * 가격 설정 데이터를 백엔드로 전송하여 저장
     * @param saveData - 저장할 가격 설정 데이터
     * @returns 저장 결과
     */
    save: async (saveData: PriceSettingRequest) => {
        try {
            console.log('💾 가격 설정 저장 요청:', saveData);

            // 데이터 변환: undefined 값 처리 및 기본값 설정
            const transformedData = {
                ...saveData,
                exchangeRates: saveData.exchangeRates.map(rate => {
                    // undefined 값 처리: 기본값 설정
                    const finalCurrencyCode = rate.currencyCode || 'KRW';
                    const finalAppliedRate = rate.appliedRate || 1.0; // 기본 환율 1.0
                    
                    // 날짜 형식 강제 변환: ISO 8601 → YYYY-MM-DD
                    let finalLastUpdated;
                    if (rate.lastUpdated) {
                        // ISO 8601 형식이든 다른 형식이든 YYYY-MM-DD로 변환
                        const date = new Date(rate.lastUpdated);
                        if (!isNaN(date.getTime())) {
                            finalLastUpdated = date.toISOString().slice(0, 10); // YYYY-MM-DD
                        } else {
                            finalLastUpdated = new Date().toISOString().slice(0, 10); // 오늘 날짜
                        }
                    } else {
                        finalLastUpdated = new Date().toISOString().slice(0, 10); // 오늘 날짜
                    }
                    
                    return {
                        currencyCode: finalCurrencyCode,
                        appliedRate: finalAppliedRate,
                        lastUpdated: finalLastUpdated, // YYYY-MM-DD 형식 보장
                        source: rate.source || 'manual'
                    };
                }),
                // updatedProducts 필드 추가 (백엔드 요구사항)
                updatedProducts: saveData.updatedProducts || [],
                // 다른 필수 필드들도 기본값 보장
                formulaSettings: saveData.formulaSettings || {},
                platformMargins: saveData.platformMargins || {},
                calculatedProducts: saveData.calculatedProducts || [],
                originGoodsCode: saveData.originGoodsCode || '',

                // 🆕 새로운 필드들 추가
                // allttamExchangeRates 제거 - manuel로 통합
                baseSellingPriceFormula: saveData.baseSellingPriceFormula || {},
                additionalSellingPriceFormula: saveData.additionalSellingPriceFormula || {}
            };
            
            // 🆕 각 필드별 상세 로깅
            console.log('🔍 전송 데이터 상세 분석:');
            console.log('  - exchangeRates:', transformedData.exchangeRates);
            // allttamExchangeRates 로깅 제거
            console.log('  - baseSellingPriceFormula:', transformedData.baseSellingPriceFormula);
            console.log('  - additionalSellingPriceFormula:', transformedData.additionalSellingPriceFormula);
            // platformMargins 로깅 제거
            console.log('  - updatedProducts:', transformedData.updatedProducts);
            
            console.log('🔄 변환된 데이터:', transformedData);
            
            const response = await priceSettingApiClient.post('/v1/api/price-setting/save', transformedData);
            
            console.log('✅ 가격 설정 저장 성공:', response.data);
            return response.data;
            
        } catch (error: any) {
            console.error('❌ 가격 설정 저장 실패:', error);
            
            // 에러 타입별 처리
            if (error.response) {
                // 서버 응답이 있는 경우
                const { status, data } = error.response;
                
                switch (status) {
                    case 400:
                        throw new Error(`잘못된 요청: ${data?.message || '데이터 형식이 올바르지 않습니다.'}`);
                    case 401:
                        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
                    case 403:
                        throw new Error('권한이 없습니다.');
                    case 404:
                        throw new Error('요청한 리소스를 찾을 수 없습니다.');
                    case 422:
                        throw new Error(`데이터 검증 실패: ${data?.message || '입력 데이터를 확인해주세요.'}`);
                    case 500:
                        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    default:
                        throw new Error(`저장 실패 (${status}): ${data?.message || '알 수 없는 오류가 발생했습니다.'}`);
                }
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우
                if (error.code === 'ECONNABORTED') {
                    throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
                }
                throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
            } else {
                // 요청 자체를 보내지 못한 경우
                throw new Error(`요청 실패: ${error.message}`);
            }
        }
    },

    /**
     * 가격 설정 데이터 조회 API
     * @param originGoodsCode - 상품 코드
     * @returns 저장된 가격 설정 데이터
     */
    get: async (originGoodsCode: string) => {
        try {
            console.log('📋 가격 설정 조회 요청:', originGoodsCode);
            
            const response = await priceSettingApiClient.get(`/price-setting/${originGoodsCode}`);
            
            console.log('✅ 가격 설정 조회 성공:', response.data);
            return response.data;
            
        } catch (error: any) {
            console.error('❌ 가격 설정 조회 실패:', error);
            
            if (error.response?.status === 404) {
                // 데이터가 없는 경우 null 반환
                return null;
            }
            
            throw error;
        }
    },

    /**
     * 가격 설정 데이터 삭제 API
     * @param originGoodsCode - 상품 코드
     * @returns 삭제 결과
     */
    delete: async (originGoodsCode: string) => {
        try {
            console.log('🗑️ 가격 설정 삭제 요청:', originGoodsCode);
            
            const response = await priceSettingApiClient.delete(`/price-setting/${originGoodsCode}`);
            
            console.log('✅ 가격 설정 삭제 성공:', response.data);
            return response.data;
            
        } catch (error: any) {
            console.error('❌ 가격 설정 삭제 실패:', error);
            throw error;
        }
    },

    /**
     * 저장된 가격 설정 데이터를 조회합니다.
     * @param originGoodsCode 원본 상품 코드
     * @returns 저장된 가격 설정 데이터
     */
    load: async (originGoodsCode: string): Promise<any> => {
        try {
            console.log('🔍 저장된 가격 설정 데이터 조회 시작:', originGoodsCode);
            
            const response = await axios.get(`${API_BASE_URL}/v1/api/price-setting/load/${originGoodsCode}`);
            
            if (response.data.success) {
                console.log('✅ 저장된 가격 설정 데이터 조회 성공:', response.data.data);
                return response.data.data;
            } else {
                console.warn('⚠️ 저장된 가격 설정 데이터가 없음:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('❌ 가격 설정 데이터 조회 실패:', error);
            throw error;
        }
    }
};

export default priceSettingApi;
