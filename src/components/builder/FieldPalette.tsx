import {
  Building2,
  Calculator,
  CreditCard,
  Globe2,
  Hash,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShoppingCart,
  StickyNote,
  User,
} from "lucide-preact";
import type { LucideIcon } from "lucide-preact";
import type { ReceiptBlockType } from "../../types";
import { receiptBlockDefinitions } from "../../domain/blocks";

const blockIcons: Record<ReceiptBlockType, LucideIcon> = {
  businessName: Building2,
  businessAddress: MapPin,
  businessPhone: Phone,
  businessEmail: Mail,
  businessWebsite: Globe2,
  businessId: Hash,
  receiptDetails: Hash,
  customer: User,
  item: ShoppingCart,
  totals: Calculator,
  payment: CreditCard,
  note: StickyNote,
  footer: MessageSquareText,
};

type FieldPaletteProps = {
  activeTypes: Set<ReceiptBlockType>;
  onAddBlock: (type: ReceiptBlockType) => void;
};

export function FieldPalette({ activeTypes, onAddBlock }: FieldPaletteProps) {
  return (
    <div className="field-palette">
      {receiptBlockDefinitions.map((definition) => {
        const Icon = blockIcons[definition.type];
        const added = activeTypes.has(definition.type) && !definition.repeatable;

        return (
          <button
            className={`palette-option ${added ? "is-added" : ""}`}
            disabled={added}
            key={definition.type}
            onClick={() => onAddBlock(definition.type)}
            type="button"
          >
            <Icon aria-hidden="true" />
            <span>{definition.label}</span>
            <small>{added ? "Added" : definition.description}</small>
          </button>
        );
      })}
    </div>
  );
}
