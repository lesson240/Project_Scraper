import React, { useState } from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryContainer from "@/components/productUpload/itemSummaryInformSection/ItemSummaryContainer";
import ThumbnailModalContainer from "@/components/productUpload/modal/ThumbnailModalContainer";
import "@/styles/section.css";
import axios from "@/lib/axios";

export default function ProductUploadPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState("30개");

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [currentThumbs, setCurrentThumbs] = useState<string[]>([]);

  const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
  const currentItems = items.slice(0, pageSizeNumber);
  const currentCount = currentItems.length;
  const totalCount = items.length;

  /** 검색 버튼 클릭 시 */
  const handleSearch = async (payload: Record<string, any>) => {
    try {
      const res = await axios.post("/product-data", payload);
      setItems(res.data);
      console.log("📦 백엔드 응답 데이터:", res.data);
    } catch (err) {
      console.error("조회 실패", err);
    }
  };

    /** 썸네일 클릭 시 모달 열기 */
    const handleThumbClick = (images: string[]) => {
    setCurrentThumbs([...images]);
    setModalOpen(false);          // 모달 닫았다가
    setTimeout(() => {            // 다음 tick에 열어 초기화 강제
        setModalOpen(true);
    }, 0);
    };

  /** 상품명/메모 수정 */
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

    await axios.post(url, payload);
  };

  return (
    <div>
      <div className="columns-auto-fit-large">
        <SearchFilterSection onSearchClick={handleSearch} />
      </div>

      <FunctionSection
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentCount={currentCount}
        totalCount={totalCount}
      />

      <ItemSummaryContainer
        items={items}
        pageSize={pageSize}
        onThumbClick={handleThumbClick} // ✅ 썸네일 클릭 시 모달 열기
        onAttributeSet={() => {}}
        onOptionSet={() => {}}
        onDetailPageSet={() => {}}
        onUploadSet={() => {}}
        onModifySet={onModifySet}
      />

      {/* ✅ 모달은 컨테이너에서 관리 */}
      <ThumbnailModalContainer
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultImages={currentThumbs}
        onSave={(imgs) => setCurrentThumbs(imgs)}
      />
    </div>
  );
}
