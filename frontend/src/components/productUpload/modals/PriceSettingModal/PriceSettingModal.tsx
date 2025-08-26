// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModal.tsx
import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateSection from './sections/ExchangeRateSection';
import FormulaSection from './sections/FormulaSection';
import MarginListSection from './sections/MarginListSection';
import PriceSettingModalFooter from './sections/PriceSettingModalFooter';
import { calculateAllProductsMargins } from '@/utils/priceCalculation';
import '@/styles/productUpload/modals/PriceSettingModal.css';

import type { PriceSettingModalUIProps, SaveData } from '@/types/priceSetting.types';
import type { CalculatedProduct } from '@/utils/priceCalculation';

export default function PriceSettingModal({
    isOpen, onClose, selectedProducts,
    exchangeRates, calculatedPrices, isCalculated, tariffPeriod, isLoading, error,
    formulaSettings, platformMargins,
    isExchangeRateExpanded, isFormulaExpanded,
    onFormulaChange, onPlatformMarginChange,
    onCalculateMargin, onSave, onReset,
    onExchangeRateToggle, onFormulaToggle,
    onAppliedRateChange, onSyncRates,

}: PriceSettingModalUIProps) {

    // 저장 핸들러 구현
    const handleSave = (saveData: SaveData) => {
        console.log('PriceSettingModal - 저장 요청:', saveData);

        try {
            // 데이터 검증
            if (!saveData.exchangeRates || saveData.exchangeRates.length === 0) {
                throw new Error('환율 정보가 없습니다.');
            }

            if (!saveData.calculatedProducts || saveData.calculatedProducts.length === 0) {
                throw new Error('계산된 상품 정보가 없습니다.');
            }

            if (!saveData.originGoodsCode) {
                throw new Error('상품 코드가 없습니다.');
            }

            // 🆕 calculatedPrices를 새로운 형식으로 변환 (originGoodsCode 포함)
            const transformedCalculatedProducts: CalculatedProduct[] = calculateAllProductsMargins(
                calculatedPrices.map(price => ({
                    originGoodsCode: price.originGoodsCode, // 🆕 originGoodsCode 포함
                    basePrice: price.basePrice,
                    originalPrice: price.originalPrice,
                    exchangeRate: price.exchangeRate || 1 // 🆕 실제 exchangeRate 사용
                })),
                platformMargins,
                formulaSettings.baseShippingFee // 🆕 baseShippingFee 전달
            );

            // 변환된 데이터로 saveData 업데이트
            const updatedSaveData: SaveData = {
                ...saveData,
                calculatedProducts: transformedCalculatedProducts
            };

            console.log('변환된 데이터:', updatedSaveData);

            // 부모 컴포넌트의 onSave 호출
            onSave(updatedSaveData);

        } catch (error) {
            console.error('저장 데이터 검증 실패:', error);
            // TODO: 사용자에게 에러 메시지 표시
            alert(`저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <div className="modal-header-content">
                    <h2>가격 설정</h2>
                    <div className="selected-products-badge">선택된 상품: {selectedProducts.length}개</div>
                </div>
            </ModalHeader>

            <ModalBody>
                <div className="price-setting-container">
                    {/* 환율 설정 섹션 */}
                    <div className="section-header exchange-rate-header" id="exchange-rate-section">
                        <h3>환율 설정</h3>
                        <button
                            className={`toggle-button ${isExchangeRateExpanded ? 'expanded' : 'collapsed'}`}
                            onClick={onExchangeRateToggle}
                            title={isExchangeRateExpanded ? '접기' : '펼치기'}
                        >
                            {isExchangeRateExpanded ? '▲' : '▼'}
                        </button>
                    </div>

                    {isExchangeRateExpanded && (
                        <ExchangeRateSection
                            exchangeRates={exchangeRates}
                            isLoading={isLoading}
                            tariffPeriod={tariffPeriod}
                            error={error}
                            onAppliedRateChange={onAppliedRateChange}
                            onSyncRates={onSyncRates}
                        />
                    )}

                    {/* 공식설정 섹션 */}
                    <div className="section-header formula-header" id="formula-section">
                        <h3>공식 설정</h3>
                        <button
                            className={`toggle-button ${isFormulaExpanded ? 'expanded' : 'collapsed'}`}
                            onClick={onFormulaToggle}
                            title={isFormulaExpanded ? '접기' : '펼치기'}
                        >
                            {isFormulaExpanded ? '▲' : '▼'}
                        </button>
                    </div>

                    {isFormulaExpanded && (
                        <FormulaSection
                            formulaSettings={formulaSettings}
                            platformMargins={platformMargins}
                            onFormulaChange={onFormulaChange}
                            onPlatformMarginChange={onPlatformMarginChange}
                        />
                    )}

                    {/* 마진목록 섹션 */}
                    <div className="section-header margin-list-header">
                        <h3>마진 목록</h3>
                    </div>
                    <MarginListSection
                        selectedProducts={selectedProducts}
                        calculatedPrices={calculatedPrices}
                        exchangeRates={exchangeRates}
                        onMarginReset={() => { }}
                        isCalculated={isCalculated}
                        platformMargins={platformMargins}
                        onMarginChange={() => { }}
                    />
                </div>
            </ModalBody>

            <ModalFooter>
                <PriceSettingModalFooter
                    onReset={onReset}
                    onCalculateMargin={onCalculateMargin}
                    onSave={handleSave}
                    originGoodsCode={selectedProducts[0]?.originGoodsCode || ''}
                    isCalculated={isCalculated}
                    exchangeRates={exchangeRates.map(rate => ({
                        currency: rate.currencyCode,
                        value: rate.appliedRate
                    }))}
                    formulaSettings={formulaSettings}
                    platformMargins={platformMargins}
                    calculatedProducts={calculatedPrices}  // 🆕 기존 calculatedPrices 사용 (이미 새로운 형식)
                />
            </ModalFooter>
        </ModalBase>
    );
}
