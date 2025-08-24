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
        setIsLoading(true);
        setError(null);

        try {
                            const response = await getExchangeRatesForFrontend();

                if (response.success && response.data) {

                // Combined 엔드포인트 응답을 ExchangeRateData 형식으로 변환
                const updatedRates: ExchangeRateData[] = [];

                // response.data는 CombinedExchangeRateData[] 배열
                // 각 통화별로 koreaexim과 customs 데이터를 모두 포함하여 처리
                response.data.forEach((combinedData: any) => {
                    if (combinedData.currencyCode) {
                        const newRate: ExchangeRateData = {
                            currencyCode: combinedData.currencyCode,
                            baseDate: combinedData.customs?.baseDate || combinedData.koreaexim?.baseDate || '',
                            rateType: 'combined', // koreaexim과 customs 모두 포함
                            appliedRate: 0, // 사용자가 입력할 값
                            lastUpdated: new Date(),
                            source: 'manual',
                            // koreaexim과 customs 개별 환율 저장
                            koreaeximRate: combinedData.koreaexim?.appliedRate || 0,
                            customsRate: combinedData.customs?.appliedRate || 0
                        };
                        
                        updatedRates.push(newRate);
                    }
                });

                // 환율 데이터 업데이트
                setExchangeRates(updatedRates);

                // 관세 주간 업데이트 (오늘 날짜 기준)
                const today = new Date();
                const weekNumber = Math.ceil(today.getDate() / 7);
                setTariffPeriod(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${weekNumber}주차`);
            } else {
                console.warn('환율 정보 조회 실패:', response.message);
                setError(response.message || '환율 정보 조회에 실패했습니다.');
            }
        } catch (err) {
            console.error('환율 정보 조회 중 오류:', err);
            setError('환율 정보 조회 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
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