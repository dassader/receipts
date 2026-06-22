import { FileText } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import type { PaperFormat } from "../../types";
import { paperOptions } from "../../domain/paper";
import { Button } from "../ui/Button";

type PaperPickerDialogProps = {
  onCancel: () => void;
  onSelect: (paper: PaperFormat) => void;
};

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function PaperPickerDialog({ onCancel, onSelect }: PaperPickerDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = requestAnimationFrame(() => getFocusableElements(dialog)[0]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [onCancel]);

  return (
    <div
      aria-labelledby="paper-picker-title"
      aria-modal="true"
      className="print-setup-backdrop"
      ref={dialogRef}
      role="dialog"
    >
      <section className="print-setup-panel">
        <div className="print-setup-header">
          <p className="eyebrow">Preview</p>
          <h2 id="paper-picker-title">Paper format</h2>
        </div>

        <div className="paper-card-grid">
          {paperOptions.map((option) => (
            <button
              aria-label={`${option.label}, ${option.sizeLabel}`}
              className="paper-card"
              key={option.format}
              onClick={() => onSelect(option.format)}
              type="button"
            >
              <FileText aria-hidden="true" />
              <span>{option.label}</span>
              <strong>{option.sizeLabel}</strong>
            </button>
          ))}
        </div>

        <div className="print-setup-actions">
          <Button className="cancel-button" label="Cancel" onClick={onCancel} variant="danger" />
        </div>
      </section>
    </div>
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}
