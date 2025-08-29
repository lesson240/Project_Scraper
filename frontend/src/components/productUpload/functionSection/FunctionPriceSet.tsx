// src/components/productUpload/functionSection/FunctionPriceSet.tsx
import React from "react";
import PriceSettingModalContainer from "../modals/PriceSettingModal/PriceSettingModalContainer";
import type { Product } from "@/types/priceSetting.types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: string[];
    items?: any[]; // 상품 데이터 배열
};

export default function FunctionPriceSet({ isOpen, onClose, selectedItems, items = [] }: Props) {

    const selectedProducts: Product[] = selectedItems.map(id => {
        const item = items.find(item => item.origin_goods_code === id);

        // 개발 환경에서만 상세 로그 출력
        // if (import.meta.env.DEV) {
        //     console.log(`🔍 상품 ${id} 처리 중...`);
        // }

        // 가격 정보 우선순위: goods_origin > cost > price > selling_price
        let originalPrice = 0;

        if (item?.goods_origin && parseFloat(item.goods_origin) > 0) {
            originalPrice = parseFloat(item.goods_origin);
        } else if (item?.cost && parseFloat(item.cost) > 0) {
            originalPrice = parseFloat(item.cost);
        } else if (item?.price && parseFloat(item.price) > 0) {
            originalPrice = parseFloat(item.price);
        } else if (item?.selling_price && parseFloat(item.selling_price) > 0) {
            originalPrice = parseFloat(item.selling_price);
        }

        return {
            id: id,
            name: item?.modified_goods_name || item?.origin_goods_name || '상품명 없음',
            thumbnail: item?.thumb?.thumb1 || '',
            originalPrice: originalPrice,
            cost: originalPrice,
            currency: 'KRW',
            originGoodsCode: item?.origin_goods_code || id,
            price: item?.price,
            selling_price: item?.selling_price,
            goods_origin: item?.goods_origin
        };
    });

    const handleSave = (settings: any) => {
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
