// src/components/productUpload/itemSummaryInformSection/ItemRow.tsx
import React, { useState } from "react";
import Tooltip from "@/components/common/Tooltip";
import TextInputWithButton from "@/components/common/TextInputWithButton";
import ItemActions from "./ItemActions";
import { Item } from "@/types/product";
import "@/styles/productUpload/itemRow.css";
import defaultThumb from "@/assets/default_image.png";

type Props = {
  item: Item;
  isSelected: boolean;
  onSelect: () => void;
  onModifySet: (id: string, field: "title" | "memo", value: string) => void;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onCopy: (text: string) => void;
  onThumbClick?: (images: string[]) => void;
};

export default function ItemRow({
  item,
  isSelected,
  onSelect,
  onModifySet,
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onCopy,
  onThumbClick,
}: Props) {
  const CopyIcon = () => (
    <svg
      className="copy-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zM19 5H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z" />
    </svg>
  );

  // Row 선택 상태 관리
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const thumbArray = Object.values(item.thumb || {}).filter(Boolean);

  const handleRowClick = (e: React.MouseEvent, itemId: string) => {
      const target = e.target as HTMLElement;
          // 클릭 대상이 특정 요소(className)를 포함하면 handlerowclick 중지
          if (
              target.closest('.button-row') ||
              target.closest('.copy-icon') ||   
              target.closest('.goods-title') ||  
              target.closest('.goods-memo') ||
              target.closest('.thumb')         
          ) {
              return; // row 선택 동작 실행 안 함
          }
        onSelect();
      };

  return (
    <tr 
      className={`table-row ${isSelected ? "selected-row" : ""}`}
      onClick={(e) => handleRowClick(e, item.origin_goods_code || "")}
    >
      <td>
        <div className="table-col-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>
      <td>
        <div className="table-col-center">{item.market}</div>
      </td>
      <td>
        <div className="table-col-left">
          <img
            src={item.thumb?.thumb1 || defaultThumb}
            alt="상품 썸네일"
            className="thumb"
            onClick={() => {
              const thumbs = Object.values(item.thumb || {}).filter(Boolean);
              onThumbClick?.(thumbs.length > 0 ? thumbs : [defaultThumb]); // ✅ 안전 처리
            }}
          />
          <div className="goods-details">
            <div className="goods-title">
              <TextInputWithButton
                fieldName="title"
                value={item.modified_goods_name}
                placeholder="상품명을 입력해주세요"
                buttonLabel="수정"
                autoFocus={true}
                onChange={() =>{}}
                onButtonClick={(value) => {
                  onModifySet(item.origin_goods_code || "", "title", value);
                }}
              />
          </div>
          <div className="goods-memo">
            <TextInputWithButton
              fieldName="memo"
              value={item.memo}
              placeholder="메모를 입력해주세요"
              buttonLabel="수정"
              onChange={() =>{}}
              onButtonClick={(value) =>
                onModifySet(item.origin_goods_code || "", "memo", value)
              }
            />
          </div>
          <div className="meta">
            상품 그룹: {item.group_name} / 원본상품코드: {item.origin_goods_code}
            <Tooltip text="코드복사">
              <span
                className="copy-icon"
                onClick={() => onCopy(item.origin_goods_code || "")}
              >
                <CopyIcon />
              </span>
            </Tooltip>
          </div>
          <div className="meta">업로드 마켓: {item.market}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="table-col-left">
          <ItemActions
            onAttributeSet={onAttributeSet}
            onOptionSet={onOptionSet}
            onDetailPageSet={onDetailPageSet}
            onUploadSet={onUploadSet}
          />
        </div>
      </td>
      <td>
        <div className="table-col-left">
          <div className="goods-details">
            <div className="basic-info">상품 수집일: {item.collection_time}</div>
            <div className="basic-info">원본 할인가 (¥): {item.goods_origin}</div>
            <div className="basic-info">설정 상품가 (￦): {item.priceRange}</div>
            {item.priceRequired && (
              <div className="alert">가격 설정해 주세요</div>
            )}
            {item.tagRequired && (
              <div className="alert">태그 설정해 주세요</div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
