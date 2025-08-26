// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/FormulaSection.tsx
import React from 'react';
import type { FormulaSectionProps } from '@/types/priceSetting.types';
import NumberInput from '@/components/common/NumberInput';
import '@/styles/productUpload/modals/sections/FormulaSection.css';

export default function FormulaSection({
    formulaSettings,
    platformMargins,
    onFormulaChange,
    onPlatformMarginChange
}: FormulaSectionProps) {

    const handleFormulaChange = (field: string, value: any) => {
        console.log(`공식 설정 변경: ${field} =`, value);
        onFormulaChange(field, value);
    };

    const handlePlatformMarginChange = (platform: string, value: number) => {
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
                        원가×환율×(1+기본 마진율)+s추가마진
                    </div>

                    <div className="formula-inputs">
                        <div className="platform-margins">
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
                        <div className="platform-margins">
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
                        </div>
                    </div>
                </div>

                <div className="additional-formula">
                    <h4>추가 판매가 공식</h4>
                    <div className="formula-display">
                        기본 판매가×(1+추가마진율)
                    </div>

                    <div className="platform-margins">
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
