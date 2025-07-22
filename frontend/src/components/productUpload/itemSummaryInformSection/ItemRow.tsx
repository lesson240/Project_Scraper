// src/components/productUpload/itemSummaryInformSection/ItemRow.tsx
import React from "react";
import Tooltip from "@/components/common/Tooltip";
import TextInputWithButton from "@/components/common/TextInputWithButton";
import ItemActions from "./ItemActions";
import "@/styles/upload/itemRow.css";

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
  item: Item;
  isSelected: boolean;
  onSelect: () => void;
  onModifySet: (id: string, field: "title" | "memo", value: string) => void;
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onCopy: (text: string) => void;
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

  return (
    <tr className={`table-row ${isSelected ? "selected-row" : ""}`}>
      <td className="table-col">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="market-label">{item.market}</td>
      <td className="table-col-left">
        <img
          src={item.thumb?.thumb1 || "/images/default-thumb.jpg"}
          alt="상품 썸네일"
          className="thumb"
        />
        <div className="goods-details">
          <div className="goods-title">
            <TextInputWithButton
              fieldName="title"
              value={item.origin_goods_name}
              placeholder="상품명을 입력해주세요"
              buttonLabel="수정"
              onChange={(value) =>
                onModifySet(item.origin_goods_code || "", "title", value)
              }
              onButtonClick={(value) =>
                onModifySet(item.origin_goods_code || "", "title", value)
              }
            />
          </div>
          <div className="goods-memo">
            <TextInputWithButton
              fieldName="memo"
              value={item.memo}
              placeholder="메모를 입력해주세요"
              buttonLabel="수정"
              onChange={(value) =>
                onModifySet(item.origin_goods_code || "", "memo", value)
              }
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
      </td>
      <td>
        <ItemActions
          onAttributeSet={onAttributeSet}
          onOptionSet={onOptionSet}
          onDetailPageSet={onDetailPageSet}
          onUploadSet={onUploadSet}
        />
      </td>
      <td>
        <div className="table-col detail-col">
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
      </td>
    </tr>
  );
}
