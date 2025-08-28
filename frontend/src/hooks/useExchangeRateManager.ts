// path: frontend/src/hooks/useExchangeRateManager.ts
import { useState, useEffect } from 'react';
import { getExchangeRatesForFrontend, type ExchangeRateResponse } from '@/apis/exchangeRateApi';
import type { ExchangeRateData } from '@/types/priceSetting.types';

export function useExchangeRateManager() {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRateData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tariffPeriod, setTariffPeriod] = useState('');

    const updateAppliedRate = (currency: string, value: number) => {
        setExchangeRates(prev =>
            prev.map(rate =>
                rate.currencyCode === currency
                    ? { ...rate, appliedRate: value }
                    : rate
            )
        );
    };

    // 프론트엔드 전용 API 호출하여 환율 데이터 업데이트
    const fetchFrontendExchangeRates = async () => {
        if (import.meta.env.DEV) {
            console.log('🔄 환율 데이터 로딩 시작...');
        }

        setIsLoading(true);
        setError(null);

        try {
            if (import.meta.env.DEV) {
                console.log('📡 API 호출: /api/exchange-rates/frontend/expand');
            }

            const response = await getExchangeRatesForFrontend();
            
            if (import.meta.env.DEV) {
                console.log('🔍 백엔드 응답:', { 
                    success: response.success, 
                    dataCount: response.data?.length || 0,
                    message: response.message
                });
            }

            if (response.success && response.data) {
                // Combined 엔드포인트 응답을 ExchangeRateData 형식으로 변환
                const updatedRates: ExchangeRateData[] = [];

                if (import.meta.env.DEV) {
                    console.log('🔄 환율 데이터 변환 시작...');
                }

                // response.data는 CombinedExchangeRateData[] 배열
                // 각 통화별로 koreaexim과 customs 데이터를 모두 포함하여 처리
                response.data.forEach((combinedData: any) => {
                    if (import.meta.env.DEV) {
                        console.log(`🔍 ${combinedData.currencyCode} 통화 처리 중...`);
                    }
                    
                    if (combinedData.currencyCode) {
                        // appliedRate를 실제 환율 값으로 초기화 (0이 아닌)
                        let initialAppliedRate = 0;
                        
                        // KRW가 아닌 통화의 경우 기본값 설정
                        if (combinedData.currencyCode === 'USD') {
                            initialAppliedRate = 1400; // 기본값
                        } else if (combinedData.currencyCode === 'CNY') {
                            initialAppliedRate = 200;  // 기본값
                        } else if (combinedData.currencyCode === 'JPY') {
                            initialAppliedRate = 10;   // 기본값
                        } else if (combinedData.currencyCode === 'EUR') {
                            initialAppliedRate = 1700; // 기본값
                        } else if (combinedData.currencyCode === 'KRW') {
                            initialAppliedRate = 1;    // 원화는 항상 1
                        }
                        
                        const newRate: ExchangeRateData = {
                            currencyCode: combinedData.currencyCode,
                            appliedRate: initialAppliedRate, // 실제 환율 값으로 초기화
                            lastUpdated: new Date().toISOString().slice(0, 10), // YYYY-MM-DD 형식
                            source: 'manual',
                            // customs와 koreaexim 데이터 추가
                            customs: combinedData.customs || null,
                            koreaexim: combinedData.koreaexim || null
                        };
                        
                        updatedRates.push(newRate);
                        
                        if (import.meta.env.DEV) {
                            console.log(`💱 ${combinedData.currencyCode} 환율 초기화: ${initialAppliedRate}`);
                        }
                    }
                });

                // 환율 데이터 업데이트
                setExchangeRates(updatedRates);
                
                if (import.meta.env.DEV) {
                    console.log('✅ 환율 데이터 업데이트 완료:', updatedRates.length, '개 통화');
                    console.log('📊 최종 환율 데이터:', updatedRates);
                }

                // 관세 주간 업데이트 (오늘 날짜 기준)
                const today = new Date();
                const weekNumber = Math.ceil(today.getDate() / 7);
                setTariffPeriod(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${weekNumber}주차`);
            } else {
                if (import.meta.env.DEV) {
                    console.warn('⚠️ 환율 정보 조회 실패:', response.message);
                }
                setError(response.message || '환율 정보 조회에 실패했습니다.');
            }
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('❌ 환율 정보 조회 중 오류:', err);
            }
            setError('환율 정보 조회 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            if (import.meta.env.DEV) {
                console.log('🏁 환율 데이터 로딩 완료');
            }
        }
    };

    const syncExchangeRates = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: 실제 API 호출로 대체
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error('환율 동기화 중 오류:', err);
            setError('환율 동기화 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        exchangeRates,
        isLoading,
        error,
        tariffPeriod,
        updateAppliedRate,
        syncExchangeRates,
        fetchFrontendExchangeRates
    };
}