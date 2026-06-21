import { FileText } from "lucide-preact";
import type { PaperFormat } from "../../types";
import { paperOptions } from "../../domain/paper";
import { Button } from "../ui/Button";

type PaperPickerDialogProps = {
  onCancel: () => void;
  onSelect: (paper: PaperFormat) => void;
};

export function PaperPickerDialog({ onCancel, onSelect }: PaperPickerDialogProps) {
  return (
    <div aria-modal="true" className="print-setup-backdrop" role="dialog">
      <section className="print-setup-panel">
        <div className="print-setup-header">
          <p className="eyebrow">Preview</p>
          <h2>Paper format</h2>
        </div>

        <div className="paper-card-grid">
          {paperOptions.map((option) => (
            <button
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
