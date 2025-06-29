// src/components/common/Button.tsx
import React from "react";
import "@/styles/common/button.css";

type Props = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "third-rate";
  onClick?: () => void;
};

export default function Button({ type = "button", children, variant = "primary", onClick }: Props) {
  return (
    <button type={type} className={`btn ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
