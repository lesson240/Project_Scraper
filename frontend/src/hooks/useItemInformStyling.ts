import { useMemo } from 'react';

interface ItemInformStylingConfig {
    dateThresholds: {
        critical: number; // 과거 날짜 기준 (일)
        warning: number; // 경고 수준 (일)
    };
    priceThresholds: {
        critical: number; // 위험 수준 가격
        warning: number; // 경고 수준 가격
        caution: number; // 주의 수준 가격
        low: number; // 낮은 가격
        medium: number; // 중간 가격
        high: number; // 높은 가격
    };
}

const DEFAULT_CONFIG: ItemInformStylingConfig = {
    dateThresholds: {
        critical: 0, // 오늘 이전, 위험수준
        warning: 1 // 1일 이내, 경고수준
    },
    priceThresholds: {
        critical: 5000,
        warning: 10000,
        caution: 20000,
        low: 30000,
        medium: 50000,
        high: 100000,
    }
};

export const useItemInformStyling = (config: Partial<ItemInformStylingConfig> = {}) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // 1. 날짜 관련 스타일링
    const getDateClass = useMemo(() => {
        return (dateString: string | null | undefined, type: 'period' | 'sale' = 'period') => {
            if (!dateString || dateString === '-' || dateString === 'null') return '';
            
            try {
                const targetDate = new Date(dateString);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                targetDate.setHours(0, 0, 0, 0);
                
                const diffTime = targetDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= finalConfig.dateThresholds.critical) return 'date-critical';
                if (diffDays === finalConfig.dateThresholds.warning) return 'date-warning';
                if (diffDays <= 3) return 'date-caution';
                return 'date-future';
            } catch {
                return '';
            }
        };
    }, [finalConfig]);
    
    // 2. 품절 상태 스타일링
    const getSoldOutClass = useMemo(() => {
        return (status: string | null | undefined) => {
            if (!status) return '';
            
            const normalizedStatus = status.toLowerCase().trim();
            
            if (normalizedStatus.includes('품절') || normalizedStatus === 'sold out') {
                return 'sold-out';
            }
            if (normalizedStatus.includes('부족') || normalizedStatus.includes('low stock')) {
                return 'low-stock';
            }
            if (normalizedStatus.includes('판매') || normalizedStatus.includes('available')) {
                return 'available';
            }
            
            return '';
        };
    }, []);
    
    // 3. 마진/마진율 스타일링
    const getMarginClass = useMemo(() => {
        return (value: number | string, type: 'margin' | 'rate' = 'margin') => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numValue)) return '';
            
            if (type === 'rate') {
                // 마진율: 음수면 위험, 낮으면 주의
                if (numValue < 0) return 'margin-rate-critical';
                if (numValue < 10) return 'margin-rate-warning';
                if (numValue < 20) return 'margin-rate-caution';
                if (numValue < 30) return 'margin-rate-low';
                if (numValue < 50) return 'margin-rate-medium';
                return 'margin-rate-high';
            } else if (type === 'margin') {
                // 마진: 음수면 위험, 낮으면 주의
                if (numValue < 0) return 'margin-critical';
                if (numValue < 3000) return 'margin-warning';
                if (numValue < 10000) return 'margin-caution';
                if (numValue < 30000) return 'margin-low';
                if (numValue < 100000) return 'margin-medium';
                return 'margin-high';
            }
            return '';
        };
    }, []);
    
    // 4. 가격 스타일링
    const getPriceClass = useMemo(() => {
        return (price: number | string, type: 'total' | 'original' | 'selling' = 'original') => {
            const numPrice = typeof price === 'string' ? parseFloat(price) : price;
            if (isNaN(numPrice)) return '';
            
            if (type === 'total' || type === 'original') {
                if (numPrice < finalConfig.priceThresholds.critical) return 'price-critical';
                if (numPrice < finalConfig.priceThresholds.warning) return 'price-warning';
                if (numPrice < finalConfig.priceThresholds.caution) return 'price-caution';
                if (numPrice < finalConfig.priceThresholds.low) return 'price-low';
                if (numPrice < finalConfig.priceThresholds.medium) return 'price-medium';
                return 'price-high';
            } else if (type === 'selling') {
                if (numPrice < finalConfig.priceThresholds.critical) return 'price-selling-critical';
                if (numPrice < finalConfig.priceThresholds.warning) return 'price-selling-warning';
                if (numPrice < finalConfig.priceThresholds.caution) return 'price-selling-caution';
                if (numPrice < finalConfig.priceThresholds.low) return 'price-selling-low';
                if (numPrice < finalConfig.priceThresholds.medium) return 'price-selling-medium';
                return 'price-selling-high';
            }
            return ''; // ✅ 기본값 추가
        };
    }, [finalConfig]);
    
    // 5. 통합 스타일 클래스 생성
    const getCombinedClass = useMemo(() => {
        return (classes: string[]) => {
            return classes.filter(Boolean).join(' ');
        };
    }, []);
    
    return {
        getDateClass,
        getSoldOutClass,
        getMarginClass,
        getPriceClass,
        getCombinedClass,
        config: finalConfig
    };
};