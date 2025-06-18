import React from "react";
import FilterSection from "../components/productManage/filterSection/FilterSection";
import FunctionSection from "../components/productManage/functionSection/FunctionSection";
import ItemSummaryInformSection from "../components/productManage/itemSummaryInformSection/ItemSummaryInformSection";

import "../styles/productManage.css"; // 전역 스타일 예시

export default function ProductManagePage() {
    return (
        <div className="product-manage-page">
            <h2 className="page-title">상품등록</h2>
            <div className="section-wrap">
                <FilterSection />
            </div>
            <div className="section-wrap">
                <FunctionSection />
            </div>
            <div className="section-wrap">
                <ItemSummaryInformSection />
            </div>
        </div>
    );
}
