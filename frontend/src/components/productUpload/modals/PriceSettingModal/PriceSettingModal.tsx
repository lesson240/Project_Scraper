// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModal.tsx
import React, { useState, useEffect } from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateSection from './sections/ExchangeRateSection';
import FormulaSection from './sections/FormulaSection';
import MarginListSection from './sections/MarginListSection';
import { useExchangeRate } from './hooks/useExchangeRate';
import { usePriceCalculation } from './hooks/usePriceCalculation';
import type { PriceSettingModalProps } from './types/priceSetting.types';
import '@/styles/productUpload/modals/PriceSettingModal.css';

export default function PriceSettingModal({
    isOpen,
    onClose,
    selectedProducts,
    onSave
}: PriceSettingModalProps) {
    const [formulaSettings, setFormulaSettings] = useState({
        baseMarginRate: 80,
        additionalMargin: 15000,
        baseShippingFee: 0,
        returnShippingFee: 5000,
        exchangeShippingFee: 10000,
        freeShipping: false,
        optimizeShippingFee: false
    });

    const [platformMargins, setPlatformMargins] = useState({
        coupang: 15,
        auction: 15,
        gmarket: 15,
        elevenst: 15
    });

    // 섹션 토글 상태
    const [isExchangeRateExpanded, setIsExchangeRateExpanded] = useState(false);
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(true);

    const { exchangeRates, isLoading: ratesLoading } = useExchangeRate();
    const { calculatedPrices, calculatePrices } = usePriceCalculation();

    useEffect(() => {
        if (isOpen && selectedProducts.length > 0) {
            calculatePrices(selectedProducts, formulaSettings, exchangeRates);
        }
    }, [isOpen, selectedProducts, formulaSettings, exchangeRates, calculatePrices]);

    const handleFormulaChange = (field: string, value: number | boolean) => {
        setFormulaSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePlatformMarginChange = (platform: string, value: number) => {
        setPlatformMargins(prev => ({
            ...prev,
            [platform]: value
        }));
    };

    const handleSave = () => {
        const settings = {
            formula: formulaSettings,
            platformMargins,
            exchangeRates
        };
        onSave(settings);
        onClose();
    };

    const handleReset = () => {
        setFormulaSettings({
            baseMarginRate: 80,
            additionalMargin: 15000,
            baseShippingFee: 0,
            returnShippingFee: 5000,
            exchangeShippingFee: 10000,
            freeShipping: false,
            optimizeShippingFee: false
        });
        setPlatformMargins({
            coupang: 15,
            auction: 15,
            gmarket: 15,
            elevenst: 15
        });
    };

    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <h2>가격 설정</h2>
                <div className="selected-products-badge">
                    선택상품 {selectedProducts.length}개
                </div>
            </ModalHeader>

            <ModalBody>
                <div className="price-setting-container">
                    {/* 환율 설정 섹션 - 고정 헤더 */}
                    <div className="section-header exchange-rate-header" id="exchange-rate-section">
                        <h3>환율 설정</h3>
                        <button
                            className={`toggle-button ${isExchangeRateExpanded ? 'expanded' : 'collapsed'}`}
                            onClick={() => {
                                setIsExchangeRateExpanded(!isExchangeRateExpanded);
                                // 해당 섹션으로 스크롤 이동
                                const element = document.getElementById('exchange-rate-section');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            title={isExchangeRateExpanded ? '접기' : '펼치기'}
                        >
                            {isExchangeRateExpanded ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m18 15-6-6-6 6" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {isExchangeRateExpanded && (
                        <ExchangeRateSection
                            exchangeRates={exchangeRates}
                            isLoading={ratesLoading}
                        />
                    )}

                    {/* 공식 설정 섹션 - 고정 헤더 */}
                    <div className="section-header formula-header" id="formula-section">
                        <h3>공식 설정</h3>
                        <button
                            className={`toggle-button ${isFormulaExpanded ? 'expanded' : 'collapsed'}`}
                            onClick={() => {
                                setIsFormulaExpanded(!isFormulaExpanded);
                                // 해당 섹션으로 스크롤 이동
                                const element = document.getElementById('formula-section');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            title={isFormulaExpanded ? '접기' : '펼치기'}
                        >
                            {isFormulaExpanded ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m18 15-6-6-6 6" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {isFormulaExpanded && (
                        <FormulaSection
                            formulaSettings={formulaSettings}
                            platformMargins={platformMargins}
                            onFormulaChange={handleFormulaChange}
                            onPlatformMarginChange={handlePlatformMarginChange}
                        />
                    )}

                    {/* 마진 목록 섹션 */}
                    <MarginListSection
                        selectedProducts={selectedProducts}
                        calculatedPrices={calculatedPrices}
                        exchangeRates={exchangeRates}
                    />
                </div>
            </ModalBody>

            <ModalFooter>
                <div className="price-setting-footer">
                    <button className="btn-reset" onClick={handleReset}>초기화</button>
                    <button className="btn-margin" onClick={() => {
                        if (selectedProducts.length > 0) {
                            calculatePrices(selectedProducts, formulaSettings, exchangeRates);
                        }
                    }}>예상 마진</button>
                    <button className="btn-save" onClick={handleSave}>저장</button>
                </div>
            </ModalFooter>
        </ModalBase>
    );
}
