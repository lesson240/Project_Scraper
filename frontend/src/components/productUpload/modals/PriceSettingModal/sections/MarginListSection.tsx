// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/MarginListSection.tsx
import React from 'react';
import type { MarginListSectionProps } from '@/types/priceSetting.types';
import '@/styles/productUpload/modals/sections/MarginListSection.css';

export default function MarginListSection({
    selectedProducts,
    calculatedPrices,
    exchangeRates,
    platformMargins,
    onMarginChange,
    onMarginReset,
    isCalculated
}: MarginListSectionProps) {

    console.log('🔍 MarginListSection 렌더링:');
    console.log('  - selectedProducts:', selectedProducts);
    console.log('  - calculatedPrices:', calculatedPrices);
    console.log('  - isCalculated:', isCalculated);

    // 계산된 데이터 로깅
    React.useEffect(() => {
        if (isCalculated && calculatedPrices.length > 0) {
            console.log('계산된 상품 데이터:', calculatedPrices);
            console.log('선택된 상품:', selectedProducts);
            console.log('환율 정보:', exchangeRates);
            console.log('플랫폼 마진:', platformMargins);
        }
    }, [isCalculated, calculatedPrices, selectedProducts, exchangeRates, platformMargins]);

    const getExchangeRate = (currency: string) => {
        if (!exchangeRates || !Array.isArray(exchangeRates)) {
            console.warn('exchangeRates가 유효하지 않습니다:', exchangeRates);
            return 0;
        }

        const rate = exchangeRates.find(r => r?.currencyCode && r.currencyCode.includes(currency));
        return typeof rate?.appliedRate === 'number' ? rate.appliedRate : 0;
    };

    const getCalculatedPrice = (originGoodsCode: string) => {
        console.log(`🔍 상품 originGoodsCode ${originGoodsCode}에 대한 계산된 가격 검색 중...`);
        console.log(`📊 전체 calculatedPrices:`, calculatedPrices);

        // 🆕 originGoodsCode로 검색 (productId 필드가 없으므로)
        const found = calculatedPrices.find(p => p.originGoodsCode === originGoodsCode);
        console.log(`✅ 찾은 결과:`, found);

        return found;
    };

    const formatOriginalPrice = (price: number | string, currency: string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return '-';

        // 통화별 단위 표시
        switch (currency) {
            case 'JPY':
                return `¥${numPrice.toLocaleString()}`;
            case 'USD':
                return `$${numPrice.toLocaleString()}`;
            case 'EUR':
                return `€${numPrice.toLocaleString()}`;
            case 'CNY':
                return `¥${numPrice.toLocaleString()}`;
            default:
                return `${numPrice.toLocaleString()}`;
        }
    };

    return (
        <div className="margin-list-section">

            <div className="margin-formulas">
                <div className="formula-item">
                    <strong>예상마진 = 설정 상품가 - (원가 × 환율) - 국제운송료</strong>
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
                            <th>설정 상품가 (￦)</th>
                            <th>예상 마진율</th>
                            <th>예상 마진</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProducts.map((product) => {
                            const calculated = getCalculatedPrice(product.originGoodsCode);  // 🆕 product.id -> product.originGoodsCode
                            const exchangeRate = getExchangeRate(product.currency);

                            return (
                                <tr key={product.originGoodsCode}>  {/* 🆕 key도 originGoodsCode 사용 */}
                                    <td className="thumbnail-cell">
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td className="product-name">{product.name}</td>
                                    <td className="original-price">
                                        {formatOriginalPrice(product.originalPrice, product.currency)}
                                    </td>
                                    <td className="set-price">
                                        {isCalculated && calculated ? (
                                            calculated.basePrice.toLocaleString()
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="main-margin-rate">
                                        {isCalculated && calculated ? `${calculated.marginList.smartstore.ExpectedMarginRate.toFixed(2)}%` : '-'}
                                    </td>
                                    <td className="main-margin-amount">
                                        {isCalculated && calculated ?
                                            calculated.marginList.smartstore.ExpectedMargin.toLocaleString()
                                            : (
                                                '-'
                                            )}
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