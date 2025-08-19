// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/MarginListSection.tsx
import React from 'react';
import type { MarginListSectionProps } from '../types/priceSetting.types';

export default function MarginListSection({
    selectedProducts,
    calculatedPrices,
    exchangeRates
}: MarginListSectionProps) {
    const getExchangeRate = (currency: string) => {
        const rate = exchangeRates.find(r => r.currency.includes(currency));
        return typeof rate?.appliedRate === 'number' ? rate.appliedRate : 0;
    };

    const getCalculatedPrice = (productId: string) => {
        return calculatedPrices.find(p => p.productId === productId);
    };

    return (
        <div className="margin-list-section">
            <h3>마진 목록</h3>

            <div className="margin-formulas">
                <div className="formula-item">
                    <strong>예상마진 = 설정 상품가 - (원가 × 환율) - 배송비</strong>
                </div>
                <div className="formula-item">
                    <strong>예상마진율(%) = 예상마진 ÷ 설정 상품가</strong>
                </div>
            </div>

            <div className="margin-table">
                <table>
                    <thead>
                        <tr>
                            <th>썸네일</th>
                            <th>상품명</th>
                            <th>원본 할인가</th>
                            <th>설정 상품가 (W)</th>
                            <th>예상 마진율</th>
                            <th>예상 마진</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProducts.map((product) => {
                            const calculated = getCalculatedPrice(product.id);
                            const exchangeRate = getExchangeRate(product.currency);

                            return (
                                <tr key={product.id}>
                                    <td className="thumbnail-cell">
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td className="product-name">{product.name}</td>
                                    <td className="original-price">{product.originalPrice}</td>
                                    <td className="set-price">
                                        {calculated ? (
                                            <>
                                                {calculated.basePrice.toLocaleString()} -
                                                {calculated.platformPrices.coupang.toLocaleString()}
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="margin-rate">
                                        {calculated ? `${calculated.expectedMarginRate.toFixed(0)}%` : '-'}
                                    </td>
                                    <td className="margin-amount">
                                        {calculated ? (
                                            <>
                                                {calculated.expectedMargin.toLocaleString()} -
                                                {(calculated.expectedMargin * 1.15).toLocaleString()}
                                            </>
                                        ) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
