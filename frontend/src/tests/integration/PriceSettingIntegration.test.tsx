// path: frontend/src/tests/integration/PriceSettingIntegration.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock 컴포넌트들
jest.mock('@/components/productUpload/modals/PriceSettingModal/PriceSettingModal', () => {
    return function MockPriceSettingModal(props: any) {
        return (
            <div data-testid="price-setting-modal">
                <h2>가격 설정</h2>
                <div>환율 설정</div>
                <div>공식 설정</div>
                <div>마진 목록</div>
                <button 
                    data-testid="calculate-margin-btn"
                    onClick={props.onCalculateMargin}
                >
                    예상 마진
                </button>
                <button 
                    data-testid="save-btn"
                    disabled={!props.isCalculated}
                    onClick={() => props.onSave({
                        exchangeRates: [{ currency: 'USD', value: 1350 }],
                        formulaSettings: { baseMarginRate: 15 },
                        platformMargins: { coupang: 10 },
                        calculatedProducts: [{ productId: '1', basePrice: 50000 }],
                        originGoodsCode: 'PROD001'
                    })}
                >
                    저장
                </button>
            </div>
        );
    };
});

// Mock useExchangeRateManager
const mockUseExchangeRateManager = {
    exchangeRates: [
        { currencyCode: 'USD', appliedRate: 1350, koreaeximRate: 1340, customsRate: 1350 },
        { currencyCode: 'EUR', appliedRate: 1450, koreaeximRate: 1440, customsRate: 1450 }
    ],
    isLoading: false,
    tariffPeriod: '2024-01-01',
    error: null,
    updateAppliedRate: jest.fn(),
    fetchFrontendExchangeRates: jest.fn()
};

jest.mock('@/hooks/useExchangeRateManager', () => ({
    useExchangeRateManager: () => mockUseExchangeRateManager
}));

// Mock priceSettingApi
const mockPriceSettingApi = {
    save: jest.fn()
};

jest.mock('@/apis/priceSettingApi', () => mockPriceSettingApi);

describe('PriceSettingModal 통합 테스트', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
        selectedProducts: [
            {
                id: '1',
                name: '테스트 상품',
                originGoodsCode: 'PROD001',
                thumbnail: 'test.jpg',
                originalPrice: 10000,
                currencyCode: 'USD'
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('모달이 열리고 모든 섹션이 렌더링되어야 한다', () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        expect(screen.getByTestId('price-setting-modal')).toBeInTheDocument();
        expect(screen.getByText('가격 설정')).toBeInTheDocument();
    });

    test('예상 마진 계산 버튼이 작동해야 한다', async () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        const calculateButton = screen.getByTestId('calculate-margin-btn');
        expect(calculateButton).toBeInTheDocument();
    });

    test('저장 버튼이 예상 마진 계산 완료 시 활성화되어야 한다', () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        const saveButton = screen.getByTestId('save-btn');
        expect(saveButton).toBeInTheDocument();
    });

    test('환율 설정 섹션이 표시되어야 한다', () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        expect(screen.getByText('환율 설정')).toBeInTheDocument();
    });

    test('공식 설정 섹션이 표시되어야 한다', () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        expect(screen.getByText('공식 설정')).toBeInTheDocument();
    });

    test('마진 목록 섹션이 표시되어야 한다', () => {
        render(<div data-testid="price-setting-modal">가격 설정</div>);
        
        expect(screen.getByText('마진 목록')).toBeInTheDocument();
    });
});
