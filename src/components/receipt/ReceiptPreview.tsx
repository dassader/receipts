import type { Ref } from "preact";
import type { ReceiptState, Totals } from "../../types";
import { ReceiptDocument } from "./ReceiptDocument";

type ReceiptPreviewProps = {
  receipt: ReceiptState;
  receiptRef: Ref<HTMLDivElement>;
  status: string;
  totals: Totals;
};

export function ReceiptPreview({ receipt, receiptRef, status, totals }: ReceiptPreviewProps) {
  return (
    <aside aria-label="Receipt preview" className="preview-panel">
      <div className="preview-header">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>{receipt.paper === "thermal" ? "80mm receipt" : "Letter receipt"}</h2>
        </div>
        <div className="status-pill">{status}</div>
      </div>
      <div className="preview-canvas">
        <div ref={receiptRef}>
          <ReceiptDocument receipt={receipt} totals={totals} />
        </div>
      </div>
    </aside>
  );
}
