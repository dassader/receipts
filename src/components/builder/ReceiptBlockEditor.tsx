import { Trash2 } from "lucide-preact";
import type { LineItem, ReceiptBlock, ReceiptBlockType, ReceiptState, Totals } from "../../types";
import { getReceiptBlockDefinition } from "../../domain/blocks";
import { formatMoney, formatNumberInput, toNumber } from "../../domain/format";
import { paymentMethods } from "../../domain/paymentMethods";
import { getReceiptTotalRows } from "../../domain/totalsRows";
import { assertNever } from "../../lib/assertNever";
import { IconButton } from "../ui/Button";
import { NumberField, SelectField, TextAreaField, TextField } from "../ui/Field";
import { Section } from "../ui/Section";
import { blockIcons } from "./blockIcons";

type EditableBlockType = Exclude<ReceiptBlockType, "item">;

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
  type: EditableBlockType,
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
    case "businessPhone":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            inputMode="tel"
            label="Phone"
            onChange={(value) => updateField("sellerPhone", value)}
            type="tel"
            value={receipt.sellerPhone}
          />
        </div>
      );
    case "businessEmail":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Email"
            onChange={(value) => updateField("sellerEmail", value)}
            type="email"
            value={receipt.sellerEmail}
          />
        </div>
      );
    case "businessWebsite":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Website"
            onChange={(value) => updateField("sellerWebsite", value)}
            type="url"
            value={receipt.sellerWebsite}
          />
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
    case "receiptNumber":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Receipt no."
            onChange={(value) => updateField("receiptNumber", value)}
            value={receipt.receiptNumber}
          />
        </div>
      );
    case "receiptDate":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Issued"
            onChange={(value) => updateField("receiptDate", value)}
            type="date"
            value={receipt.receiptDate}
          />
        </div>
      );
    case "customerName":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Customer"
            onChange={(value) => updateField("customerName", value)}
            value={receipt.customerName}
          />
        </div>
      );
    case "customerEmail":
      return (
        <div className="field-grid">
          <TextField
            className="full"
            label="Customer email"
            onChange={(value) => updateField("customerEmail", value)}
            type="email"
            value={receipt.customerEmail}
          />
        </div>
      );
    case "taxRate":
      return (
        <div className="field-grid">
          <NumberField
            className="full"
            label="Tax rate %"
            onChange={(value) => updateField("taxRate", value)}
            value={receipt.taxRate}
          />
        </div>
      );
    case "discount":
      return (
        <div className="field-grid">
          <NumberField
            className="full"
            label="Discount"
            onChange={(value) => updateField("discount", value)}
            value={receipt.discount}
          />
        </div>
      );
    case "amountPaid":
      return (
        <div className="field-grid">
          <NumberField
            className="full"
            label="Amount paid"
            onChange={(value) => updateField("amountPaid", value)}
            value={receipt.paidInFull ? totals.total : receipt.amountPaid}
          />
        </div>
      );
    case "totalSummary":
      return (
        <dl className="totals-strip builder-summary-strip">
          {getReceiptTotalRows(receipt, totals).map((row) => (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "paymentMethod":
      return (
        <div className="field-grid">
          <SelectField
            className="full"
            label="Payment"
            onChange={(value) => updateField("paymentMethod", value)}
            options={paymentMethods}
            placeholder="Payment method"
            value={receipt.paymentMethod}
          />
        </div>
      );
    case "cashier":
      return (
        <div className="field-grid">
          <TextField className="full" label="Cashier" onChange={(value) => updateField("cashier", value)} value={receipt.cashier} />
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

  return assertNever(type);
}
