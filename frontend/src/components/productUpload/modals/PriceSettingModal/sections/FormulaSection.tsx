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
    return (
        <div className="formula-section">
            <div className="formula-options">
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={formulaSettings.freeShipping}
                        onChange={(e) => onFormulaChange('freeShipping', e.target.checked)}
                    />
                    무료배송
                </label>
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={formulaSettings.optimizeShippingFee}
                        onChange={(e) => onFormulaChange('optimizeShippingFee', e.target.checked)}
                    />
                    오기입 배송비 최적화
                </label>
            </div>

            <div className="formula-sections-container">
                <div className="base-formula">
                    <h4>기본 판매가 공식</h4>
                    <div className="formula-display">
                        원가 × 환율 × (1 + 기본 마진율) + 추가마진
                    </div>

                    <div className="formula-inputs">
                        <div className="input-group">
                            <label>기본 마진율 (%)</label>
                            <input
                                type="number"
                                value={formulaSettings.baseMarginRate}
                                onChange={(e) => onFormulaChange('baseMarginRate', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>추가 마진</label>
                            <input
                                type="number"
                                value={formulaSettings.additionalMargin}
                                onChange={(e) => onFormulaChange('additionalMargin', Number(e.target.value))}
                                min="0"
                            />
                        </div>

                        <div className="input-group">
                            <label>기본배송비</label>
                            <input
                                type="number"
                                value={formulaSettings.baseShippingFee}
                                onChange={(e) => onFormulaChange('baseShippingFee', Number(e.target.value))}
                                min="0"
                            />
                        </div>

                        <div className="input-group">
                            <label>반품배송비</label>
                            <input
                                type="number"
                                value={formulaSettings.returnShippingFee}
                                onChange={(e) => onFormulaChange('returnShippingFee', Number(e.target.value))}
                                min="0"
                            />
                        </div>

                        <div className="input-group">
                            <label>교환배송비</label>
                            <input
                                type="number"
                                value={formulaSettings.exchangeShippingFee}
                                onChange={(e) => onFormulaChange('exchangeShippingFee', Number(e.target.value))}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="formula-note">※ 스마트스토어 기준</div>
                </div>

                <div className="additional-formula">
                    <h4>추가 판매가 공식</h4>
                    <div className="formula-display">
                        기본 판매가 × (1 + 추가마진율)
                    </div>

                    <div className="platform-margins">
                        <div className="input-group">
                            <label>쿠팡</label>
                            <input
                                type="number"
                                value={platformMargins.coupang}
                                onChange={(e) => onPlatformMarginChange('coupang', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>옥션</label>
                            <input
                                type="number"
                                value={platformMargins.auction}
                                onChange={(e) => onPlatformMarginChange('auction', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>지마켓</label>
                            <input
                                type="number"
                                value={platformMargins.gmarket}
                                onChange={(e) => onPlatformMarginChange('gmarket', Number(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="input-group">
                            <label>11번가 글로벌</label>
                            <input
                                type="number"
                                value={platformMargins.elevenst}
                                onChange={(e) => onPlatformMarginChange('elevenst', Number(e.target.value))}
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
