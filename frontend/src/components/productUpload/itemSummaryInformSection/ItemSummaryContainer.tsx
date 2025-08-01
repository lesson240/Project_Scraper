// src/components/productUpload/itemSummaryInformSection/ItemSummaryContainer.tsx
import React, { useEffect, useState } from "react";
import ItemSummaryInformSection from "./ItemSummaryInformSection";
import Toast from "@/components/common/Toast";
import axios from "@/lib/axios"; // axios 인스턴스 예시


// 아이템 데이터 타입
type Item = {
  origin_goods_name: string;
  goods_origin: number;
  thumb?: { thumb1?: string };
  market: string;
  collection_time?: string;
  priceRange?: string;
  priceRequired?: boolean;
  tagRequired?: boolean;
  origin_goods_code?: string;
  memo: string;
  group_name: string;
};


type Props = {
  items: Item[];
  pageSize: string;
  onThumbClick?: (images: string[]) => void;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onModifySet: (id: string, field: "title" | "memo", value: string) => Promise<void>;
};


export default function ItemSummaryContainer({
  items,
  pageSize,
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onModifySet
}: Props) {
  const [toastMessage, setToastMessage] = useState("");

  /** 상품명/메모 수정 API 호출 */
  const handleModifySet = async (id: string, field: "title" | "memo", value: string) => {
    console.log("handleModifySet 호출됨", id, field, value);
    const targetItem = items.find((item) => item.origin_goods_code === id);
    if (!targetItem) return;

    try {
      const payload = [
        {
          market: targetItem.market,
          origin_goods_code: id,
          origin_goods_name: field === "title" ? value : targetItem.origin_goods_name,
          memo: field === "memo" ? value : targetItem.memo,
        },
      ];

  //     await axios.post("/save-goods-table", payload);
  //     setToastMessage("수정이 완료되었습니다.");
  //   } catch (err) {
  //     console.error("저장 실패:", err);
  //     setToastMessage("수정에 실패했습니다.");
  //   }
  // };


    // 버튼 클릭 시에만 호출되는 래퍼
  // const handleModify = async (
  //   id: string,
  //   field: "title" | "memo",
  //   value: string
  // ) => {
    // try {
      await onModifySet(id, field, value);
      setToastMessage("수정이 완료되었습니다.");
    } catch (e) {
      console.error("수정 실패:", e);
      setToastMessage("수정에 실패했습니다.");
    }
  };

  return (
    <>
      {/* Toast 알림 */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <ItemSummaryInformSection
        items={items}
        pageSize={pageSize}
        onAttributeSet={onAttributeSet}
        onOptionSet={onOptionSet}
        onDetailPageSet={onDetailPageSet}
        onUploadSet={onUploadSet}
        onModifySet={handleModifySet}
      />
    </>
  );
}
