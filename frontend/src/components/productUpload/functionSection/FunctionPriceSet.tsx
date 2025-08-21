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
    // 선택된 상품들을 PriceSettingModal에 전달할 형식으로 변환
    const selectedProducts = selectedItems.map(id => {
        const item = items.find(item => item.origin_goods_code === id);
        return {
            id: id,
            name: item?.modified_goods_name || item?.origin_goods_name || '상품명 없음',
            thumbnail: item?.thumb?.thumb1 || '',
            originalPrice: item?.price || '0',
            cost: parseFloat(item?.cost || '0'),
            currency: 'KRW'
        };
    });

    const handleSave = (settings: any) => {
        console.log('가격 설정 저장:', settings);
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
