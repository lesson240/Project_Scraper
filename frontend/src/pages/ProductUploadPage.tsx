import React, { useState } from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryContainer from "@/components/productUpload/itemSummaryInformSection/ItemSummaryContainer";
import Toast from "@/components/common/Toast";
import "@/styles/section.css"
import axios from "@/lib/axios";

export default function ProductUploadPage() {
    const [items, setItems] = useState<any[]>([]);
    const [pageSize, setPageSize] = useState("30개");
 
    const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
    const currentItems = items.slice(0, pageSizeNumber);
    const currentCount = currentItems.length;
    const totalCount = items.length;   

    const [toastMessage, setToastMessage] = useState<string>("");


    const handleSearch = async (params: any) => {
        try {
            const res = await axios.post("/product-data", params);
            setItems(res.data); // 백엔드 응답에서 item만 추출
            console.log("📦 백엔드 응답 데이터:", res.data);
        } catch (err) {
            console.error("조회 실패", err);
        }
    };

    const onModifySet = async (
    id: string,
    field: "title" | "memo",
    value: string
    ) => {
    const url = field === "title" ? "/save-goods-name" : "/save-goods-memo";
    const payload =
        field === "title"
        ? [{ origin_goods_code: id, modified_goods_name: value }]
        : [{ origin_goods_code: id, memo: value }];

    try {
        await axios.post(url, payload);
        setToastMessage("저장되었습니다.");
    } catch (error) {
        console.error("저장 실패:", error);
        setToastMessage("저장에 실패했습니다.");
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
                <ItemSummaryContainer
                    items={items}
                    pageSize={pageSize}
                    onAttributeSet={() => { }}
                    onOptionSet={() => { }}
                    onDetailPageSet={() => { }}
                    onUploadSet={() => { }}
                    onModifySet={onModifySet}
                />
            </div>
        </div>
    );
}