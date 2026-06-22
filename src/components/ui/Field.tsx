import type { JSX } from "preact";
import { formatNumberInput, toNumber } from "../../domain/format";

type TextFieldProps = {
  className?: string;
  inputMode?: JSX.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
};

type NumberFieldProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onChange: (value: number) => void;
  placeholder?: string;
  step?: string;
  value: number;
};

type SelectFieldProps = {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
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
  placeholder?: string;
  rows?: number;
  value: string;
};

export function TextField({ className = "", inputMode, label, onChange, placeholder = "", type = "text", value }: TextFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        inputMode={inputMode}
        onInput={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        title={label}
        type={type}
        value={value}
      />
    </label>
  );
}

export function NumberField({
  className = "",
  disabled = false,
  label,
  onChange,
  placeholder = "",
  step = "0.01",
  value,
}: NumberFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        disabled={disabled}
        inputMode="decimal"
        min="0"
        onInput={(event) => onChange(toNumber(event.currentTarget.value))}
        placeholder={placeholder}
        step={step}
        title={label}
        type="number"
        value={formatNumberInput(value)}
      />
    </label>
  );
}

export function SelectField({ className = "", label, onChange, options, placeholder, value }: SelectFieldProps) {
  return (
    <label className={`field select-field ${className}`}>
      <span className="sr-only">{label}</span>
      <select aria-label={label} onChange={(event) => onChange(event.currentTarget.value)} title={label} value={value}>
        {placeholder === undefined ? null : <option value="">{placeholder}</option>}
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

export function TextAreaField({ className = "", label, onChange, placeholder = "", rows = 3, value }: TextAreaFieldProps) {
  return (
    <label className={`field ${className}`}>
      <span className="sr-only">{label}</span>
      <textarea
        aria-label={label}
        onInput={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        rows={rows}
        title={label}
        value={value}
      />
    </label>
  );
}
