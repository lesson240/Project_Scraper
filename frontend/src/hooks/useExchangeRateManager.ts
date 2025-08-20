// path: frontend/src/hooks/useExchangeRateManager.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { customsApiService } from '@/apis/customsApi';
import { koreaEximApiService } from '@/apis/koreaEximApi';
import { exchangeRateStorageApiService } from '@/apis/exchangeRateStorageApi';
import type { ExchangeRateData } from '@/types/priceSetting.types';

export interface ExchangeRateManagerState {
    exchangeRates: ExchangeRateData[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    tariffPeriod: string;
}

export const useExchangeRateManager = () => {
    const [state, setState] = useState<ExchangeRateManagerState>({
        exchangeRates: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        tariffPeriod: ''
    });

    // 캐싱을 위한 ref
    const cacheRef = useRef<{
        data: ExchangeRateData[];
        timestamp: number;
        ttl: number;
        lastFetchDate: string; // YYYYMMDD 형식
    } | null>(null);

    // 캐시된 데이터가 유효한지 확인
    const isCacheValid = useCallback(() => {
        if (!cacheRef.current) return false;
        
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        
        // 1일 1회만 API 호출 (오후 12시 기준)
        if (cacheRef.current.lastFetchDate !== today) {
            return false;
        }
        
        // 캐시 TTL 체크 (24시간)
        return (now - cacheRef.current.timestamp) < cacheRef.current.ttl;
    }, []);

    // 주간 환율 정보 가져오기 (관세청)
    const fetchWeeklyRates = useCallback(async () => {
        try {
            const rates = await customsApiService.getExchangeRates();
            
            // 주간 기간 계산
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - (today.getDay() + 1)); // 월요일로 설정
            
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // 일요일까지
            
            const periodString = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}~${endDate.getFullYear()}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`;
            
            return {
                rates,
                period: periodString,
                baseDate: startDate.toISOString().split('T')[0].replace(/-/g, '')
            };
        } catch (error) {
            console.error('주간 환율 조회 실패:', error);
            throw error;
        }
    }, []);

    // 일간 환율 정보 가져오기 (한국수출입은행)
    const fetchDailyRates = useCallback(async () => {
        try {
            const rates = await koreaEximApiService.getDailyExchangeRates();
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            
            return { rates, baseDate: today };
        } catch (error) {
            console.warn('일간 환율 조회 실패 (기본값 사용):', error);
            // API 키가 없거나 에러 발생 시 기본값 반환
            const defaultRates = [
                { currencyCode: 'USD', currencyName: 'US Dollar', exchangeRate: 1350, ttb: 1340, tts: 1360, bkpr: 1350 },
                { currencyCode: 'EUR', currencyName: 'Euro', exchangeRate: 1480, ttb: 1470, tts: 1490, bkpr: 1480 },
                { currencyCode: 'JPY', currencyName: 'Japanese Yen', exchangeRate: 9.2, ttb: 9.1, tts: 9.3, bkpr: 9.2 },
                { currencyCode: 'CNY', currencyName: 'Chinese Yuan', exchangeRate: 185, ttb: 184, tts: 186, bkpr: 185 }
            ];
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            
            return { rates: defaultRates, baseDate: today };
        }
    }, []);

    // 환율 정보 통합 조회
    const fetchExchangeRates = useCallback(async () => {
        // 캐시된 데이터가 유효하면 캐시 사용
        if (isCacheValid()) {
            setState(prev => ({
                ...prev,
                exchangeRates: cacheRef.current!.data,
                lastUpdated: new Date(cacheRef.current!.timestamp)
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 주간/일간 환율 동시 조회
            const [weeklyData, dailyData] = await Promise.all([
                fetchWeeklyRates(),
                fetchDailyRates()
            ]);

            // 환율 데이터 통합
            const integratedRates: ExchangeRateData[] = weeklyData.rates.map(weeklyRate => {
                const dailyRate = dailyData.rates.find(d => d.currencyCode === weeklyRate.currencyCode);
                
                return {
                    currency: weeklyRate.currencyCode,
                    dailyRate: dailyRate?.exchangeRate || weeklyRate.exchangeRate,
                    weeklyTariff: weeklyRate.exchangeRate,
                    appliedRate: weeklyRate.exchangeRate // 초기값은 주간 환율
                };
            });

            // MongoDB에 저장
            try {
                await Promise.all([
                    exchangeRateStorageApiService.saveWeeklyExchangeRates(
                        weeklyData.rates.map(r => ({ currencyCode: r.currencyCode, appliedRate: r.exchangeRate })),
                        weeklyData.baseDate
                    ),
                    exchangeRateStorageApiService.saveDailyExchangeRates(
                        dailyData.rates.map(r => ({ currencyCode: r.currencyCode, appliedRate: r.exchangeRate })),
                        dailyData.baseDate
                    )
                ]);
            } catch (storageError) {
                console.warn('환율 정보 저장 실패 (조회는 계속 진행):', storageError);
            }

            // 캐시에 데이터 저장 (24시간 TTL)
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            cacheRef.current = {
                data: integratedRates,
                timestamp: Date.now(),
                ttl: 24 * 60 * 60 * 1000, // 24시간
                lastFetchDate: today
            };

            setState({
                exchangeRates: integratedRates,
                isLoading: false,
                error: null,
                lastUpdated: new Date(),
                tariffPeriod: weeklyData.period
            });

        } catch (error) {
            console.error('환율 정보 조회 실패:', error);
            
            let errorMessage = '환율 정보를 가져오는데 실패했습니다.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));

            // 에러 시 기본 데이터 설정
            setState(prev => ({
                ...prev,
                exchangeRates: [
                    { currency: 'USD', dailyRate: 1350, weeklyTariff: 1350, appliedRate: 1350 },
                    { currency: 'EUR', dailyRate: 1480, weeklyTariff: 1480, appliedRate: 1480 },
                    { currency: 'JPY', dailyRate: 9.2, weeklyTariff: 9.2, appliedRate: 9.2 },
                    { currency: 'CNY', dailyRate: 185, weeklyTariff: 185, appliedRate: 185 }
                ],
                tariffPeriod: '2025.08.19~2025.08.25'
            }));
        }
    }, [isCacheValid, fetchWeeklyRates, fetchDailyRates]);

    // 환율 적용값 변경
    const updateAppliedRate = useCallback((currency: string, rate: number) => {
        setState(prev => ({
            ...prev,
            exchangeRates: prev.exchangeRates.map(item =>
                item.currency === currency
                    ? { ...item, appliedRate: rate }
                    : item
            )
        }));
    }, []);

    // 초기 로드
    useEffect(() => {
        fetchExchangeRates();
    }, [fetchExchangeRates]);

    return {
        ...state,
        fetchExchangeRates,
        updateAppliedRate
    };
};
