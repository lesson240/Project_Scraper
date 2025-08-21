// path: frontend/src/hooks/useExchangeRateManager.ts
import { useState, useEffect } from 'react';
import { getExchangeRatesForFrontend } from '@/apis/exchangeRateApi';
import type { ExchangeRateData } from '@/types/priceSetting.types';

export function useExchangeRateManager() {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRateData[]>([
        {
            currency: 'USD',
            dailyRate: 1350,
            weeklyTariff: 1350,
            appliedRate: 1350,
            lastUpdated: new Date(),
            source: 'manual'
        },
        {
            currency: 'CNY',
            dailyRate: 185,
            weeklyTariff: 185,
            appliedRate: 185,
            lastUpdated: new Date(),
            source: 'manual'
        },
        {
            currency: 'EUR',
            dailyRate: 1470,
            weeklyTariff: 1470,
            appliedRate: 1470,
            lastUpdated: new Date(),
            source: 'manual'
        },
        {
            currency: 'JPY',
            dailyRate: 9.1,
            weeklyTariff: 9.1,
            appliedRate: 9.1,
            lastUpdated: new Date(),
            source: 'manual'
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tariffPeriod, setTariffPeriod] = useState('2024년 1주차');

    const updateAppliedRate = (currency: string, value: number) => {
        setExchangeRates(prev =>
            prev.map(rate =>
                rate.currency === currency
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
            console.log('프론트엔드 환율 정보 조회 시작...');

            const response = await getExchangeRatesForFrontend();

            if (response.success && response.data) {
                console.log('프론트엔드 환율 정보 조회 성공:', response.data);

                // API 응답 데이터를 ExchangeRateData 형식으로 변환
                const updatedRates: ExchangeRateData[] = response.data.map((item: any) => ({
                    currency: item.currency,
                    dailyRate: item.dailyRate || 0,
                    weeklyTariff: item.weeklyTariff || 0,
                    appliedRate: item.appliedRate || 0,
                    lastUpdated: new Date(),
                    source: item.source || 'api'
                }));

                // 환율 데이터 업데이트
                setExchangeRates(updatedRates);

                // 관세 주간 업데이트 (오늘 날짜 기준)
                const today = new Date();
                const weekNumber = Math.ceil(today.getDate() / 7);
                setTariffPeriod(`${today.getFullYear()}년 ${weekNumber}주차`);

                console.log('환율 데이터 업데이트 완료:', updatedRates);
            } else {
                console.warn('프론트엔드 환율 정보 조회 실패:', response.message);
                setError(response.message || '환율 정보 조회에 실패했습니다.');
            }
        } catch (err) {
            console.error('프론트엔드 환율 정보 조회 중 오류:', err);
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

            // 더미 데이터로 업데이트
            setExchangeRates(prev =>
                prev.map(rate => ({
                    ...rate,
                    dailyRate: rate.dailyRate + Math.floor(Math.random() * 10) - 5,
                    weeklyTariff: rate.weeklyTariff + Math.floor(Math.random() * 10) - 5,
                    lastUpdated: new Date()
                }))
            );

            setTariffPeriod('2024년 1주차');
        } catch (err) {
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
