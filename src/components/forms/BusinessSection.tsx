import { Store } from "lucide-preact";
import type { ReceiptState } from "../../types";
import { TextField } from "../ui/Field";
import { Section } from "../ui/Section";

type BusinessSectionProps = {
  receipt: ReceiptState;
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
};

export function BusinessSection({ receipt, updateField }: BusinessSectionProps) {
  return (
    <Section icon={Store} title="Business">
      <div className="field-grid">
        <TextField
          className="full"
          label="LLC / business name"
          onChange={(value) => updateField("sellerName", value)}
          value={receipt.sellerName}
        />
        <TextField
          className="full"
          label="Business address"
          onChange={(value) => updateField("sellerAddress", value)}
          value={receipt.sellerAddress}
        />
        <TextField
          inputMode="tel"
          label="Phone"
          onChange={(value) => updateField("sellerPhone", value)}
          type="tel"
          value={receipt.sellerPhone}
        />
        <TextField
          label="Email"
          onChange={(value) => updateField("sellerEmail", value)}
          type="email"
          value={receipt.sellerEmail}
        />
        <TextField
          label="Website"
          onChange={(value) => updateField("sellerWebsite", value)}
          type="url"
          value={receipt.sellerWebsite}
        />
        <TextField
          label="Business ID"
          onChange={(value) => updateField("sellerTaxId", value)}
          value={receipt.sellerTaxId}
        />
      </div>
    </Section>
  );
}
