// path: frontend/src/utils/priceCalculation.ts

export interface PlatformMargins {
    main: number; // 🆕 main 필드 추가
    coupang: number;
    auction: number;
    gmarket: number;
    elevenst: number;
    openmarket: number;
}

export interface CalculatedProduct {
    originGoodsCode: string; // 🆕 originGoodsCode 필드 추가
    basePrice: number;
    platformPrices: {
        coupang: number;
        auction: number;
        gmarket: number;
        elevenst: number;
        openmarket: number;
    };
    exchangeRate: number;
    originalPrice: number;

    // 🆕 marginList 구조로 변경 (selling_price 추가)
    marginList: {
        main: {
            ExpectedMargin: number;
            ExpectedMarginRate: number;
            selling_price: number;
        };
        coupang: {
            ExpectedMargin: number;
            ExpectedMarginRate: number;
            selling_price: number;
        };
        auction: {
            ExpectedMargin: number;
            ExpectedMarginRate: number;
            selling_price: number;
        };
        gmarket: {
            ExpectedMargin: number;
            ExpectedMarginRate: number;
            selling_price: number;
        };
        elevenst: {
            ExpectedMargin: number;
            ExpectedMarginRate: number;
            selling_price: number;
        };
    };
}

/**
 * 플랫폼별 마진을 계산합니다.
 * @param originGoodsCode 원본 상품 코드
 * @param basePrice 기본 가격
 * @param platformMargins 플랫폼별 마진율
 * @param originalPrice 원본 가격
 * @param exchangeRate 환율
 * @param baseShippingFee 기본 배송비
 * @returns 계산된 상품 데이터
 */
export function calculatePlatformMargins(
    originGoodsCode: string, // 🆕 originGoodsCode 매개변수 추가
    basePrice: number,
    platformMargins: PlatformMargins,
    originalPrice: number,
    exchangeRate: number = 1,
    baseShippingFee: number = 3000 // 🆕 기본 배송비 매개변수 추가
): CalculatedProduct {
    // 🆕 메인 마진 계산: 설정 상품가 - (원가 × 환율) - 배송비
    const mainExpectedMargin = basePrice - (originalPrice * exchangeRate) - baseShippingFee;
    const mainExpectedMarginRate = (mainExpectedMargin / basePrice) * 100;

    // 🆕 플랫폼별 추가 판매가 계산: 기본 판매가 × (1 + 플랫폼 마진율)
    // 쿠팡: 기본 판매가 × (1 + 쿠팡 마진율)
    const coupangPrice = basePrice * (1 + platformMargins.coupang / 100);
    const coupangExpectedMargin = coupangPrice - (originalPrice * exchangeRate) - baseShippingFee;
    const coupangExpectedMarginRate = (coupangExpectedMargin / coupangPrice) * 100;

    // 옥션: 기본 판매가 × (1 + 옥션 마진율)
    const auctionPrice = basePrice * (1 + platformMargins.auction / 100);
    const auctionExpectedMargin = auctionPrice - (originalPrice * exchangeRate) - baseShippingFee;
    const auctionExpectedMarginRate = (auctionExpectedMargin / auctionPrice) * 100;

    // 지마켓: 기본 판매가 × (1 + 지마켓 마진율)
    const gmarketPrice = basePrice * (1 + platformMargins.gmarket / 100);
    const gmarketExpectedMargin = gmarketPrice - (originalPrice * exchangeRate) - baseShippingFee;
    const gmarketExpectedMarginRate = (gmarketExpectedMargin / gmarketPrice) * 100;

    // 11번가: 기본 판매가 × (1 + 11번가 마진율)
    const elevenstPrice = basePrice * (1 + platformMargins.elevenst / 100);
    const elevenstExpectedMargin = elevenstPrice - (originalPrice * exchangeRate) - baseShippingFee;
    const elevenstExpectedMarginRate = (elevenstExpectedMargin / elevenstPrice) * 100;

    // 오픈마켓: 기본 판매가 × (1 + 오픈마켓 마진율)
    const openmarketPrice = basePrice * (1 + platformMargins.openmarket / 100);
    const openmarketExpectedMargin = openmarketPrice - (originalPrice * exchangeRate) - baseShippingFee;
    const openmarketExpectedMarginRate = (openmarketExpectedMargin / openmarketPrice) * 100;

    return {
        originGoodsCode, // 🆕 originGoodsCode 포함
        basePrice,
        platformPrices: {
            coupang: coupangPrice,      // 🆕 플랫폼별 가격 적용
            auction: auctionPrice,      // 🆕 플랫폼별 가격 적용
            gmarket: gmarketPrice,      // 🆕 플랫폼별 가격 적용
            elevenst: elevenstPrice,    // 🆕 플랫폼별 가격 적용
            openmarket: openmarketPrice // 🆕 플랫폼별 가격 적용
        },
        exchangeRate,
        originalPrice,
        marginList: {
            main: {
                ExpectedMargin: Math.round(mainExpectedMargin * 100) / 100,
                ExpectedMarginRate: Math.round(mainExpectedMarginRate * 100) / 100,
                selling_price: basePrice // 🆕 selling_price 추가
            },
            coupang: {
                ExpectedMargin: Math.round(coupangExpectedMargin * 100) / 100,
                ExpectedMarginRate: Math.round(coupangExpectedMarginRate * 100) / 100,
                selling_price: coupangPrice // 🆕 selling_price 추가
            },
            auction: {
                ExpectedMargin: Math.round(auctionExpectedMargin * 100) / 100,
                ExpectedMarginRate: Math.round(auctionExpectedMarginRate * 100) / 100,
                selling_price: auctionPrice // 🆕 selling_price 추가
            },
            gmarket: {
                ExpectedMargin: Math.round(gmarketExpectedMargin * 100) / 100,
                ExpectedMarginRate: Math.round(gmarketExpectedMarginRate * 100) / 100,
                selling_price: gmarketPrice // 🆕 selling_price 추가
            },
            elevenst: {
                ExpectedMargin: Math.round(elevenstExpectedMargin * 100) / 100,
                ExpectedMarginRate: Math.round(elevenstExpectedMarginRate * 100) / 100,
                selling_price: elevenstPrice // 🆕 selling_price 추가
            }
        }
    };
}

/**
 * 여러 상품의 플랫폼별 마진을 일괄 계산합니다.
 */
export function calculateAllProductsMargins(
    products: Array<{
        originGoodsCode: string; // 🆕 originGoodsCode 추가
        basePrice: number;
        originalPrice: number;
        exchangeRate?: number;
    }>,
    platformMargins: PlatformMargins,
    baseShippingFee: number = 3000 // 🆕 기본 배송비 매개변수 추가
): CalculatedProduct[] {
    return products.map(product =>
        calculatePlatformMargins(
            product.originGoodsCode, // 🆕 originGoodsCode 전달
            product.basePrice,
            platformMargins,
            product.originalPrice,
            product.exchangeRate,
            baseShippingFee // 🆕 baseShippingFee 전달
        )
    );
}
