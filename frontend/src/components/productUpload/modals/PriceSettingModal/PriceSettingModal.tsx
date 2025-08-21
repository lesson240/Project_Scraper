// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModal.tsx
import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateSection from './sections/ExchangeRateSection';
import FormulaSection from './sections/FormulaSection';
import MarginListSection from './sections/MarginListSection';
import '@/styles/productUpload/modals/PriceSettingModal.css';

// PriceSettingModal의 props 타입 정의
interface PriceSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: any[];
    exchangeRates: any[];
    calculatedPrices: any[];
    isCalculated: boolean;
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    formulaSettings: any;
    platformMargins: any;
    isExchangeRateExpanded: boolean;
    isFormulaExpanded: boolean;
    onFormulaChange: (field: string, value: any) => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
    onCalculateMargin: () => void;
    onSave: () => void;
    onReset: () => void;
    onExchangeRateToggle: () => void;
    onFormulaToggle: () => void;
    onAppliedRateChange: (currency: string, value: number) => void;
    onSyncRates: () => void;
}

export default function PriceSettingModal({
    isOpen, onClose, selectedProducts,
    exchangeRates, calculatedPrices, isCalculated, tariffPeriod, isLoading, error,
    formulaSettings, platformMargins,
    isExchangeRateExpanded, isFormulaExpanded,
    onFormulaChange, onPlatformMarginChange,
    onCalculateMargin, onSave, onReset,
    onExchangeRateToggle, onFormulaToggle,
    onAppliedRateChange, onSyncRates,
}: PriceSettingModalProps) {
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
                        platformMargins={platformMargins}
                        onMarginChange={onPlatformMarginChange}
                        onMarginReset={() => { }}
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
