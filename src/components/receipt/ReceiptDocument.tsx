import type { LineItem, ReceiptBlock, ReceiptState, Totals } from "../../types";
import { getOrderedReceiptItems, hasReceiptBlock } from "../../domain/blocks";
import { formatDate, formatMoney, formatNumberInput, formatQuantity } from "../../domain/format";

type ReceiptDocumentProps = {
  receipt: ReceiptState;
  totals: Totals;
};

export function ReceiptDocument({ receipt, totals }: ReceiptDocumentProps) {
  const items = getOrderedReceiptItems(receipt);
  let itemTableRendered = false;

  return (
    <article className={`receipt ${receipt.paper}`} id="receipt-preview">
      {receipt.blocks.map((block) => {
        if (block.type === "item") {
          if (itemTableRendered) {
            return null;
          }

          itemTableRendered = true;
          return <ReceiptItemsTable currency={receipt.currency} items={items} key="receipt-items" />;
        }

        return <ReceiptBlockView block={block} key={block.id} receipt={receipt} totals={totals} />;
      })}
    </article>
  );
}

function ReceiptBlockView({ block, receipt, totals }: { block: ReceiptBlock; receipt: ReceiptState; totals: Totals }) {
  switch (block.type) {
    case "businessName":
      return (
        <header className="receipt-block receipt-business-name">
          <h2>{valueOrPlaceholder(receipt.sellerName, "Business name")}</h2>
        </header>
      );
    case "businessAddress":
      return <ReceiptTextBlock label="Address" lines={[valueOrPlaceholder(receipt.sellerAddress, "Business address")]} />;
    case "businessPhone":
      return <ReceiptTextBlock label="Phone" lines={[valueOrPlaceholder(receipt.sellerPhone, "Phone")]} />;
    case "businessEmail":
      return <ReceiptTextBlock label="Email" lines={[valueOrPlaceholder(receipt.sellerEmail, "Email")]} />;
    case "businessWebsite":
      return <ReceiptTextBlock label="Website" lines={[valueOrPlaceholder(receipt.sellerWebsite, "Website")]} />;
    case "businessId":
      return <ReceiptTextBlock label="Business ID" lines={[valueOrPlaceholder(receipt.sellerTaxId, "Business ID")]} />;
    case "receiptNumber":
      return <ReceiptTextBlock label="Receipt" lines={[valueOrPlaceholder(receipt.receiptNumber, "Receipt no.")]} strong />;
    case "receiptDate":
      return <ReceiptTextBlock label="Date" lines={[formatDate(receipt.receiptDate)]} strong />;
    case "customerName":
      return <ReceiptTextBlock label="Bill to" lines={[valueOrPlaceholder(receipt.customerName, "Customer")]} strong />;
    case "customerEmail":
      return <ReceiptTextBlock label="Customer email" lines={[valueOrPlaceholder(receipt.customerEmail, "Customer email")]} />;
    case "taxRate":
    case "discount":
    case "amountPaid":
      return null;
    case "totalSummary":
      return (
        <section className="receipt-block receipt-totals">
          <ReceiptTotal label="Subtotal" value={formatMoney(totals.subtotal, receipt.currency)} />
          {hasReceiptBlock(receipt, "taxRate") && receipt.taxRate > 0 ? (
            <ReceiptTotal label={`Tax ${formatNumberInput(receipt.taxRate)}%`} value={formatMoney(totals.tax, receipt.currency)} />
          ) : null}
          {hasReceiptBlock(receipt, "discount") && totals.discount > 0 ? (
            <ReceiptTotal label="Discount" value={formatMoney(-totals.discount, receipt.currency)} />
          ) : null}
          <div className="grand-total">
            <span>Total</span>
            <strong>{formatMoney(totals.total, receipt.currency)}</strong>
          </div>
          {hasReceiptBlock(receipt, "amountPaid") ? (
            <ReceiptTotal label="Paid" value={formatMoney(totals.paid, receipt.currency)} />
          ) : null}
          {hasReceiptBlock(receipt, "amountPaid") && totals.balance > 0 ? (
            <ReceiptTotal label="Balance due" value={formatMoney(totals.balance, receipt.currency)} />
          ) : null}
        </section>
      );
    case "paymentMethod":
      return <ReceiptTextBlock label="Payment" lines={[valueOrPlaceholder(receipt.paymentMethod, "Payment method")]} strong />;
    case "cashier":
      return <ReceiptTextBlock label="Cashier" lines={[valueOrPlaceholder(receipt.cashier, "Cashier")]} strong />;
    case "note":
      return <p className="receipt-block receipt-note">{valueOrPlaceholder(receipt.note, "Receipt note")}</p>;
    case "footer":
      return <footer className="receipt-block">{valueOrPlaceholder(receipt.footer, "Thank you for your business.")}</footer>;
  }
}

function ReceiptItemsTable({ currency, items }: { currency: string; items: LineItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <table className="receipt-block receipt-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              {valueOrPlaceholder(item.description, "Item")}
            </td>
            <td>{formatQuantity(item.quantity)}</td>
            <td>{formatMoney(item.unitPrice, currency)}</td>
            <td>{formatMoney(item.quantity * item.unitPrice, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReceiptTextBlock({ label, lines, strong = false }: { label: string; lines: string[]; strong?: boolean }) {
  return (
    <section className="receipt-block receipt-text-block">
      <span>{label}</span>
      <p className={strong ? "strong-lines" : ""}>
        {lines.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </section>
  );
}

function ReceiptTotal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function valueOrPlaceholder(value: string, placeholder: string) {
  return value.trim() || placeholder;
}
