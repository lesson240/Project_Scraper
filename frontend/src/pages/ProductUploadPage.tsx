import React, { useState } from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryInformSection from "@/components/productUpload/itemSummaryInformSection/ItemSummaryInformSection";
import "@/styles/section.css"
import axios from "@/lib/axios";

export default function ProductUploadPage() {
    const [items, setItems] = useState<any[]>([]);
    const [pageSize, setPageSize] = useState("30개");

 
    const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
    const currentItems = items.slice(0, pageSizeNumber);
    const currentCount = currentItems.length;
    const totalCount = items.length;   

    const handleSearch = async (params: any) => {
        try {
            const res = await axios.post("/product-data", params);
            setItems(res.data); // 백엔드 응답에서 item만 추출
            console.log("📦 백엔드 응답 데이터:", res.data);
        } catch (err) {
            console.error("조회 실패", err);
        }
    };

    return (
        <div>
            <div className="columns-auto-fit-large">
                <SearchFilterSection onSearchClick={handleSearch} />
            </div>
            <div>
                <FunctionSection 
                pageSize={pageSize} 
                setPageSize={setPageSize}
                currentCount={currentCount}
                totalCount={totalCount}
                />
            </div>
            <div>
                <ItemSummaryInformSection
                    items={items}
                    pageSize={pageSize}
                    onAttributeSet={() => { }}
                    onOptionSet={() => { }}
                    onDetailPageSet={() => { }}
                    onUploadSet={() => { }}
                />
            </div>
        </div>
    );
}