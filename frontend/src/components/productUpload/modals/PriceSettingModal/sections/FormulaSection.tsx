// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/FormulaSection.tsx
import React from 'react';
import type { FormulaSectionProps, FormulaSettings } from '@/types/priceSetting.types';
import type { PlatformMargins } from '@/utils/priceCalculation';
import NumberInput from '@/components/common/NumberInput';
import '@/styles/productUpload/modals/sections/FormulaSection.css';

export default function FormulaSection({
    formulaSettings,
    platformMargins,
    onFormulaChange,
    onPlatformMarginChange
}: FormulaSectionProps) {

    const handleFormulaChange = (field: keyof FormulaSettings, value: any) => {
        console.log(`공식 설정 변경: ${String(field)} =`, value);
        onFormulaChange(field, value);
    };

    const handlePlatformMarginChange = (platform: keyof PlatformMargins, value: number) => {
        console.log(`플랫폼 마진 변경: ${platform} =`, value);
        onPlatformMarginChange(platform, value);
    };

    return (
        <div className="formula-section">
            <div className="formula-options">
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={formulaSettings.freeShipping}
                        onChange={(e) => handleFormulaChange('freeShipping', e.target.checked)}
                    />
                    무료배송
                </label>
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={formulaSettings.optimizeShippingFee}
                        onChange={(e) => handleFormulaChange('optimizeShippingFee', e.target.checked)}
                    />
                    오기입 배송비 최적화
                </label>
            </div>

            <div className="formula-sections-container">
                <div className="base-formula">
                    <h4>기본 판매가 공식 (스마트스토어)</h4>
                    <div className="formula-display">
                        원가×환율×(1+기본 마진율)+추가마진+국제운송료
                    </div>

                    <div className="formula-inputs">
                        <div className="formula-inputs-container">
                            <NumberInput
                                label="기본 마진율 (%)"
                                value={formulaSettings.baseMarginRate}
                                onChange={(value) => handleFormulaChange('baseMarginRate', value)}
                                min={0}
                                max={100}
                                className="formula-input"
                            />
                            
                            <NumberInput
                                label="추가 마진 (￦)"
                                value={formulaSettings.additionalMargin}
                                onChange={(value) => handleFormulaChange('additionalMargin', value)}
                                min={0}
                                className="formula-input"
                            />
                        </div>
                        <div className="formula-inputs-container">
                            <NumberInput
                                label="기본배송비"
                                value={formulaSettings.baseShippingFee}
                                onChange={(value) => handleFormulaChange('baseShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />

                            <NumberInput
                                label="반품배송비"
                                value={formulaSettings.returnShippingFee}
                                onChange={(value) => handleFormulaChange('returnShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />

                            <NumberInput
                                label="교환배송비"
                                value={formulaSettings.exchangeShippingFee}
                                onChange={(value) => handleFormulaChange('exchangeShippingFee', value)}
                                min={0}
                                className="formula-input"
                                
                            />
                            <NumberInput
                                label="국제운송료"
                                value={formulaSettings.internationalShippingFee}
                                onChange={(value) => handleFormulaChange('internationalShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="platform-formula">
                    <h4>플랫폼 기본 마진율</h4>
                    <div className="formula-display">
                    원가×환율×(1+플랫폼 기본 마진율)+추가마진+국제운송료
                    </div>

                    <div className="formula-inputs-container">
                        <NumberInput
                            label="스마트스토어"
                            value={platformMargins.smartstore}
                            onChange={(value) => handlePlatformMarginChange('smartstore', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="쿠팡"
                            value={platformMargins.coupang}
                            onChange={(value) => handlePlatformMarginChange('coupang', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="옥션"
                            value={platformMargins.auction}
                            onChange={(value) => handlePlatformMarginChange('auction', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="지마켓"
                            value={platformMargins.gmarket}
                            onChange={(value) => handlePlatformMarginChange('gmarket', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="11번가 글로벌"
                            value={platformMargins.elevenst}
                            onChange={(value) => handlePlatformMarginChange('elevenst', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
