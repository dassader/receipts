import { FileText, Settings2 } from "lucide-preact";
import type { PaperFormat, ReceiptState } from "../../types";
import { paperOptions } from "../../domain/paper";
import { Section } from "../ui/Section";
import { SegmentedControl } from "../ui/SegmentedControl";

type SheetSectionProps = {
  receipt: ReceiptState;
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
};

export function SheetSection({ receipt, updateField }: SheetSectionProps) {
  return (
    <Section icon={Settings2} title="Sheet setup">
      <SegmentedControl<PaperFormat>
        ariaLabel="Paper format"
        onChange={(value) => updateField("paper", value)}
        options={paperOptions.map((option) => ({
          icon: FileText,
          label: option.shortLabel,
          value: option.format,
        }))}
        value={receipt.paper}
      />
    </Section>
  );
}
