// path: frontend/src/hooks/useSettingStatus.ts
import { useState, useEffect, useMemo } from 'react';
import type { ExchangeRateData, SellingPriceFormulaInfo, PlatformMarginRateInfo } from '@/types/priceSetting.types';

export type SettingStatus = '미설정' | '설정 완료';

export interface SettingStatusConfig {
  exchangeRate: {
    fields: string[];
    requiredFields: string[];
  };
  formulaAndMargin: {
    fields: string[];
    requiredFields: string[];
  };
}

export interface SettingStatusResult {
  exchangeRate: SettingStatus;
  formulaAndMargin: SettingStatus;
  marginList: SettingStatus;
  overall: SettingStatus;
}

export function useSettingStatus(
  exchangeRates: ExchangeRateData[],
  formulaSettings: SellingPriceFormulaInfo | null,
  platformMarginRates: PlatformMarginRateInfo | null,
  calculatedProducts?: any[], // 마진 계산된 상품 목록
  config?: Partial<SettingStatusConfig>
): SettingStatusResult {
  
  // 기본 설정
  const defaultConfig: SettingStatusConfig = {
    exchangeRate: {
      fields: ['appliedRate'],
      requiredFields: ['appliedRate']
    },
    formulaAndMargin: {
      fields: ['baseMarginRate', 'additionalMargin', 'baseShippingFee', 'returnShippingFee', 'exchangeShippingFee', 'internationalShippingFee', 'smartstore', 'coupang', 'auction', 'gmarket', 'elevenst', 'openmarket'],
      requiredFields: ['baseMarginRate', 'smartstore', 'coupang', 'auction'] // 0이어도 되는 필드들은 제외
    }
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 환율 설정 상태 확인
  const exchangeRateStatus = useMemo((): SettingStatus => {
    if (!exchangeRates || exchangeRates.length === 0) {
      return '미설정';
    }

    // 모든 환율이 유효해야 '설정 완료' (some이 아닌 every 사용)
    const hasRequiredData = exchangeRates.every(rate => {
      return finalConfig.exchangeRate.requiredFields.every(field => {
        if (field === 'appliedRate') {
          // 0이거나 빈값이면 미설정으로 처리
          return rate.appliedRate !== undefined && rate.appliedRate !== null && rate.appliedRate > 0;
        }
        const value = rate[field as keyof ExchangeRateData];
        return value !== undefined && value !== null && value !== 0;
      });
    });

    return hasRequiredData ? '설정 완료' : '미설정';
  }, [exchangeRates, finalConfig.exchangeRate.requiredFields]);

  // 공식 및 마진 설정 상태 확인 (통합)
  const formulaAndMarginStatus = useMemo((): SettingStatus => {
    if (!formulaSettings || !platformMarginRates) {
      return '미설정';
    }

    // 공식 설정 필드 확인
    // 필수 필드: baseMarginRate (0이면 안됨)
    // 선택 필드: additionalMargin, baseShippingFee, internationalShippingFee, baseDiscount, baseDiscountUnit (0이어도 됨)
    const requiredFormulaFields = ['baseMarginRate', 'returnShippingFee', 'exchangeShippingFee'];
    const optionalFormulaFields = ['additionalMargin', 'baseShippingFee', 'internationalShippingFee', 'baseDiscount', 'baseDiscountUnit'];
    
    // 필수 필드 검증 (0이면 안됨)
    const requiredFormulaValid = requiredFormulaFields.every(field => {
      const value = formulaSettings[field as keyof SellingPriceFormulaInfo];
      return value !== undefined && value !== null && value !== 0;
    });
    
    // 선택 필드 검증 (0이어도 되지만 undefined/null이면 안됨)
    const optionalFormulaValid = optionalFormulaFields.every(field => {
      const value = formulaSettings[field as keyof SellingPriceFormulaInfo];
      return value !== undefined && value !== null;
    });
    
    const formulaValid = requiredFormulaValid && optionalFormulaValid;

    // 플랫폼 마진 필드 확인
    const marginFields = ['smartstore', 'coupang', 'auction', 'gmarket', 'elevenst'];
    const marginValid = marginFields.every(field => {
      const value = platformMarginRates[field as keyof PlatformMarginRateInfo];
      return value !== undefined && value !== null && value !== 0;
    });

    return (formulaValid && marginValid) ? '설정 완료' : '미설정';
  }, [formulaSettings, platformMarginRates]);

  // 마진목록 상태 확인 (마진계산에 따른 테이블 생성 유무)
  const marginListStatus = useMemo((): SettingStatus => {
    if (!calculatedProducts || calculatedProducts.length === 0) {
      return '미설정';
    }
    
    // 모든 상품이 마진 계산되어야 '설정 완료' (some이 아닌 every 사용)
    const hasCalculatedMargins = calculatedProducts.every(product => {
      // 각 상품마다 마진 관련 필드 중 하나라도 유효한 값이 있어야 함
      return (
        (product.mainMarginRate !== undefined && product.mainMarginRate !== null && product.mainMarginRate > 0) ||
        (product.mainMarginAmount !== undefined && product.mainMarginAmount !== null && product.mainMarginAmount > 0) ||
        (product.setPrice !== undefined && product.setPrice !== null && product.setPrice > 0) ||
        (product.smartstorePrice !== undefined && product.smartstorePrice !== null && product.smartstorePrice > 0) ||
        (product.coupangPrice !== undefined && product.coupangPrice !== null && product.coupangPrice > 0) ||
        (product.auctionPrice !== undefined && product.auctionPrice !== null && product.auctionPrice > 0) ||
        (product.gmarketPrice !== undefined && product.gmarketPrice !== null && product.gmarketPrice > 0) ||
        (product.elevenstPrice !== undefined && product.elevenstPrice !== null && product.elevenstPrice > 0)
      );
    });
    
    return hasCalculatedMargins ? '설정 완료' : '미설정';
  }, [calculatedProducts]);

  // 전체 상태 확인
  const overallStatus = useMemo((): SettingStatus => {
    if (exchangeRateStatus === '설정 완료' && 
        formulaAndMarginStatus === '설정 완료' &&
        marginListStatus === '설정 완료') {
      return '설정 완료';
    }
    return '미설정';
  }, [exchangeRateStatus, formulaAndMarginStatus, marginListStatus]);

  return {
    exchangeRate: exchangeRateStatus,
    formulaAndMargin: formulaAndMarginStatus,
    marginList: marginListStatus,
    overall: overallStatus
  };
}
