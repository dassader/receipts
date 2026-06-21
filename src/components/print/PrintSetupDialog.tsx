import { FileText, Printer, X } from "lucide-preact";
import type { PaperFormat } from "../../types";
import { paperOptions } from "../../domain/paper";
import { Button, IconButton } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";

type PrintSetupDialogProps = {
  onCancel: () => void;
  onPaperChange: (paper: PaperFormat) => void;
  onPrint: () => void;
  paper: PaperFormat;
};

export function PrintSetupDialog({ onCancel, onPaperChange, onPrint, paper }: PrintSetupDialogProps) {
  return (
    <div aria-modal="true" className="print-setup-backdrop" role="dialog">
      <section className="print-setup-panel">
        <div className="print-setup-header">
          <div>
            <p className="eyebrow">Print setup</p>
            <h2>Paper format</h2>
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
          <Button icon={Printer} label="Print" onClick={onPrint} variant="primary" />
        </div>
      </section>
    </div>
  );
}
