import type { ComponentChildren, JSX, Ref } from "preact";
import type { LucideIcon } from "lucide-preact";

type ButtonVariant = "primary" | "neutral" | "soft" | "danger";

type ButtonProps = {
  children?: ComponentChildren;
  buttonRef?: Ref<HTMLButtonElement>;
  className?: string;
  icon?: LucideIcon;
  label?: string;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
} & Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children" | "className" | "onClick" | "title" | "type">;

export function Button({
  buttonRef,
  children,
  className = "",
  icon: Icon,
  label,
  onClick,
  title,
  type = "button",
  variant = "neutral",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      ref={buttonRef}
      title={title}
      type={type}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      {label ? <span>{label}</span> : children}
    </button>
  );
}

export function IconButton({
  buttonRef,
  className = "",
  icon: Icon,
  onClick,
  title,
  type = "button",
  variant = "neutral",
  ...buttonProps
}: Omit<ButtonProps, "children" | "label">) {
  return (
    <button
      {...buttonProps}
      aria-label={title}
      className={`icon-button button-${variant} ${className}`}
      onClick={onClick}
      ref={buttonRef}
      title={title}
      type={type}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
    </button>
  );
}
