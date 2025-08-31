// path: frontend/src/components/productUpload/modals/PriceSettingByItemModal/sections/ExchangeRateSection.tsx
import React from 'react';
import type { ExchangeRateSectionProps } from '@/types/priceSetting.types';
import '@/styles/productUpload/modals/PriceSettingModal/sections/ExchangeRateSection.css';

export default function ExchangeRateByItemSection({
    exchangeRates,
    tariffPeriod,
    error,
    onAppliedRateChange
}: Omit<ExchangeRateSectionProps, 'isLoading' | 'onSyncRates'>) {
    if (error) {
        return (
            <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
            </div>
        );
    }

    // 환율 데이터 검증 및 포맷팅 함수
    const formatRate = (rate: number | null | undefined): string => {
        if (rate === null || rate === undefined || rate === 0) {
            return 'N/A';
        }
        return rate.toLocaleString();
    };

    return (
        <div className="exchange-rate-section">
            <div className="table-header-with-note">
                <h4>환율 정보</h4>
                <div className="tariff-info">
                    <span className="tariff-note">
                        관세청 환율 기준으로 설정됩니다.
                    </span>
                    <span className="tariff-period">
                        기준일: {tariffPeriod}
                    </span>
                </div>
            </div>

            <div className="exchange-rate-table">
                <table>
                    <thead>
                        <tr>
                            <th>통화</th>
                            <th>일일 환율</th>
                            <th>주간 관세</th>
                            <th>적용 환율</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exchangeRates.map((rate, index) => (
                            <tr key={index}>
                                <td className="currency-code">{rate.currencyCode}</td>
                                <td className="daily-rate">
                                    {formatRate(rate.customs?.appliedRate || rate.koreaexim?.appliedRate)}
                                </td>
                                <td className="weekly-tariff">
                                    {formatRate(rate.customs?.appliedRate)}
                                </td>
                                <td className="applied-rate-cell">
                                    <input
                                        type="number"
                                        className="applied-rate-input"
                                        value={rate.appliedRate || ''}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value)) {
                                                onAppliedRateChange(rate.currencyCode, value);
                                            }
                                        }}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
