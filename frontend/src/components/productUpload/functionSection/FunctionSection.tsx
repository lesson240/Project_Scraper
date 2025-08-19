// src/components/productUpload/functionSection/FunctionSection.tsx
import React from "react";
import FunctionContainer from "./FunctionContainer";

type Props = {
    pageSize: string;
    setPageSize: (size: string) => void;
    currentCount: number;
    totalCount: number;
    selectedItems: string[];
    items?: any[]; // 상품 데이터 배열
};

export default function FunctionSection({ pageSize, setPageSize, currentCount, totalCount, selectedItems, items }: Props) {
    return (
        <FunctionContainer
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentCount={currentCount}
            totalCount={totalCount}
            selectedItems={selectedItems}
            items={items}
        />
    );
}
