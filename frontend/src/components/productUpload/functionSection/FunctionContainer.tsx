// src/components/productUpload/functionSection/FunctionContainer.tsx
import React, { useState } from "react";
import FunctionButtons from "./FunctionButtons";
import FunctionPriceSet from "./FunctionPriceSet";
import "@/styles/productUpload/functionSection.css"

type Props = {
    pageSize: string;
    setPageSize: (size: string) => void;
    currentCount: number;
    totalCount: number;
    selectedItems: string[];
    items?: any[]; // 상품 데이터 배열
};

export default function FunctionContainer({ pageSize, setPageSize, currentCount, totalCount, selectedItems, items }: Props) {
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

    const handlePriceSet = () => {
        setIsPriceModalOpen(true);
    };

    const handleTagSet = () => {
        console.log("태그 설정 API 호출 예정");
    };

    const handleDetailPageSet = () => {
        console.log("상세페이지 설정 API 호출 예정");
    };

    const handleGoodsNameSet = () => {
        console.log("상품명 설정 API 호출 예정");
    };

    const handleSalesRegistrationSet = () => {
        console.log("판매 등록 API 호출 예정");
    };

    const handleGoodsDeleteSet = () => {
        console.log("상품 삭제 API 호출 예정");
    };

    return (
        <>
            <nav className="product-upload-tabs">
                <FunctionButtons
                    currentCount={currentCount}
                    totalCount={totalCount}
                    onPriceSet={handlePriceSet}
                    onTagSet={handleTagSet}
                    onDetailPageSet={handleDetailPageSet}
                    onGoodsNameSet={handleGoodsNameSet}
                    onSalesRegistrationSet={handleSalesRegistrationSet}
                    onGoodsDeleteSet={handleGoodsDeleteSet}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    selectedProductsCount={selectedItems.length}
                />
            </nav>

            {/* 가격 설정 모달 */}
            <FunctionPriceSet
                isOpen={isPriceModalOpen}
                onClose={() => setIsPriceModalOpen(false)}
                selectedItems={selectedItems}
                items={items}
            />
        </>
    );
}
