import type { ReceiptState, Totals } from "../../types";
import { getPaperDefinition } from "../../domain/paper";
import { ReceiptDocument } from "./ReceiptDocument";

type ReceiptPreviewProps = {
  receipt: ReceiptState;
  status: string;
  totals: Totals;
};

export function ReceiptPreview({ receipt, status, totals }: ReceiptPreviewProps) {
  const paper = getPaperDefinition(receipt.paper);

  return (
    <aside aria-label="Receipt preview" className="preview-panel">
      <div className="preview-header">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>{paper.label} sheet</h2>
        </div>
        <div className="status-pill">{status}</div>
      </div>
      <div className="preview-canvas">
        <div>
          <ReceiptDocument receipt={receipt} totals={totals} />
        </div>
      </div>
    </aside>
  );
}
