import {
  Building2,
  Calculator,
  CreditCard,
  Hash,
  MapPin,
  MessageSquareText,
  Phone,
  ShoppingCart,
  StickyNote,
  Trash2,
  User,
} from "lucide-preact";
import type { LucideIcon } from "lucide-preact";
import type { LineItem, ReceiptBlock, ReceiptBlockType, ReceiptState, Totals } from "../../types";
import { getReceiptBlockDefinition } from "../../domain/blocks";
import { formatMoney, formatNumberInput, toNumber } from "../../domain/format";
import { IconButton } from "../ui/Button";
import { NumberField, SelectField, TextAreaField, TextField, ToggleField } from "../ui/Field";
import { Section } from "../ui/Section";

const paymentMethods = ["Cash", "Credit card", "Debit card", "ACH", "Check", "Zelle", "Venmo", "PayPal", "Other"];

const blockIcons: Record<ReceiptBlockType, LucideIcon> = {
  businessName: Building2,
  businessAddress: MapPin,
  businessContact: Phone,
  businessId: Hash,
  receiptDetails: Hash,
  customer: User,
  item: ShoppingCart,
  totals: Calculator,
  payment: CreditCard,
  note: StickyNote,
  footer: MessageSquareText,
};

type ReceiptBlockEditorProps = {
  block: ReceiptBlock;
  onRemoveBlock: (block: ReceiptBlock) => void;
  onUpdateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void;
  onUpdateItem: <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => void;
  receipt: ReceiptState;
  totals: Totals;
};

export function ReceiptBlockEditor({
  block,
  onRemoveBlock,
  onUpdateField,
  onUpdateItem,
  receipt,
  totals,
}: ReceiptBlockEditorProps) {
  const definition = getReceiptBlockDefinition(block.type);
  const Icon = blockIcons[block.type];
  const action = <IconButton icon={Trash2} onClick={() => onRemoveBlock(block)} title={`Remove ${definition.label}`} variant="danger" />;

  if (block.type === "item") {
    const item = receipt.items.find((candidate) => candidate.id === block.itemId);

    return item ? (
      <Section action={action} icon={Icon} title={definition.label}>
        <article className="item-row item-block-row">
          <label className="field item-description">
            <span>Description</span>
            <input
              onInput={(event) => onUpdateItem(item.id, "description", event.currentTarget.value)}
              type="text"
              value={item.description}
            />
          </label>

          <label className="field compact-field">
            <span>Qty</span>
            <input
              inputMode="decimal"
              min="0"
              onInput={(event) => onUpdateItem(item.id, "quantity", toNumber(event.currentTarget.value))}
              step="0.01"
              type="number"
              value={formatNumberInput(item.quantity)}
            />
          </label>

          <label className="field compact-field">
            <span>Price</span>
            <input
              inputMode="decimal"
              min="0"
              onInput={(event) => onUpdateItem(item.id, "unitPrice", toNumber(event.currentTarget.value))}
              step="0.01"
              type="number"
              value={formatNumberInput(item.unitPrice)}
            />
          </label>

          <label className="tax-check" title="Taxable item">
            <input
              checked={item.taxable}
              onChange={(event) => onUpdateItem(item.id, "taxable", event.currentTarget.checked)}
              type="checkbox"
            />
            <span>Tax</span>
          </label>

          <div className="line-total">{formatMoney(item.quantity * item.unitPrice, receipt.currency)}</div>
        </article>
      </Section>
    ) : null;
  }

  return (
    <Section action={action} icon={Icon} title={definition.label}>
      {renderBlockFields(block.type, receipt, totals, onUpdateField)}
    </Section>
  );
}

function renderBlockFields(
  type: ReceiptBlockType,
  receipt: ReceiptState,
  totals: Totals,
  updateField: <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => void,
) {
  switch (type) {
    case "businessName":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="LLC / business name"
            onChange={(value) => updateField("sellerName", value)}
            value={receipt.sellerName}
          />
        </div>
      );
    case "businessAddress":
      return (
        <div className="field-grid">
          <TextAreaField
            className="full"
            label="Business address"
            onChange={(value) => updateField("sellerAddress", value)}
            rows={2}
            value={receipt.sellerAddress}
          />
        </div>
      );
    case "businessContact":
      return (
        <div className="field-grid">
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
          <TextField label="Website" onChange={(value) => updateField("sellerWebsite", value)} type="url" value={receipt.sellerWebsite} />
        </div>
      );
    case "businessId":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Business ID"
            onChange={(value) => updateField("sellerTaxId", value)}
            value={receipt.sellerTaxId}
          />
        </div>
      );
    case "receiptDetails":
      return (
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
        </div>
      );
    case "customer":
      return (
        <div className="field-grid">
          <TextField label="Customer" onChange={(value) => updateField("customerName", value)} value={receipt.customerName} />
          <TextField
            label="Customer email"
            onChange={(value) => updateField("customerEmail", value)}
            type="email"
            value={receipt.customerEmail}
          />
        </div>
      );
    case "totals":
      return (
        <>
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
        </>
      );
    case "payment":
      return (
        <div className="field-grid">
          <SelectField
            label="Payment"
            onChange={(value) => updateField("paymentMethod", value)}
            options={paymentMethods}
            value={receipt.paymentMethod}
          />
          <TextField label="Cashier" onChange={(value) => updateField("cashier", value)} value={receipt.cashier} />
        </div>
      );
    case "note":
      return (
        <div className="field-grid">
          <TextAreaField
            className="full"
            label="Receipt note"
            onChange={(value) => updateField("note", value)}
            value={receipt.note}
          />
        </div>
      );
    case "footer":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Footer line"
            onChange={(value) => updateField("footer", value)}
            value={receipt.footer}
          />
        </div>
      );
  }
}
