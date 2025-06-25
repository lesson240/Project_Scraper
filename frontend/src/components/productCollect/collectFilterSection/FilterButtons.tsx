// src/components/product/FilterButtons.tsx
import React from "react";
import "@/styles/collect/filterButtons.css";

type Props = {
    onReset: () => void;
    onSearch: () => void;
};

export default function FilterButtons({ onReset, onSearch }: Props) {
    return (
        <div className="filter-buttons">
            <button className="btn-reset" onClick={onReset}>
                초기화
            </button>
            <button className="btn-search" onClick={onSearch}>
                검색
            </button>
        </div>
    );
}
