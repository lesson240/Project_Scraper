// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/FormulaSection.tsx
import React from 'react';
import type { FormulaSectionProps } from '@/types/priceSetting.types';
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
                            <div className="input-group">
                                <label>기본 마진율 (%)</label>
                                <input
                                    type="number"
                                    value={formulaSettings.baseMarginRate}
                                    onChange={(e) => handleFormulaChange('baseMarginRate', Number(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className="input-group">
                                <label>추가 마진 (￦)</label>
                                <input
                                    type="number"
                                    value={formulaSettings.additionalMargin}
                                    onChange={(e) => handleFormulaChange('additionalMargin', Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="platform-margins">
                            <div className="input-group">
                                <label>기본배송비</label>
                                <input
                                    type="number"
                                    value={formulaSettings.baseShippingFee}
                                    onChange={(e) => handleFormulaChange('baseShippingFee', Number(e.target.value))}
                                    min="0"
                                />
                            </div>

                            <div className="input-group">
                                <label>반품배송비</label>
                                <input
                                    type="number"
                                    value={formulaSettings.returnShippingFee}
                                    onChange={(e) => handleFormulaChange('returnShippingFee', Number(e.target.value))}
                                    min="0"
                                />
                            </div>

                            <div className="input-group">
                                <label>교환배송비</label>
                                <input
                                    type="number"
                                    value={formulaSettings.exchangeShippingFee}
                                    onChange={(e) => handleFormulaChange('exchangeShippingFee', Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="additional-formula">
                    <h4>추가 판매가 공식</h4>
                    <div className="formula-display">
                        기본 판매가×(1+추가마진율)
                    </div>

                    <div className="platform-margins">
                        <div className="input-group">
                            <label>쿠팡</label>
                            <input
                                type="number"
                                value={platformMargins.coupang}
                                onChange={(e) => handlePlatformMarginChange('coupang', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>옥션</label>
                            <input
                                type="number"
                                value={platformMargins.auction}
                                onChange={(e) => handlePlatformMarginChange('auction', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>지마켓</label>
                            <input
                                type="number"
                                value={platformMargins.gmarket}
                                onChange={(e) => handlePlatformMarginChange('gmarket', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>11번가 글로벌</label>
                            <input
                                type="number"
                                value={platformMargins.elevenst}
                                onChange={(e) => handlePlatformMarginChange('elevenst', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
