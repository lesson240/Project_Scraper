// src/components/productUpload/functionSection/FunctionSection.tsx
import React from "react";
import FunctionButtons from "./FunctionButtons";
import "@/styles/upload/functionSection.css"

type Props = {
    pageSize: string;
    setPageSize: (size: string) => void;
    currentCount: number;
    totalCount: number;
};

export default function FunctionSection({ pageSize, setPageSize, currentCount, totalCount }: Props) {
    const handlePriceSet = () => {
        console.log("가격 설정 API 호출 예정");
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
            />
        </nav>
    );
}
