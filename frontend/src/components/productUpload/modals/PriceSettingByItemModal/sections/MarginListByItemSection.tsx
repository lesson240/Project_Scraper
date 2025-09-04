// path: frontend/src/components/productUpload/modals/PriceSettingByItemModal/sections/MarginListSection.tsx
import React from 'react';
import type { MarginListSectionProps } from '@/types/priceSetting.types';
import { useItemInformStyling } from '@/hooks/useItemInformStyling';
import '@/styles/productUpload/modals/PriceSettingModal/sections/MarginListSection.css';

export default function MarginListByItemSection({
    selectedProducts,
    calculatedPrices,
    exchangeRates,
    platformMargins,
    sellingPriceFormulaInfo,
    onMarginChange,
    onMarginReset,
    isCalculated
}: MarginListSectionProps) {

    const { getPriceClass, getMarginClass, getSoldOutClass, getDateClass } = useItemInformStyling();

    const getExchangeRate = (currency: string) => {
        if (!exchangeRates || !Array.isArray(exchangeRates)) {
            console.warn('exchangeRates가 유효하지 않습니다:', exchangeRates);
            return 0;
        }

        const rate = exchangeRates.find(r => r?.currencyCode && r.currencyCode.includes(currency));
        return typeof rate?.appliedRate === 'number' ? rate.appliedRate : 0;
    };

    const getCalculatedPrice = (originGoodsCode: string) => {
        const found = calculatedPrices.find(p => p.originGoodsCode === originGoodsCode);
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
                    <strong>예상마진 = 설정 상품가 - ((원가 or 할인가) × 환율) - 국제운송료</strong>
                </div>
                <div className="formula-item">
                    <strong>예상마진율(%) = 예상마진 ÷ 설정 상품가</strong>
                </div>
                <div className="formula-item">
                    <div className="color-legend">
                        <strong>텍스트 색상 =</strong>
                        <span className="color-indicator">
                            <span className="color-box color-high"></span>
                            <span className="color-text">높음</span>
                        </span>
                        <span className="color-indicator">
                            <span className="color-box color-medium"></span>
                            <span className="color-text">중간</span>
                        </span>
                        <span className="color-indicator">
                            <span className="color-box color-low"></span>
                            <span className="color-text">낮음</span>
                        </span>
                        <span className="color-indicator">
                            <span className="color-box color-warning"></span>
                            <span className="color-text">경고</span>
                        </span>
                        <span className="color-indicator">
                            <span className="color-box color-caution"></span>
                            <span className="color-text">주의</span>
                        </span>
                        <span className="color-indicator">
                            <span className="color-box color-danger"></span>
                            <span className="color-text">위험</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="margin-table">
                <div className="table-header-with-note">
                    <h4>기본 정보</h4>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>썸네일</th>
                            <th>상품명</th>
                            <th>원가</th>
                            <th>행사가</th>
                            <th>행사 종료일</th>
                            <th>재고</th>
                            <th>위너가</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculatedPrices.map((calculatedProduct) => {
                            const product = selectedProducts.find(p => p.originGoodsCode === calculatedProduct.originGoodsCode);
                            const smartstoreMargin = calculatedProduct.marginList.smartstore;

                            
                            return (
                                <tr key={calculatedProduct.originGoodsCode}>
                                    <td className="thumbnail-cell">
                                        <img
                                            src={product?.thumbnail || ''}
                                            alt={product?.name || ''}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td className="product-name">{product?.name || '상품명 없음'}</td>
                                    <td className={`inform-cell ${getPriceClass(product?.goods_origin, 'original')}`}>
                                        {product?.goods_origin
                                            ? parseFloat(String(product.goods_origin)).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td className={`inform-cell ${getPriceClass(product?.total_price || product?.goods_origin, 'total')}`}>
                                        {product?.total_price
                                                ? parseFloat(String(product.total_price)).toLocaleString()
                                                : product?.goods_origin
                                                ? parseFloat(String(product.goods_origin)).toLocaleString()
                                                : '-'}
                                    </td>
                                    <td className={`inform-cell ${getDateClass(product?.promotion_period, 'period')}`}>
                                        {product?.promotion_period
                                                ? product.promotion_period
                                                : '-'}
                                    </td>
                                    <td className={`inform-cell ${getSoldOutClass('판매')}`}>
                                        {product?.sold_out
                                                    ? product.sold_out
                                                    : '-'}
                                    </td>
                                    <td className="inform-cell">
                                        {product?.winner_price  
                                                ? parseFloat(String(product.winner_price)).toLocaleString()
                                                : '-'}                                       
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="margin-table">
                <div className="table-header-with-note">
                    <h4>플랫폼 마진 목록</h4>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th rowSpan={2}>플랫폼</th>
                            <th colSpan={5}>원가</th>
                            <th colSpan={5}>행사가</th>
                        </tr>
                        <tr>
                            <th>설정 상품가</th>
                            <th>설정 할인가</th>
                            <th>예상 할인율</th>
                            <th>예상 마진율</th>
                            <th>예상 마진</th>
                            <th>설정 상품가</th>
                            <th>설정 할인가</th>
                            <th>예상 할인율</th>
                            <th>예상 마진율</th>
                            <th>예상 마진</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculatedPrices.map((calculatedProduct) => {
                            const product = selectedProducts.find(p => p.originGoodsCode === calculatedProduct.originGoodsCode);
                            
                            // 모든 플랫폼 정의
                            const platforms = [
                                { key: 'smartstore', name: '스마트스토어' },
                                { key: 'coupang', name: '쿠팡' },
                                { key: 'auction', name: '옥션' },
                                { key: 'gmarket', name: '지마켓' },
                                { key: 'elevenst', name: '11번가' }
                            ];
                            
                            return platforms.map((platform) => {
                                const margin = calculatedProduct.marginList[platform.key as keyof typeof calculatedProduct.marginList];
                                // 10원 단위로 절상하는 함수
                                const roundUpToTen = (value: number): number => {
                                    return Math.ceil(value / 10) * 10;
                                };
                                
                                return (
                                    <tr key={`${calculatedProduct.originGoodsCode}-${platform.key}`}>
                                        <td className="set-price">
                                            {platform.name}
                                        </td>
                                        {/* 원가 기준 컬럼들 */}
                                        <td className={`inform-cell ${margin.originalBasePrice ? getPriceClass(margin.originalBasePrice, 'selling') : ''}`}>
                                            {margin.originalBasePrice ? roundUpToTen(margin.originalBasePrice).toLocaleString() : '-'}
                                        </td>
                                        <td className={`inform-cell ${margin.originalBasePriceWithDiscount ? getPriceClass(margin.originalBasePriceWithDiscount, 'selling') : ''}`}>
                                            {margin.originalBasePriceWithDiscount ? roundUpToTen(margin.originalBasePriceWithDiscount).toLocaleString() : '-'}
                                        </td>
                                        <td className={`inform-cell ${margin.originalPriceDiscountRate ? getMarginClass(margin.originalPriceDiscountRate, 'rate') : ''}`}>
                                            {margin.originalPriceDiscountRate ? (margin.originalPriceDiscountRate).toFixed(1) : '-'}%
                                        </td>    
                                        <td className={`inform-cell ${margin.originalPriceMarginRate ? getMarginClass(margin.originalPriceMarginRate, 'rate') : ''}`}>
                                            {margin.originalPriceMarginRate ? (margin.originalPriceMarginRate).toFixed(1) : '-'}%
                                        </td>                                   
                                        <td className={`inform-cell ${margin.originalPriceMargin ? getMarginClass(margin.originalPriceMargin, 'margin') : ''}`}>
                                            {margin.originalPriceMargin ? roundUpToTen(margin.originalPriceMargin).toLocaleString() : '-'}
                                        </td>
                                        {/* 할인가 기준 컬럼들 */}
                                        <td className={`inform-cell ${margin.totalBasePrice ? getPriceClass(margin.totalBasePrice, 'selling') : ''}`}>
                                            {margin.totalBasePrice ? roundUpToTen(margin.totalBasePrice).toLocaleString() : '-'}
                                        </td>
                                        <td className={`inform-cell ${margin.totalBasePriceWithDiscount ? getPriceClass(margin.totalBasePriceWithDiscount, 'selling') : ''}`}>
                                            {margin.totalBasePriceWithDiscount ? roundUpToTen(margin.totalBasePriceWithDiscount).toLocaleString() : '-'}
                                        </td>
                                        <td className={`inform-cell ${margin.totalPriceDiscountRate ? getMarginClass(margin.totalPriceDiscountRate, 'rate') : ''}`}>
                                            {margin.totalPriceDiscountRate ? (margin.totalPriceDiscountRate).toFixed(1) : '-'}%
                                        </td>
                                        <td className={`inform-cell ${margin.totalPriceMarginRate ? getMarginClass(margin.totalPriceMarginRate, 'rate') : ''}`}>
                                            {margin.totalPriceMarginRate ? (margin.totalPriceMarginRate).toFixed(1) : '-'}%
                                        </td>
                                        <td className={`inform-cell ${margin.totalPriceMargin ? getMarginClass(margin.totalPriceMargin, 'margin') : ''}`}>
                                            {margin.totalPriceMargin ? roundUpToTen(margin.totalPriceMargin).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                );
                            });
                        }).flat()}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
