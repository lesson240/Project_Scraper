// src/components/common/TextInputWithButton.tsx
import React from "react";
import Button from "@/components/common/Button";
import "@/styles/common/textInputWithButton.css";

type Props = {
  label?: string; // 라벨이 필요한 경우
  fieldName?: "title" | "memo";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  buttonLabel: string;
  onButtonClick: (value: string, fieldName?: "title" | "memo") => void;
  disabledButton?: boolean;
  className?: string;
  showTooltip?: boolean; // 기존 TextInput 호환성을 위해 추가
};

export default function TextInputWithButton({
  label,
  fieldName,
  value,
  placeholder = "텍스트를 입력해주세요",
  onChange,
  buttonLabel,
  onButtonClick,
  disabledButton = false,
  className,
  showTooltip = false,
}: Props) {
  return (
    <div className={`input-with-button ${className || ""}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          variant={disabledButton ? "fourth" : "seventh"}
          onClick={() => onButtonClick(value, fieldName)}
          type="button"
          customType="set"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
