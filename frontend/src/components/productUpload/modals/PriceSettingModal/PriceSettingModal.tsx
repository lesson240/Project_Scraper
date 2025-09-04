// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModal.tsx
import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateSection from './sections/ExchangeRateSection';
import FormulaSection from './sections/FormulaSection';
import MarginListSection from './sections/MarginListSection';
import PriceSettingModalFooter from './sections/PriceSettingModalFooter';
import { SettingStatusBadge, SaveIcon } from '@/components/common/Setting';
import Tooltip from '@/components/common/Tooltip';
import '@/styles/productUpload/modals/PriceSettingModal/PriceSettingModal.css';

import type {
    PriceSettingModalUIProps,
    SaveData,
    CalculatedProductData,
    PlatformMarginRateInfo
} from '@/types/priceSetting.types';

export default function PriceSettingModal({
    isOpen, onClose, selectedProducts,
    exchangeRates, calculatedPrices, isCalculated, tariffPeriod, isLoading, error,
    sellingPriceFormulaInfo, platformMargins,
    isExchangeRateExpanded, isFormulaExpanded,
    onFormulaChange, onPlatformMarginChange,
    onCalculateMargin, onSave, onReset,
    onExchangeRateToggle, onFormulaToggle,
    onAppliedRateChange, onSyncRates,
    // 새로운 props 추가
    settingStatus,
    onExchangeRateSetting,
    onFormulaAndMarginSetting,

}: PriceSettingModalUIProps) {

    const handleSave = (saveData: SaveData): void => {
        // UI 컴포넌트에서는 단순히 전달만 함 (검증은 Container에서 처리)
        onSave(saveData);
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
                        <div className="section-title-row">
                            <h3>환율 설정</h3>
                        </div>
                        <div className="section-controls">
                        {settingStatus && (
                                <SettingStatusBadge status={settingStatus.exchangeRate} size="md" />
                            )}
                            {onExchangeRateSetting && (
                                <SaveIcon 
                                    settingType="exchangeRate"
                                    onClick={onExchangeRateSetting}
                                    size="md"
                                />
                            )}
                            <Tooltip text={isExchangeRateExpanded ? '접기' : '펼치기'}>
                                <button
                                    className={`toggle-button ${isExchangeRateExpanded ? 'expanded' : 'collapsed'}`}
                                    onClick={onExchangeRateToggle}
                                >
                                    {isExchangeRateExpanded ? '▲' : '▼'}
                                </button>
                            </Tooltip>
                        </div>
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
                        <div className="section-title-row">
                            <h3>공식 설정</h3>
                        </div>
                        <div className="section-controls">
                            {settingStatus && (
                                <SettingStatusBadge status={settingStatus.formulaAndMargin} size="md" />
                            )}
                            {onFormulaAndMarginSetting && (
                                <SaveIcon 
                                    settingType="formulaAndMargin"
                                    onClick={onFormulaAndMarginSetting}
                                    size="md"
                                />
                            )}
                            <Tooltip text={isFormulaExpanded ? '접기' : '펼치기'}>
                                <button
                                    className={`toggle-button ${isFormulaExpanded ? 'expanded' : 'collapsed'}`}
                                    onClick={onFormulaToggle}
                                >
                                    {isFormulaExpanded ? '▲' : '▼'}
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {isFormulaExpanded && (
                        <FormulaSection
                            sellingPriceFormulaInfo={sellingPriceFormulaInfo}
                            platformMargins={platformMargins}
                            onFormulaChange={onFormulaChange}
                            onPlatformMarginChange={onPlatformMarginChange}
                        />
                    )}

                    {/* 마진목록 섹션 */}
                    <div className="section-header margin-list-header">
                        <div className="section-title-row">
                            <h3>마진 목록</h3>
                        </div>
                        <div className="section-controls">
                            {settingStatus && 'marginList' in settingStatus && (
                                <SettingStatusBadge status={settingStatus.marginList} size="md" />
                            )}
                        </div>
                    </div>
                    {/* 마진 목록 섹션 */}
                    <MarginListSection
                        selectedProducts={selectedProducts}
                        calculatedPrices={calculatedPrices}
                        exchangeRates={exchangeRates}
                        platformMargins={platformMargins}
                        onMarginChange={(productId: string, platform: string, value: number) => {
                            // 스마트스토어 마진만 처리
                            if (platform === 'smartstore') {
                                onPlatformMarginChange('smartstore', value);
                            }
                        }}
                        onMarginReset={onReset}
                        isCalculated={isCalculated}
                    />
                </div>
            </ModalBody>

            <ModalFooter>
                <PriceSettingModalFooter
                    onSave={handleSave}
                    onReset={onReset}
                    onCalculateMargin={onCalculateMargin}
                    originGoodsCode={selectedProducts[0]?.originGoodsCode || ''}
                    isCalculated={isCalculated}
                    exchangeRatesInfo={exchangeRates}
                    sellingPriceFormulaInfo={sellingPriceFormulaInfo}
                    platformMarginRateInfo={{
                        smartstore: platformMargins.smartstore.ExpectedMarginRate,
                        coupang: platformMargins.coupang.ExpectedMarginRate,
                        auction: platformMargins.auction.ExpectedMarginRate,
                        gmarket: platformMargins.gmarket.ExpectedMarginRate,
                        elevenst: platformMargins.elevenst.ExpectedMarginRate,
                        openmarket: platformMargins.openmarket.ExpectedMarginRate
                    }}
                    calculatedProductData={calculatedPrices}
                    selectedProducts={selectedProducts.map(product => ({  // ✅ 타입 변환
                        originGoodsCode: product.originGoodsCode,
                        originalPrice: typeof product.originalPrice === 'string'
                            ? parseFloat(product.originalPrice)
                            : product.originalPrice,
                        exchangeRate: 1, // 기본값
                        baseMarginRate: sellingPriceFormulaInfo.baseMarginRate,
                        additionalMargin: sellingPriceFormulaInfo.additionalMargin,
                        internationalShippingFee: sellingPriceFormulaInfo.internationalShippingFee,
                        baseDiscount: sellingPriceFormulaInfo.baseDiscount,
                        baseDiscountUnit: sellingPriceFormulaInfo.baseDiscountUnit
                    }))}
                />
            </ModalFooter>
        </ModalBase>
    );
}
