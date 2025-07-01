// src/components/common/Button.tsx
import React from "react";
import "@/styles/common/button.css";

type ButtonType = "button" | "submit" | "reset"; //표준 타입
type CustomType = "special-submit" | "set" | "delete"; // 필요 시 사용

type Props = {
  type?: ButtonType | CustomType;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "third-rate" | "fourth" | "fifth";
  onClick?: () => void;
};

export default function Button({
  type = "button",
  children,
  variant = "primary",
  onClick,
}: Props) {
  return (
    <button type={type} className={`btn ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
