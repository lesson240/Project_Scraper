import React, { useState } from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryContainer from "@/components/productUpload/itemSummaryInformSection/ItemSummaryContainer";
import ThumbnailModalContainer from "@/components/productUpload/modal/ThumbnailModalContainer";
import Toast from "@/components/common/Toast";
import "@/styles/section.css"
import axios from "@/lib/axios";

export default function ProductUploadPage() {
    // const [toastMessage, setToastMessage] = useState<string>("");
    const [items, setItems] = useState<any[]>([]);
    const [pageSize, setPageSize] = useState("30개");
    const [modalOpen, setModalOpen] = useState(false);
    const [currentThumbs, setCurrentThumbs] = useState<string[]>([]);
    
    const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
    const currentItems = items.slice(0, pageSizeNumber);
    const currentCount = currentItems.length;
    const totalCount = items.length;   

    const handleSearch = async (payload: Record<string, any>) => {
        try {
            const res = await axios.post("/product-data", payload);
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

    // try {
        await axios.post(url, payload);
    //     setToastMessage("저장되었습니다.");
    // } catch (error) {
    //     console.error("저장 실패:", error);
    //     setToastMessage("저장에 실패했습니다.");
    // }
    };


    /** 썸네일 클릭 시 모달 열기 */
    const handleThumbClick = (images: string[]) => {
        setCurrentThumbs(images);
        setModalOpen(true);
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
                    onThumbClick={handleThumbClick}
                    onAttributeSet={() => { }}
                    onOptionSet={() => { }}
                    onDetailPageSet={() => { }}
                    onUploadSet={() => { }}
                    onModifySet={onModifySet}
                />
            <div>
                {/* 모달은 페이지 하단에만 존재 */}
                {modalOpen && (
                    <ThumbnailModalContainer
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        defaultImages={currentThumbs}
                        onSave={(imgs) => setCurrentThumbs(imgs)}
                    />
                )}
            </div>
            </div>
                {/* <ThumbnailModalContainer /> */}
        </div>
    );
}