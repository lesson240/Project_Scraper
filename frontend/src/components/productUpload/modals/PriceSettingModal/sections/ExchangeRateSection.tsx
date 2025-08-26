// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/ExchangeRateSection.tsx
import React from 'react';
import NumberInput from '@/components/common/NumberInput';
import type { ExchangeRateSectionProps } from '@/types/priceSetting.types';
import '@/styles/productUpload/modals/sections/ExchangeRateSection.css';

export default function ExchangeRateSection({
    exchangeRates,
    isLoading,
    tariffPeriod,
    error,
    onAppliedRateChange,
    onSyncRates
}: ExchangeRateSectionProps) {
    if (isLoading) {
        return (
            <div className="exchange-rate-section">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">환율 정보를 불러오는 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="exchange-rate-section">
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{error}</span>
                </div>
            )}

            <div className="exchange-rate-table">
                <div className="table-header-with-note">
                    <h4>환율 정보</h4>
                    <div className="tariff-info">
                        <div className="tariff-note">
                            단위: 1원 (￦)
                        </div>
                        <div className="tariff-period">
                            관세 주간: {tariffPeriod}
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>통화</th>
                                <th>일일 고시환율</th>
                                <th>관세 주간환율</th>
                                <th>올땀 적용환율</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['USD', 'CNY', 'JPY', 'EUR'].map((currency) => {
                                // 해당 통화의 환율 데이터 찾기
                                const rateData = exchangeRates.find(rate =>
                                    rate.currencyCode === currency
                                );

                                // 일일 고시환율: koreaexim 데이터 사용
                                const dailyRate = rateData?.koreaexim?.appliedRate || 0;

                                // 관세 주간환율: customs 데이터 사용
                                const weeklyTariff = rateData?.customs?.appliedRate || 0;

                                // 적용환율: appliedRate 값 사용
                                const appliedRate = rateData?.appliedRate || 0;

                                // 🆕 데이터 확인을 위한 로깅
                                console.log(`🔍 ${currency} 통화 데이터:`, {
                                    rateData,
                                    dailyRate,
                                    weeklyTariff,
                                    appliedRate,
                                    koreaexim: rateData?.koreaexim,
                                    customs: rateData?.customs
                                });

                                return (
                                    <tr key={currency}>
                                        <td className="currency-code">{currency}</td>
                                        <td className="daily-rate">{dailyRate.toLocaleString()}</td>
                                        <td className="weekly-tariff">{weeklyTariff.toLocaleString()}</td>
                                        <td className="applied-rate-cell">
                                            <NumberInput
                                                value={appliedRate}
                                                onChange={(value) => {
                                                    console.log(`${currency} 환율 변경:`, value);
                                                    onAppliedRateChange(currency, value);
                                                }}
                                                placeholder="환율 입력"
                                                min={0}
                                                step={0.1}
                                                className="exchange-rate-number-input table-cell"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* <div className="table-footer">
                <button className="btn-calculate-margin" onClick={onSyncRates}>예상 마진</button>
                </div> */}
            </div>
        </div>
    );
}
