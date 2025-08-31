// src/components/productUpload/itemSummaryInformSection/ItemActions.tsx
import React from "react";
import Button from "@/components/common/Button";
import "@/styles/productUpload/itemAction.css";

type Props = {
  onAttributeSet: () => void;
  onOptionSet: () => void;
  onDetailPageSet: () => void;
  onUploadSet: () => void;
  onPriceSetting: () => void; // 가격 설정 모달 열기 함수 추가
};

export default function ItemActions({
  onAttributeSet,
  onOptionSet,
  onDetailPageSet,
  onUploadSet,
  onPriceSetting,
}: Props) {
  return (
    <div className="table-col button-group">
      <div className="button-row">
        <Button variant="secondary" onClick={onPriceSetting}>
          가격
        </Button>
        <Button variant="secondary" onClick={onOptionSet}>
          태그
        </Button>
      </div>
      <div className="button-row">
        <Button variant="secondary" onClick={onAttributeSet}>
          속성
        </Button>
        <Button variant="secondary" onClick={onOptionSet}>
          옵션
        </Button>
      </div>
      <div className="button-row">
        <Button variant="secondary" onClick={onDetailPageSet}>
          상세페이지
        </Button>
        <Button variant="secondary" onClick={onUploadSet}>
          업로드 로그
        </Button>
      </div>
    </div>
  );
}
