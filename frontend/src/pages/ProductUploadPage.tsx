import React from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryInformSection from "@/components/productUpload/itemSummaryInformSection/ItemSummaryInformSection";
import "@/styles/section.css"

export default function ProductUploadPage() {
    return (
        <div>
            <div className="columns-auto-fit-large">
                <SearchFilterSection /></div>
            <div>
                <FunctionSection /></div>
            <div>
                <ItemSummaryInformSection /></div>
        </div>
    );
}
