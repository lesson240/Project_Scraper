import React, { useState } from "react";
import "@/styles/upload/itemSummaryInformSection.css";
import ItemTable from "./ItemTable";

type Item = {
  origin_goods_name: string;
  goods_origin: number;
  thumb?: {
    thumb1?: string;
  };
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
  items?: Item[];
  pageSize: string;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onModifySet?: (id: string, field: "title" | "memo", value: string) => void;
};

export default function ItemSummaryInformSection({
  items = [],
  pageSize,
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onModifySet,
}: Props) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  if (!items || items.length === 0) {
    return <div style={{ padding: "20px" }}>데이터가 없습니다.</div>;
  }

  const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);

  const handleSelectAll = (isChecked: boolean) => {
    const currentPageIds = items
      .slice((currentPage - 1) * pageSizeNumber, currentPage * pageSizeNumber)
      .map((item) => item.origin_goods_code || "");
    if (isChecked) {
      setSelectedItems((prev) => [
        ...prev,
        ...currentPageIds.filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  
    // 클립보드에 복사하는 기능
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("복사 성공:", text);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  return (
    <ItemTable
      items={items}
      currentPage={currentPage}
      pageSizeNumber={pageSizeNumber}
      selectedItems={selectedItems}
      onSelectAll={handleSelectAll}
      onSelectItem={handleSelectItem}
      onModifySet={onModifySet || (() => {})}
      onCopy={handleCopy}
      onAttributeSet={onAttributeSet}
      onOptionSet={onOptionSet}
      onDetailPageSet={onDetailPageSet}
      onUploadSet={onUploadSet}
      onPageChange={setCurrentPage}
    />
  );
}
