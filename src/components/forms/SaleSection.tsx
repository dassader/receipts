import { BadgeDollarSign, FileText, Receipt } from "lucide-preact";
import type { PaperFormat, ReceiptState } from "../../types";
import { SelectField, TextField } from "../ui/Field";
import { Section } from "../ui/Section";
import { SegmentedControl } from "../ui/SegmentedControl";

const paymentMethods = ["Cash", "Credit card", "Debit card", "ACH", "Check", "Zelle", "Venmo", "PayPal", "Other"];

type SaleSectionProps = {
  receipt: ReceiptState;
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
};

export function SaleSection({ receipt, updateField }: SaleSectionProps) {
  return (
    <Section icon={BadgeDollarSign} title="Sale">
      <div className="field-grid">
        <TextField
          label="Receipt no."
          onChange={(value) => updateField("receiptNumber", value)}
          value={receipt.receiptNumber}
        />
        <TextField
          label="Issued"
          onChange={(value) => updateField("receiptDate", value)}
          type="date"
          value={receipt.receiptDate}
        />
        <TextField
          label="Customer"
          onChange={(value) => updateField("customerName", value)}
          value={receipt.customerName}
        />
        <TextField
          label="Customer email"
          onChange={(value) => updateField("customerEmail", value)}
          type="email"
          value={receipt.customerEmail}
        />
        <SelectField
          label="Payment"
          onChange={(value) => updateField("paymentMethod", value)}
          options={paymentMethods}
          value={receipt.paymentMethod}
        />
        <TextField label="Cashier" onChange={(value) => updateField("cashier", value)} value={receipt.cashier} />
      </div>

      <SegmentedControl<PaperFormat>
        ariaLabel="Paper format"
        onChange={(value) => updateField("paper", value)}
        options={[
          { icon: Receipt, label: "80mm", value: "thermal" },
          { icon: FileText, label: "Letter", value: "letter" },
        ]}
        value={receipt.paper}
      />
    </Section>
  );
}
