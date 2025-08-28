// src/components/productUpload/functionSection/FunctionPriceSet.tsx
import React from "react";
import PriceSettingModalContainer from "../modals/PriceSettingModal/PriceSettingModalContainer";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: string[];
    items?: any[]; // 상품 데이터 배열
};

export default function FunctionPriceSet({ isOpen, onClose, selectedItems, items = [] }: Props) {
    
    const selectedProducts = selectedItems.map(id => {
        const item = items.find(item => item.origin_goods_code === id);
        
        // 개발 환경에서만 상세 로그 출력
        if (import.meta.env.DEV) {
            console.log(`🔍 상품 ${id} 처리 중...`);
        }
        
        // 가격 정보 우선순위: goods_origin > cost > price > selling_price
        let originalPrice = 0;
        let currency = 'KRW'; // 기본값
        
        if (item?.goods_origin && parseFloat(item.goods_origin) > 0) {
            originalPrice = parseFloat(item.goods_origin);
            // goods_origin이 있으면 원화로 간주 (이미지에서 ¥ 표시는 잘못된 표기)
            currency = 'KRW';
            if (import.meta.env.DEV) {
                console.log(`✅ goods_origin에서 가격 찾음: ${originalPrice} (${currency})`);
            }
        } else if (item?.cost && parseFloat(item.cost) > 0) {
            originalPrice = parseFloat(item.cost);
            currency = 'KRW';
            if (import.meta.env.DEV) {
                console.log(`✅ cost에서 가격 찾음: ${originalPrice} (${currency})`);
            }
        } else if (item?.price && parseFloat(item.price) > 0) {
            originalPrice = parseFloat(item.price);
            currency = 'KRW';
            if (import.meta.env.DEV) {
                console.log(`✅ price에서 가격 찾음: ${originalPrice} (${currency})`);
            }
        } else if (item?.selling_price && parseFloat(item.selling_price) > 0) {
            originalPrice = parseFloat(item.selling_price);
            currency = 'KRW';
            if (import.meta.env.DEV) {
                console.log(`✅ selling_price에서 가격 찾음: ${originalPrice} (${currency})`);
            }
        }
        
        // 가격이 0인 경우 경고 로그 (개발 환경에서만)
        if (originalPrice === 0 && import.meta.env.DEV) {
            console.warn(`⚠️ 상품 ${id}의 가격 정보를 찾을 수 없습니다`);
        }
        
        return {
            id: id,
            name: item?.modified_goods_name || item?.origin_goods_name || '상품명 없음',
            thumbnail: item?.thumb?.thumb1 || '',
            originalPrice: originalPrice,
            cost: originalPrice, // cost도 동일한 값으로 설정
            currency: currency, // 통화 정보 설정
            // 추가 정보들
            originGoodsCode: item?.origin_goods_code || id,
            price: item?.price,
            selling_price: item?.selling_price,
            goods_origin: item?.goods_origin // 원본 데이터 보존
        };
    });

    const handleSave = (settings: any) => {
        if (import.meta.env.DEV) {
            console.log('💾 가격 설정 저장:', settings);
        }
        onClose();
    };

    return (
        <PriceSettingModalContainer
            isOpen={isOpen}
            onClose={onClose}
            selectedProducts={selectedProducts}
            onSave={handleSave}
        />
    );
}
