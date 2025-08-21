// path: frontend/src/hooks/useExchangeRateSync.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

export interface ExchangeRateData {
    currency: string;
    dailyRate: number;
    weeklyTariff: number;
    appliedRate: number;
}

export interface ExchangeRateSyncResponse {
    success: boolean;
    data: ExchangeRateData[];
    message: string;
    source: 'cache' | 'api' | 'initialized';
    lastUpdated: string;
    dailyRateDate: string;
    weeklyTariffDate: string;
    isDailyRateValid: boolean;
    isWeeklyTariffValid: boolean;
}

export interface ExchangeRateSyncState {
    exchangeRates: ExchangeRateData[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    dailyRateDate: string;
    weeklyTariffDate: string;
    isDailyRateValid: boolean;
    isWeeklyTariffValid: boolean;
    source: string;
}

export const useExchangeRateSync = () => {
    const [state, setState] = useState<ExchangeRateSyncState>({
        exchangeRates: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        dailyRateDate: '',
        weeklyTariffDate: '',
        isDailyRateValid: false,
        isWeeklyTariffValid: false,
        source: 'cache'
    });

    const baseUrl = 'http://localhost:8000';

    const syncExchangeRates = useCallback(async (forceSync: boolean = false) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axios.post<ExchangeRateSyncResponse>(
                `${baseUrl}/v1/api/exchange-rate-sync/sync`,
                { force_sync: forceSync }
            );

            if (response.data.success) {
                setState({
                    exchangeRates: response.data.data || [],
                    isLoading: false,
                    error: null,
                    lastUpdated: new Date(response.data.lastUpdated),
                    dailyRateDate: response.data.dailyRateDate,
                    weeklyTariffDate: response.data.weeklyTariffDate,
                    isDailyRateValid: response.data.isDailyRateValid,
                    isWeeklyTariffValid: response.data.isWeeklyTariffValid,
                    source: response.data.source
                });
            } else {
                throw new Error(response.data.message || '환율 동기화에 실패했습니다.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '환율 동기화 중 오류가 발생했습니다.';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            throw error;
        }
    }, []);

    const updateAppliedRate = useCallback((currency: string, rate: number) => {
        setState(prev => ({
            ...prev,
            exchangeRates: prev.exchangeRates.map(rateData =>
                rateData.currency === currency
                    ? { ...rateData, appliedRate: rate }
                    : rateData
            )
        }));
    }, []);

    const getTariffPeriod = useCallback(() => {
        if (!state.weeklyTariffDate) return '로딩 중...';

        try {
            const date = new Date(
                parseInt(state.weeklyTariffDate.substring(0, 4)),
                parseInt(state.weeklyTariffDate.substring(4, 6)) - 1,
                parseInt(state.weeklyTariffDate.substring(6, 8))
            );

            // 주간 기간 계산 (월요일 ~ 일요일)
            const dayOfWeek = date.getDay();
            const monday = new Date(date);
            monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            return `${monday.getFullYear()}.${String(monday.getMonth() + 1).padStart(2, '0')}.${String(monday.getDate()).padStart(2, '0')}~${sunday.getFullYear()}.${String(sunday.getMonth() + 1).padStart(2, '0')}.${String(sunday.getDate()).padStart(2, '0')}`;
        } catch (error) {
            return '날짜 형식 오류';
        }
    }, [state.weeklyTariffDate]);

    return {
        ...state,
        syncExchangeRates,
        updateAppliedRate,
        getTariffPeriod
    };
};
