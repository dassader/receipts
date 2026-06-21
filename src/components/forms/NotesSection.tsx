import { MessageSquareText } from "lucide-preact";
import type { ReceiptState } from "../../types";
import { TextAreaField, TextField } from "../ui/Field";
import { Section } from "../ui/Section";

type NotesSectionProps = {
  receipt: ReceiptState;
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
};

export function NotesSection({ receipt, updateField }: NotesSectionProps) {
  return (
    <Section icon={MessageSquareText} title="Notes">
      <div className="field-grid">
        <TextAreaField
          className="full"
          label="Receipt note"
          onChange={(value) => updateField("note", value)}
          value={receipt.note}
        />
        <TextField
          className="full"
          label="Footer line"
          onChange={(value) => updateField("footer", value)}
          value={receipt.footer}
        />
      </div>
      <p className="fine-print">Local receipt and tax rules vary by state, city, and business type.</p>
    </Section>
  );
}
