// src/components/productUpload/itemSummaryInformSection/ItemTable.tsx
import React from "react";
import Pagination from "@/components/common/Pagination";
import ItemRow from "./ItemRow";
import { Item } from "@/types/product";
import "@/styles/productUpload/itemTable.css";

type Props = {
  items: Item[];
  currentPage: number;
  pageSizeNumber: number;
  selectedItems: string[];
  onThumbClick?: (images: string[]) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string) => void;
  onModifySet: (id: string, field: "title" | "memo", value: string) => void;
  onCopy: (text: string) => void;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onPageChange: (page: number) => void;
};

export default function ItemTable({
  items,
  currentPage,
  pageSizeNumber,
  selectedItems,
  onThumbClick,
  onSelectAll,
  onSelectItem,
  onModifySet,
  onCopy,
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onPageChange,
}: Props) {
  const startIndex = (currentPage - 1) * pageSizeNumber;
  const currentItems = items.slice(startIndex, startIndex + pageSizeNumber);

  return (
    <div className="table-container">
      {/* thead 영역 (고정) */}
      <table className="product-manage-table table-header">
        <thead className="table-head">
          <tr>
            <th>
              <input
                type="checkbox"
                checked={currentItems.every((item) =>
                  selectedItems.includes(item.origin_goods_code || "")
                )}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th>수집 마켓</th>
            <th>상품정보</th>
            <th>기능</th>
            <th>상세정보</th>
          </tr>
        </thead>
      </table>

      {/* tbody 영역 (스크롤) */}
      <div className="table-body-wrapper">
        <table className="product-manage-table">
          <tbody>
            {currentItems.map((item, index) => (
              <ItemRow
                key={item.origin_goods_code || `row-${index}`}
                item={item}
                isSelected={selectedItems.includes(item.origin_goods_code || "")}
                onSelect={() => onSelectItem(item.origin_goods_code || "")}
                onThumbClick={onThumbClick}
                onModifySet={onModifySet}
                onAttributeSet={onAttributeSet}
                onOptionSet={onOptionSet}
                onDetailPageSet={onDetailPageSet}
                onUploadSet={onUploadSet}
                onCopy={onCopy}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination (하단 고정) */}
      <div className="pagination-container">
        <Pagination
          currentPage={currentPage}
          totalItems={items.length}
          itemsPerPage={pageSizeNumber}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
