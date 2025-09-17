import React from "react";
import "@/styles/common/textInput.css";

type TooltipType = false | "?" | "*" | "required" | "optional";

type Props = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    showTooltip?: TooltipType;
    className?: string;
    type?: "text" | "password" | "email" | "tel" | "businessNumber";
    disabled?: boolean;
};

export default function TextInput({
  label,
  value,
  onChange,
  showTooltip = "?",
  className,
  type = "text",
  disabled = false,
}: Props) {
  const isFullWidth = className?.includes("full-width");

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

  // 타입별 입력 처리 함수
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
      
      case "businessNumber":
        // 숫자만 허용 (최대 10자리)
        processedValue = processedValue.replace(/[^0-9]/g, '');
        // 10자리 제한
        if (processedValue.length > 10) {
          processedValue = processedValue.substring(0, 10);
        }
        break;
      
      case "password":
        // 비밀번호는 그대로 유지
        break;
      
      case "email":
        // 이메일은 그대로 유지 (브라우저 검증 활용)
        break;
      
      case "text":
      default:
        // 일반 텍스트는 그대로 유지
        break;
    }

    onChange(processedValue);
  };

  // 타입별 placeholder 설정
  const getPlaceholder = () => {
    if (label && !isFullWidth) {
      switch (type) {
        case "tel":
          return "010-1234-5678 (11자리)";
        case "email":
          return "example@email.com";
        case "businessNumber":
          return "숫자 10자리 입력";
        case "password":
          return "8자 이상, 영문과 숫자 포함";
        default:
          return `${label}을 입력해주세요`;
      }
    }
    return "";
  };

  return (
    <div className={`input-box ${isFullWidth ? "inline" : ""}`}>
      <div className={`input-group ${isFullWidth ? "inline" : ""}`}>
        {label && !isFullWidth && (
          <label className="input-label">
            {label}
            {renderTooltip()}
          </label>
        )}
        <input
          type={type}
          className={`input-field ${className || ""}`}
          placeholder={getPlaceholder()}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
