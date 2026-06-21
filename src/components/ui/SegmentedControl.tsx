import type { LucideIcon } from "lucide-preact";

type SegmentedOption<T extends string> = {
  icon: LucideIcon;
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  value: T;
};

export function SegmentedControl<T extends string>({ ariaLabel, onChange, options, value }: SegmentedControlProps<T>) {
  return (
    <div aria-label={ariaLabel} className="segmented-control" role="radiogroup">
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <label className={`paper-option ${option.value === value ? "selected" : ""}`} key={option.value}>
            <input
              checked={option.value === value}
              name={ariaLabel}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <Icon aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
