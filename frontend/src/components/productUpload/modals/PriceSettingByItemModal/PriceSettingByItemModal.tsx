import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import ExchangeRateByItemSection from './sections/ExchangeRateByItemSection';
import FormulaByItemSection from './sections/FormulaByItemSection';
import MarginListByItemSection from './sections/MarginListByItemSection';
import PriceSettingModalFooter from '../PriceSettingModal/sections/PriceSettingModalFooter';
import type { 
    PriceSettingModalUIProps, 
    SaveData 
} from '@/types/priceSetting.types';
import { ValidationError } from '@/exceptions/PriceSettingExceptions';
import '@/styles/productUpload/modals/PriceSettingModal/PriceSettingModal.css';

export default function PriceSettingByItemModal({
    isOpen, onClose, selectedProducts,
    exchangeRates, calculatedPrices, isCalculated, tariffPeriod, isLoading, error,
    sellingPriceFormulaInfo, platformMargins,
    isExchangeRateExpanded, isFormulaExpanded,
    onFormulaChange, onPlatformMarginChange,
    onCalculateMargin, onSave, onReset,
    onExchangeRateToggle, onFormulaToggle,
    onAppliedRateChange, onSyncRates,

}: PriceSettingModalUIProps) {

    const handleSave = (saveData: SaveData): void => {
        try {
            // 데이터 검증
            if (!saveData.exchangeRates || saveData.exchangeRates.length === 0) {
                throw new ValidationError('환율 정보가 없습니다.', 'exchangeRates', saveData.exchangeRates);
            }

            if (!saveData.marginListByItems || !saveData.marginListByItems.items) {
                throw new ValidationError('계산된 상품 정보가 없습니다.', 'marginListByItems', saveData.marginListByItems);
            }

            if (!saveData.platformMarginRateInfo) {
                throw new ValidationError('플랫폼 마진 정보가 없습니다.', 'platformMarginRateInfo', saveData.platformMarginRateInfo);
            }
            
            onSave(saveData);

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError('저장 데이터 검증 중 오류가 발생했습니다.', 'saveData', saveData);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <div className="modal-header-content">
                    <h2>가격 설정</h2>
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
                        <ExchangeRateByItemSection
                            exchangeRates={exchangeRates}
                            tariffPeriod={tariffPeriod}
                            error={error}
                            onAppliedRateChange={onAppliedRateChange}
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
                        <FormulaByItemSection
                            sellingPriceFormulaInfo={sellingPriceFormulaInfo}
                            platformMargins={platformMargins}
                            onFormulaChange={onFormulaChange}
                            onPlatformMarginChange={onPlatformMarginChange}
                        />
                    )}

                    {/* 마진목록 섹션 */}
                    <div className="section-header margin-list-header">
                        <h3>마진 목록</h3>
                    </div>
                    {/* 마진 목록 섹션 */}
                    <MarginListByItemSection
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
                        internationalShippingFee: sellingPriceFormulaInfo.internationalShippingFee
                    }))}
                />
            </ModalFooter>
        </ModalBase>
    );
}
