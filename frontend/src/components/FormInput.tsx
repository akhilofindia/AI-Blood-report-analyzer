import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  unit,
  placeholder,
  required = false,
  min,
  max,
  step = 0.1,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="medical-label">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`medical-input pr-16 ${error ? "border-destructive focus:ring-destructive" : ""}`}
          aria-describedby={unit ? `${name}-unit` : undefined}
        />
        {unit && (
          <span
            id={`${name}-unit`}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none"
          >
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
