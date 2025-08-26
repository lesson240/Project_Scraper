// path: frontend/src/tests/components/PriceSettingModal.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceSettingModal from '@/components/productUpload/modals/PriceSettingModal/PriceSettingModal';

// Mock 컴포넌트들
jest.mock('@/components/common/Modal', () => ({
    ModalBase: ({ children, isOpen }: any) => isOpen ? <div data-testid="modal-base">{children}</div> : null,
    ModalHeader: ({ children }: any) => <div data-testid="modal-header">{children}</div>,
    ModalBody: ({ children }: any) => <div data-testid="modal-body">{children}</div>,
    ModalFooter: ({ children }: any) => <div data-testid="modal-footer">{children}</div>,
}));

jest.mock('./sections/ExchangeRateSection', () => {
    return function MockExchangeRateSection() {
        return <div data-testid="exchange-rate-section">ExchangeRateSection</div>;
    };
});

jest.mock('./sections/FormulaSection', () => {
    return function MockFormulaSection() {
        return <div data-testid="formula-section">FormulaSection</div>;
    };
});

jest.mock('./sections/MarginListSection', () => {
    return function MockMarginListSection() {
        return <div data-testid="margin-list-section">MarginListSection</div>;
    };
});

jest.mock('./sections/PriceSettingModalFooter', () => {
    return function MockPriceSettingModalFooter({ onSave, isCalculated }: any) {
        return (
            <div data-testid="price-setting-modal-footer">
                <button 
                    data-testid="save-button"
                    onClick={() => onSave({
                        exchangeRates: [{ currency: 'USD', value: 1350 }],
                        formulaSettings: { baseMarginRate: 15 },
                        platformMargins: { coupang: 10 },
                        calculatedProducts: [{ productId: '1', basePrice: 50000 }],
                        originGoodsCode: 'PROD001'
                    })}
                    disabled={!isCalculated}
                >
                    저장
                </button>
            </div>
        );
    };
});

describe('PriceSettingModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        selectedProducts: [
            {
                id: '1',
                name: '테스트 상품',
                originGoodsCode: 'PROD001',
                thumbnail: 'test.jpg',
                originalPrice: 10000,
                currency: 'USD'
            }
        ],
        exchangeRates: [
            { currencyCode: 'USD', appliedRate: 1350, koreaeximRate: 1340, customsRate: 1350 }
        ],
        calculatedPrices: [
            {
                productId: '1',
                basePrice: 50000,
                platformPrices: { coupang: 55000, auction: 54000, gmarket: 54500, elevenst: 54800 },
                expectedMargin: 5000,
                expectedMarginRate: 10
            }
        ],
        isCalculated: true,
        tariffPeriod: '2024-01-01',
        isLoading: false,
        error: null,
        formulaSettings: {
            baseMarginRate: 15,
            additionalMargin: 5000,
            baseShippingFee: 3000,
            returnShippingFee: 5000,
            exchangeShippingFee: 5000,
            freeShipping: false,
            optimizeShippingFee: false
        },
        platformMargins: {
            coupang: 10,
            auction: 8,
            gmarket: 9,
            elevenst: 12
        },
        isExchangeRateExpanded: true,
        isFormulaExpanded: true,
        onFormulaChange: jest.fn(),
        onPlatformMarginChange: jest.fn(),
        onCalculateMargin: jest.fn(),
        onSave: jest.fn(),
        onReset: jest.fn(),
        onExchangeRateToggle: jest.fn(),
        onFormulaToggle: jest.fn(),
        onAppliedRateChange: jest.fn(),
        onSyncRates: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('모달이 열려있을 때 모든 섹션이 렌더링되어야 한다', () => {
        render(<PriceSettingModal {...defaultProps} />);
        
        expect(screen.getByTestId('modal-base')).toBeInTheDocument();
        expect(screen.getByTestId('modal-header')).toBeInTheDocument();
        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
        expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
        expect(screen.getByTestId('exchange-rate-section')).toBeInTheDocument();
        expect(screen.getByTestId('formula-section')).toBeInTheDocument();
        expect(screen.getByTestId('margin-list-section')).toBeInTheDocument();
    });

    test('모달이 닫혀있을 때 렌더링되지 않아야 한다', () => {
        render(<PriceSettingModal {...defaultProps} isOpen={false} />);
        
        expect(screen.queryByTestId('modal-base')).not.toBeInTheDocument();
    });

    test('저장 버튼이 예상 마진 계산 완료 시 활성화되어야 한다', () => {
        render(<PriceSettingModal {...defaultProps} isCalculated={true} />);
        
        const saveButton = screen.getByTestId('save-button');
        expect(saveButton).not.toBeDisabled();
    });

    test('저장 버튼이 예상 마진 계산 미완료 시 비활성화되어야 한다', () => {
        render(<PriceSettingModal {...defaultProps} isCalculated={false} />);
        
        const saveButton = screen.getByTestId('save-button');
        expect(saveButton).toBeDisabled();
    });

    test('저장 버튼 클릭 시 onSave가 호출되어야 한다', () => {
        const mockOnSave = jest.fn();
        render(<PriceSettingModal {...defaultProps} onSave={mockOnSave} />);
        
        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);
        
        expect(mockOnSave).toHaveBeenCalledWith({
            exchangeRates: [{ currency: 'USD', value: 1350 }],
            formulaSettings: { baseMarginRate: 15 },
            platformMargins: { coupang: 10 },
            calculatedProducts: [{ productId: '1', basePrice: 50000 }],
            originGoodsCode: 'PROD001'
        });
    });

    test('선택된 상품 수가 표시되어야 한다', () => {
        render(<PriceSettingModal {...defaultProps} />);
        
        expect(screen.getByText('선택된 상품: 1개')).toBeInTheDocument();
    });
});
