import type { JSX } from "preact";
import { formatNumberInput, toNumber } from "../../domain/format";

type TextFieldProps = {
  className?: string;
  inputMode?: JSX.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

type NumberFieldProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onChange: (value: number) => void;
  step?: string;
  value: number;
};

type SelectFieldProps = {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
};

type ToggleFieldProps = {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
};

type TextAreaFieldProps = {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
};

export function TextField({ className = "", inputMode, label, onChange, type = "text", value }: TextFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <input
        inputMode={inputMode}
        onInput={(event) => onChange(event.currentTarget.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

export function NumberField({ className = "", disabled = false, label, onChange, step = "0.01", value }: NumberFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <input
        disabled={disabled}
        inputMode="decimal"
        min="0"
        onInput={(event) => onChange(toNumber(event.currentTarget.value))}
        step={step}
        type="number"
        value={formatNumberInput(value)}
      />
    </label>
  );
}

export function SelectField({ className = "", label, onChange, options, value }: SelectFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <select onChange={(event) => onChange(event.currentTarget.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({ checked, label, onChange }: ToggleFieldProps) {
  return (
    <label className="toggle-field">
      <input checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

export function TextAreaField({ className = "", label, onChange, rows = 3, value }: TextAreaFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <textarea onInput={(event) => onChange(event.currentTarget.value)} rows={rows} value={value} />
    </label>
  );
}
