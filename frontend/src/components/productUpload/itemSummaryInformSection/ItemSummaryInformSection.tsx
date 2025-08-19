import React, { useState } from "react";
import "@/styles/productUpload/itemSummaryInformSection.css";
import ItemTable from "./ItemTable";
import { Item } from "@/types/product";

type Props = {
  items?: Item[];
  pageSize: string;
  onThumbClick?: (images: string[], originGoodsCode: string) => void;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onModifySet?: (id: string, field: "title" | "memo", value: string) => void;
  onSelectedItemsChange?: (selectedItems: string[]) => void; // 선택된 상품 목록 변경 시 호출
};

export default function ItemSummaryInformSection({
  items = [],
  pageSize,
  onThumbClick,
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onModifySet,
  onSelectedItemsChange,
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
      const newSelectedItems = [
        ...selectedItems,
        ...currentPageIds.filter((id) => !selectedItems.includes(id)),
      ];
      setSelectedItems(newSelectedItems);
      onSelectedItemsChange?.(newSelectedItems);
    } else {
      const newSelectedItems = selectedItems.filter((id) => !currentPageIds.includes(id));
      setSelectedItems(newSelectedItems);
      onSelectedItemsChange?.(newSelectedItems);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter((pid) => pid !== id)
      : [...selectedItems, id];
    setSelectedItems(newSelectedItems);
    onSelectedItemsChange?.(newSelectedItems);
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
      onThumbClick={onThumbClick}
      onSelectAll={handleSelectAll}
      onSelectItem={handleSelectItem}
      onModifySet={onModifySet || (() => { })}
      onCopy={handleCopy}
      onAttributeSet={onAttributeSet}
      onOptionSet={onOptionSet}
      onDetailPageSet={onDetailPageSet}
      onUploadSet={onUploadSet}
      onPageChange={setCurrentPage}
    />
  );
}
