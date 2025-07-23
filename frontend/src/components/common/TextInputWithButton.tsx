// src/components/common/TextInputWithButton.tsx
import React, { useEffect, useRef, useState } from "react";
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
  autoFocus?: boolean;
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
  autoFocus=false,
  showTooltip = false,
}: Props) {

  const [inputValue, setInputValue] = useState(value); // 로컬 상태

  useEffect(() => {
    setInputValue(value); // 외부 value가 변경되면 로컬 값도 업데이트
  }, [value]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className={`input-with-button ${className || ""}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
        />
        <Button
          variant={disabledButton ? "fourth" : "seventh"}
          onClick={() => onButtonClick(inputValue, fieldName)}
          type="button"
          customType="set"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
