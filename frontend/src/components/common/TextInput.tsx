import React from "react";
import "@/styles/common/textInput.css";

type Props = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    showTooltip?: boolean;
    className?: string;
};

export default function TextInput({
  label,
  value,
  onChange,
  showTooltip = true,
  className,
}: Props) {
  const isFullWidth = className?.includes("full-width");

  return (
    <div className={`input-box ${isFullWidth ? "inline" : ""}`}>
      <div className={`input-group ${isFullWidth ? "inline" : ""}`}>
        {label && !isFullWidth && (
          <label className="input-label">
            {label}
            {showTooltip && <span className="tooltip-icon">?</span>}
          </label>
        )}
        <input
          type="text"
          className={`input-field ${className || ""}`}
          placeholder={label && !isFullWidth ? `${label}을 입력해주세요` : ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
