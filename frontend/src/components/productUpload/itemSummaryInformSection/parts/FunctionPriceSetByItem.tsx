// src/components/productUpload/itemSummaryInformSection/parts/FunctionPriceSetByItem.tsx
import React from "react";
import { PriceSettingByItemModalContainer } from "@/components/productUpload/modals/PriceSettingByItemModal";
import type { Product } from "@/types/priceSetting.types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: string[];
    items?: any[]; // 상품 데이터 배열
};

export default function FunctionPriceSetByItem({ isOpen, onClose, selectedItems, items = [] }: Props) {

    const selectedProducts: Product[] = selectedItems.map(id => {
        const item = items.find(item => item.origin_goods_code === id);

        // 개발 환경에서만 상세 로그 출력
        // if (import.meta.env.DEV) {
        //     console.log(`🔍 상품 ${id} 처리 중...`);
        // }

        // 가격 정보 우선순위: goods_origin > cost > total_price > selling_price
        let originalPrice = 0;

        if (item?.goods_origin && parseFloat(item.goods_origin) > 0) {
            originalPrice = parseFloat(item.goods_origin);
        // } else if (item?.cost && parseFloat(item.cost) > 0) {
        //     originalPrice = parseFloat(item.cost);
        } else if (item?.total_price && parseFloat(item.total_price) > 0) {
            originalPrice = parseFloat(item.total_price);
        } else if (item?.selling_price && parseFloat(item.selling_price) > 0) {
            originalPrice = parseFloat(item.selling_price);
        }

        return {
            id: id,
            name: item?.modified_goods_name || item?.origin_goods_name || '상품명 없음',
            thumbnail: item?.thumb?.thumb1 || '',
            originalPrice: originalPrice,
            total_price: item?.total_price,
            currency: 'KRW',
            originGoodsCode: item?.origin_goods_code || id,
            promotion_period: item?.promotion_period,
            selling_price: item?.selling_price,
            goods_origin: item?.goods_origin,
            sold_out: item?.sold_out,
            winner_price: item?.winner_price,
        };
    });

    const handleSave = (settings: any) => {};

    return (
        <PriceSettingByItemModalContainer
            isOpen={isOpen}
            onClose={onClose}
            selectedProducts={selectedProducts}
            onSave={handleSave}
        />
    );
}
