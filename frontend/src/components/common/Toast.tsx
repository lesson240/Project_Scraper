import React, { useEffect } from "react";
import "@/styles/common/toast.css";

type ToastProps = {
  message: string;
  duration?: number; // ms
  onClose: () => void;
};

export default function Toast({ message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container">
      <div className="toast-message">{message}</div>
    </div>
  );
}
