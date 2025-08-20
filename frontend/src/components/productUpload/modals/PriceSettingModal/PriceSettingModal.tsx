// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModal.tsx
import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateSection from './sections/ExchangeRateSection';
import FormulaSection from './sections/FormulaSection';
import MarginListSection from './sections/MarginListSection';
import type { PriceSettingModalUIProps } from '@/types/priceSetting.types';
import './PriceSettingModal.css';

export default function PriceSettingModal({
    isOpen, onClose, selectedProducts, formulaSettings, platformMargins,
    exchangeRates, calculatedPrices, isCalculated, tariffPeriod, isLoading, error,
    isExchangeRateExpanded, isFormulaExpanded, onFormulaChange, onPlatformMarginChange,
    onCalculateMargin, onSave, onReset, onExchangeRateToggle, onFormulaToggle, onAppliedRateChange, onSyncRates
}: PriceSettingModalUIProps) {
    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <h2>가격 설정</h2>
                <div className="selected-products-badge">선택된 상품: {selectedProducts.length}개</div>
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
                            {isExchangeRateExpanded ? '▼' : '▶'}
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

                    {/* 공식 설정 섹션 */}
                    <div className="section-header formula-header" id="formula-section">
                        <h3>공식 설정</h3>
                        <button 
                            className={`toggle-button ${isFormulaExpanded ? 'expanded' : 'collapsed'}`}
                            onClick={onFormulaToggle}
                            title={isFormulaExpanded ? '접기' : '펼치기'}
                        >
                            {isFormulaExpanded ? '▼' : '▶'}
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

                    {/* 마진 목록 섹션 */}
                    <div className="section-header margin-list-header">
                        <h3>마진 목록</h3>
                    </div>
                    
                    <MarginListSection
                        selectedProducts={selectedProducts}
                        calculatedPrices={calculatedPrices}
                        exchangeRates={exchangeRates}
                        isCalculated={isCalculated}
                    />
                </div>
            </ModalBody>

            <ModalFooter>
                <div className="modal-footer">
                    <button className="btn-reset" onClick={onReset}>초기화</button>
                    <button 
                        className="btn-calculate-margin"
                        onClick={onCalculateMargin}
                    >
                        예상 마진
                    </button>
                    <button className="btn-save" onClick={onSave}>저장</button>
                </div>
            </ModalFooter>
        </ModalBase>
    );
}
