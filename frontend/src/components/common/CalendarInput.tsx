// path: frontend/src/components/common/CalendarInput.tsx
import React from 'react';
import '@/styles/common/calendarInput.css';

type Props = {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function CalendarInput({
  label,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 직접 입력 허용: 숫자와 하이픈만, YYYY-MM-DD 최대 10자
    const next = e.target.value.replace(/[^0-9-]/g, '').slice(0, 10);
    onChange(next);
  };

  return (
    <div className={`calendar-input ${className || ''}`}>
      {label && (
        <label className="calendar-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        placeholder="YYYY-MM-DD"
        value={value}
        onChange={handleChange}
        className="calendar-text-field"
        disabled={disabled}
      />
    </div>
  );
}


