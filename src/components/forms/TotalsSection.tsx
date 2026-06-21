import { Calculator } from "lucide-preact";
import type { ReceiptState, Totals } from "../../types";
import { formatMoney } from "../../domain/format";
import { NumberField, ToggleField } from "../ui/Field";
import { Section } from "../ui/Section";

type TotalsSectionProps = {
  receipt: ReceiptState;
  totals: Totals;
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
};

export function TotalsSection({ receipt, totals, updateField }: TotalsSectionProps) {
  return (
    <Section icon={Calculator} title="Totals">
      <div className="field-grid compact">
        <NumberField label="Tax rate %" onChange={(value) => updateField("taxRate", value)} value={receipt.taxRate} />
        <NumberField label="Discount" onChange={(value) => updateField("discount", value)} value={receipt.discount} />
        <ToggleField
          checked={receipt.paidInFull}
          label="Paid in full"
          onChange={(value) => updateField("paidInFull", value)}
        />
        <NumberField
          className={receipt.paidInFull ? "field-disabled" : ""}
          disabled={receipt.paidInFull}
          label="Amount paid"
          onChange={(value) => updateField("amountPaid", value)}
          value={receipt.paidInFull ? totals.total : receipt.amountPaid}
        />
      </div>

      <dl className="totals-strip">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatMoney(totals.subtotal, receipt.currency)}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>{formatMoney(totals.tax, receipt.currency)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMoney(totals.total, receipt.currency)}</dd>
        </div>
      </dl>
    </Section>
  );
}
