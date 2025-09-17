// src/components/common/TextInputWithButton.tsx
import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import { formatCountdown } from "@/utils/timeUtils";
import "@/styles/common/textInputWithButton.css";

type TooltipType = false | "?" | "*" | "required" | "optional";

type Props = {
  label?: string; // 라벨이 필요한 경우
  fieldName?: "title" | "memo";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  buttonLabel: string;
  onButtonClick: (value: string, fieldName?: "title" | "memo") => void;
  disabledButton?: boolean;
  disabled?: boolean; // 입력 필드 비활성화
  className?: string;
  autoFocus?: boolean;
  showTooltip?: TooltipType; // TextInput과 동일한 타입 사용
  countdown?: number; // 카운트다운 표시 (초 단위)
  type?: "text" | "email" | "tel"; // TextInput과 동일한 타입 사용
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
  disabled = false,
  className,
  autoFocus=false,
  showTooltip = "?",
  countdown,
  type = "text",
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

  // 툴팁 렌더링 함수 (TextInput과 동일)
  const renderTooltip = () => {
    if (!showTooltip) return null;
    
    switch (showTooltip) {
      case "?":
        return <span className="tooltip-icon">?</span>;
      case "*":
        return <span className="required-icon">*</span>;
      case "required":
        return <span className="required-text">(필수)</span>;
      case "optional":
        return <span className="optional-text">(선택)</span>;
      default:
        return null;
    }
  };

  // 타입별 입력 처리 함수 (TextInput과 동일)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let processedValue = e.target.value;

    switch (type) {
      case "tel":
        // 전화번호: 숫자만 허용하고 자동으로 하이픈 삽입 (최대 11자리)
        processedValue = processedValue.replace(/[^0-9]/g, '');
        // 11자리 제한
        if (processedValue.length > 11) {
          processedValue = processedValue.substring(0, 11);
        }
        // 하이픈 자동 삽입
        if (processedValue.length >= 7) {
          processedValue = processedValue.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (processedValue.length >= 3) {
          processedValue = processedValue.replace(/(\d{3})(\d{0,4})/, '$1-$2');
        }
        break;
      
      case "email":
        // 이메일은 그대로 유지 (브라우저 검증 활용)
        break;
      
      case "text":
      default:
        // 일반 텍스트는 그대로 유지
        break;
    }

    setInputValue(processedValue);
    onChange(processedValue);
  };


  return (
    <div className={`input-with-button ${className || ""}`}>
      {label && (
        <label className="input-label">
          {label}
          {renderTooltip()}
        </label>
      )}
      <div className="input-container">
        <div className="input-field-wrapper">
          <input
            ref={inputRef}
            type={type}
            className="input-field"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
          />
          {countdown !== undefined && countdown > 0 && (
            <div className="countdown-display">
              {formatCountdown(countdown)}
            </div>
          )}
        </div>
        <Button
          variant="seventh"
          onClick={() => onButtonClick(inputValue, fieldName)}
          type="button"
          customType="set"
          disabled={disabledButton}
          className={disabled ? "is-verified" : ""}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
