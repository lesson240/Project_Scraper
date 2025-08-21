import { useState, useEffect } from 'react';
import type { ExchangeRate } from '@/types/priceSetting.types';

export function useExchangeRate() {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                setIsLoading(true);

                // TODO: 실제 외부 API 연동
                // 현재는 더미 데이터 사용
                const mockRates: ExchangeRate[] = [
                    {
                        currency: '달러 1$',
                        dailyRate: 1390.3,
                        weeklyTariff: 0,
                        appliedRate: 1337
                    },
                    {
                        currency: '위안화 1¥',
                        dailyRate: 193.49,
                        weeklyTariff: 0,
                        appliedRate: 185
                    },
                    {
                        currency: '유로 1€',
                        dailyRate: 1623.24,
                        weeklyTariff: 0,
                        appliedRate: '준비중'
                    },
                    {
                        currency: '엔화 100¥',
                        dailyRate: 940.89,
                        weeklyTariff: 0,
                        appliedRate: '준비중'
                    }
                ];

                // 실제 API 연동 시 아래 주석 해제
                // const response = await fetch('/api/exchange-rates');
                // const data = await response.json();
                // setExchangeRates(data);

                setExchangeRates(mockRates);
                setIsLoading(false);
            } catch (error) {
                console.error('환율 정보 조회 실패:', error);
                setIsLoading(false);
            }
        };

        fetchExchangeRates();
    }, []);

    return { exchangeRates, isLoading };
}
