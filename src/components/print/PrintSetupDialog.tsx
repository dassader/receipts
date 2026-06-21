import { FileText, Printer, X } from "lucide-preact";
import type { LucideIcon } from "lucide-preact";
import type { PaperFormat } from "../../types";
import { paperOptions } from "../../domain/paper";
import { Button, IconButton } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";

type PrintSetupDialogProps = {
  confirmIcon?: LucideIcon;
  confirmLabel?: string;
  eyebrow?: string;
  onCancel: () => void;
  onConfirm: () => void;
  onPaperChange: (paper: PaperFormat) => void;
  paper: PaperFormat;
  title?: string;
};

export function PrintSetupDialog({
  confirmIcon = Printer,
  confirmLabel = "Print",
  eyebrow = "Print setup",
  onCancel,
  onConfirm,
  onPaperChange,
  paper,
  title = "Paper format",
}: PrintSetupDialogProps) {
  const ConfirmIcon = confirmIcon;

  return (
    <div aria-modal="true" className="print-setup-backdrop" role="dialog">
      <section className="print-setup-panel">
        <div className="print-setup-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <IconButton icon={X} onClick={onCancel} title="Close print setup" />
        </div>

        <SegmentedControl<PaperFormat>
          ariaLabel="Paper format"
          onChange={onPaperChange}
          options={paperOptions.map((option) => ({
            icon: FileText,
            label: option.shortLabel,
            value: option.format,
          }))}
          value={paper}
        />

        <div className="print-setup-actions">
          <Button label="Cancel" onClick={onCancel} />
          <Button icon={ConfirmIcon} label={confirmLabel} onClick={onConfirm} variant="primary" />
        </div>
      </section>
    </div>
  );
}
