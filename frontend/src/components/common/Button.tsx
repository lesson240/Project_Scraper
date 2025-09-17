// src/components/common/Button.tsx
import React from "react";
import "@/styles/common/button.css";

type ButtonType = "button" | "submit" | "reset"; //표준 타입
type CustomType = "special-submit" | "set" | "delete"; // 필요 시 사용

type ButtonVariant = "primary" | "secondary" | "third-rate" | "fourth" | "fifth" | "sixth" | "seventh" | "eighth" | "ninth";

type Props = {
  type?: ButtonType;
  customType?: CustomType; // 실제 버튼 HTML 속성엔 안 들어가지만 논리적으로 사용 가능
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Button({
  type = "button",
  customType,
  variant = "primary",
  onClick,
  disabled = false,
  title,
  className,
  children,
}: Props) {
  return (
    <button
      type={type}
      data-custom-type={customType}
      className={`btn ${variant}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}