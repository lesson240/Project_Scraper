// path: frontend/src/components/common/CalendarInputWithButton.tsx
import React, { useState } from 'react';
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
}: Props) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/[^0-9-]/g, '').slice(0, 10);
    setLocalValue(next);
    onChange(next);
  };

  return (
    <div className={`calendar-input with-button ${className || ''}`}>
      {label && (
        <label className="calendar-label">
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
        />
        <Button
          variant="seventh"
          customType="set"
          type="button"
          onClick={() => onButtonClick(localValue)}
          disabled={disabledButton}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}


