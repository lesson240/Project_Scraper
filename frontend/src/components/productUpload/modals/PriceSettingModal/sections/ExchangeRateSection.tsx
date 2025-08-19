// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/ExchangeRateSection.tsx
import React from 'react';
import type { ExchangeRateSectionProps } from '../types/priceSetting.types';

export default function ExchangeRateSection({ exchangeRates, isLoading }: ExchangeRateSectionProps) {
    if (isLoading) {
        return (
            <div className="exchange-rate-section">
                <h3>환율 설정</h3>
                <div className="loading">환율 정보를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="exchange-rate-section">
            <div className="exchange-rate-table">
                <div className="table-header-with-note">
                    <h4>환율 정보</h4>
                    <div className="tariff-note">
                        관세 적용기간: 단위: 1원 (W)
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>기준</th>
                            <th>일일 고시환율</th>
                            <th>관세 주간환율</th>
                            <th>올땀 적용환율</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exchangeRates.map((rate, index) => (
                            <tr key={index}>
                                <td>{rate.currency}</td>
                                <td>{rate.dailyRate.toLocaleString()}</td>
                                <td>{rate.weeklyTariff}</td>
                                <td>
                                    {typeof rate.appliedRate === 'number'
                                        ? rate.appliedRate.toLocaleString()
                                        : rate.appliedRate
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
