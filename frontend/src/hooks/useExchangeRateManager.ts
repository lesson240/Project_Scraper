// path: frontend/src/hooks/useExchangeRateManager.ts
import { useState, useEffect } from 'react';
import { getExchangeRatesForFrontend } from '@/apis/exchangeRateApi';
import type { ExchangeRateData, CombinedExchangeRateResponse, CombinedExchangeRateData } from '@/types/priceSetting.types';

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
            console.log('환율 정보 조회 시작...');

            const response = await getExchangeRatesForFrontend();

            if (response.success && response.data) {
                console.log('환율 정보 조회 성공:', response.data);

                // Combined 엔드포인트 응답을 ExchangeRateData 형식으로 변환
                const updatedRates: ExchangeRateData[] = [];

                // USD, CNY, JPY, EUR 순서로 처리
                const currencies = ['USD', 'CNY', 'JPY', 'EUR'];

                currencies.forEach(currency => {
                    const combinedData = response.data.find((item: any) =>
                        item.currencyCode === currency
                    );

                    if (combinedData && (combinedData.customs || combinedData.koreaexim)) {
                        // customs 데이터가 있으면 customs 우선, 없으면 koreaexim 사용
                        const sourceData = combinedData.customs || combinedData.koreaexim;

                        if (sourceData) {
                            updatedRates.push({
                                currencyCode: currency,
                                baseDate: sourceData.baseDate || '',
                                rateType: combinedData.customs ? 'weekly' : 'daily',
                                appliedRate: sourceData.appliedRate || 0,
                                lastUpdated: new Date(),
                                source: (sourceData.source as 'customs' | 'koreaexim' | 'manual') || 'manual'
                            });
                        }
                    }
                });

                // 환율 데이터 업데이트
                setExchangeRates(updatedRates);

                // 관세 주간 업데이트 (오늘 날짜 기준)
                const today = new Date();
                const weekNumber = Math.ceil(today.getDate() / 7);
                setTariffPeriod(`${today.getFullYear()}년 ${weekNumber}주차`);

                console.log('환율 데이터 업데이트 완료:', updatedRates);
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

            // 더미 데이터 업데이트 제거 - 실패 시 예외처리만 수행
            console.log('환율 동기화 완료');
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