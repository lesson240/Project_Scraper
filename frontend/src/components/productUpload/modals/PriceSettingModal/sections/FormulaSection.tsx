// path: frontend/src/components/productUpload/modals/PriceSettingModal/sections/FormulaSection.tsx
import React from 'react';
import type {
    FormulaSectionProps,
    SellingPriceFormulaInfo,
    PlatformMarginRates
} from '@/types/priceSetting.types';
import NumberInput from '@/components/common/NumberInput';
import ComboInput from '@/components/common/ComboInput';
import '@/styles/productUpload/modals/PriceSettingModal/sections/FormulaSection.css';

export default function FormulaSection({
    sellingPriceFormulaInfo,
    platformMargins,
    onFormulaChange,
    onPlatformMarginChange
}: FormulaSectionProps) {

    const handleFormulaChange = (field: keyof SellingPriceFormulaInfo, value: any) => {
        // console.log(`공식 설정 변경: ${String(field)} =`, value);
        onFormulaChange(field, value);
    };

    const handlePlatformMarginChange = (platform: keyof PlatformMarginRates, value: number) => {
        // console.log(`플랫폼 마진 변경: ${platform} =`, value);
        onPlatformMarginChange(platform, value);
    };

    const handleBaseMarginRateChange = (value: number) => {
        // 기본 마진율 변경
        onFormulaChange('baseMarginRate', value);

        // smartstore ExpectedMarginRate를 동일한 값으로 동기화
        onPlatformMarginChange('smartstore', value);
    };

    return (
        <div className="formula-section">
            <div className="formula-options">
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={sellingPriceFormulaInfo.freeShipping}
                        onChange={(e) => handleFormulaChange('freeShipping', e.target.checked)}
                    />
                    무료배송
                </label>
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={sellingPriceFormulaInfo.optimizeShippingFee}
                        onChange={(e) => handleFormulaChange('optimizeShippingFee', e.target.checked)}
                    />
                    오기입 배송비 최적화
                </label>
                <label className="checkbox-option">
                    <input
                        type="checkbox"
                        checked={sellingPriceFormulaInfo.optimizeShippingFee}
                        onChange={(e) => handleFormulaChange('optimizeShippingFee', e.target.checked)}
                    />
                    900원 단위 절상
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
                                value={sellingPriceFormulaInfo.baseMarginRate}
                                onChange={handleBaseMarginRateChange}
                                min={0}
                                max={100}
                                className="formula-input"
                            />

                            <NumberInput
                                label="추가 마진 (￦)"
                                value={sellingPriceFormulaInfo.additionalMargin}
                                onChange={(value) => handleFormulaChange('additionalMargin', value)}
                                min={0}
                                className="formula-input"
                            />
                        </div>
                        <div className="formula-inputs-container">
                            <NumberInput
                                label="기본배송비"
                                value={sellingPriceFormulaInfo.baseShippingFee}
                                onChange={(value) => handleFormulaChange('baseShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />

                            <NumberInput
                                label="반품배송비"
                                value={sellingPriceFormulaInfo.returnShippingFee}
                                onChange={(value) => handleFormulaChange('returnShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />

                            <NumberInput
                                label="교환배송비"
                                value={sellingPriceFormulaInfo.exchangeShippingFee}
                                onChange={(value) => handleFormulaChange('exchangeShippingFee', value)}
                                min={0}
                                className="formula-input"

                            />
                            <NumberInput
                                label="국제운송료"
                                value={sellingPriceFormulaInfo.internationalShippingFee}
                                onChange={(value) => handleFormulaChange('internationalShippingFee', value)}
                                min={0}
                                className="formula-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="base-discount-formula">
                    <h4>기본 판매가 공식 (스마트스토어)</h4>
                    <div className="formula-display">
                        원가×환율×(1+기본 마진율)+추가마진+국제운송료-할인가
                    </div>

                    <div className="formula-inputs">
                        <div className="formula-inputs-container">
                            <NumberInput
                                label="할인가 or 할인율(%)"
                                value={sellingPriceFormulaInfo.baseDiscount}
                                onChange={(value) => handleFormulaChange('baseDiscount', value)}
                                className="formula-input"
                            />
                            <ComboInput
                                label="단위"
                                options={['원', '%']}
                                value={String(sellingPriceFormulaInfo.baseDiscountUnit)}
                                onChange={(value) => handleFormulaChange('baseDiscountUnit', value)}
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
                            value={platformMargins.smartstore.ExpectedMarginRate}
                            onChange={() => { }}
                            min={0}
                            max={100}
                            className="formula-input readonly"
                            disabled={true}
                        />

                        <NumberInput
                            label="쿠팡"
                            value={platformMargins.coupang.ExpectedMarginRate}
                            onChange={(value) => handlePlatformMarginChange('coupang', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="옥션"
                            value={platformMargins.auction.ExpectedMarginRate}
                            onChange={(value) => handlePlatformMarginChange('auction', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="지마켓"
                            value={platformMargins.gmarket.ExpectedMarginRate}
                            onChange={(value) => handlePlatformMarginChange('gmarket', value)}
                            min={0}
                            max={100}
                            className="formula-input"
                        />

                        <NumberInput
                            label="11번가 글로벌"
                            value={platformMargins.elevenst.ExpectedMarginRate}
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
