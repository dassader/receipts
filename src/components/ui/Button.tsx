import type { ComponentChildren, JSX } from "preact";
import type { LucideIcon } from "lucide-preact";

type ButtonVariant = "primary" | "neutral" | "soft" | "danger";

type ButtonProps = {
  children?: ComponentChildren;
  className?: string;
  icon?: LucideIcon;
  label?: string;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  icon: Icon,
  label,
  onClick,
  title,
  type = "button",
  variant = "neutral",
}: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick} title={title} type={type}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {label ? <span>{label}</span> : children}
    </button>
  );
}

export function IconButton({
  className = "",
  icon: Icon,
  onClick,
  title,
  type = "button",
  variant = "neutral",
}: Omit<ButtonProps, "children" | "label">) {
  return (
    <button
      aria-label={title}
      className={`icon-button button-${variant} ${className}`}
      onClick={onClick}
      title={title}
      type={type}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
    </button>
  );
}
