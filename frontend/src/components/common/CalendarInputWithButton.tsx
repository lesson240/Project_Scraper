// path: frontend/src/components/common/CalendarInputWithButton.tsx
import React, { useState, useId } from 'react';
import Button from '@/components/common/Button';
import '@/styles/common/calendarInputWithButton.css';

type Props = {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  buttonLabel: string;
  onButtonClick: (value: string) => void;
  disabledButton?: boolean;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
};

export default function CalendarInputWithButton({
  label,
  value,
  onChange,
  buttonLabel,
  onButtonClick,
  disabledButton = false,
  className,
  required = false,
  disabled = false,
  name,
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const inputId = useId();

  const normalizeToHyphenDate = (raw: string): string => {
    // 허용 입력: 진행형 포맷팅 (YYYY, YYYY-MM, YYYY-MM-DD)
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 8);
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);

    if (digits.length <= 4) {
      // 년도는 최대 4자리까지만 표시
      return y;
    }
    if (digits.length <= 6) {
      // YYYY-MM
      return `${y}-${m}`;
    }
    // YYYY-MM-DD
    return `${y}-${m}-${d}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = normalizeToHyphenDate(e.target.value);
    setLocalValue(next);
    onChange(next);
  };

  return (
    <div className={`calendar-input with-button ${className || ''}`}>
      {label && (
        <label className="calendar-label" htmlFor={inputId}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className="calendar-row">
        <input
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={localValue}
          onChange={handleChange}
          className="calendar-text-field"
          disabled={disabled}
          id={inputId}
          name={name}
        />
        <Button
          variant="seventh"
          customType="set"
          type="button"
          onClick={() => onButtonClick(localValue)}
          disabled={disabledButton}
          className={disabledButton ? 'is-verified' : ''}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}


