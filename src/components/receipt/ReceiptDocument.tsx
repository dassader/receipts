import type { LineItem, ReceiptBlock, ReceiptState, Totals } from "../../types";
import { getOrderedReceiptItems } from "../../domain/blocks";
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
    case "businessContact":
      return (
        <ReceiptTextBlock
          label="Contact"
          lines={nonEmptyLines([receipt.sellerPhone, receipt.sellerEmail, receipt.sellerWebsite], "Phone / email / website")}
        />
      );
    case "businessId":
      return <ReceiptTextBlock label="Business ID" lines={[valueOrPlaceholder(receipt.sellerTaxId, "Business ID")]} />;
    case "receiptDetails":
      return (
        <section className="receipt-block receipt-meta">
          <div>
            <span>Receipt</span>
            <strong>{valueOrPlaceholder(receipt.receiptNumber, "Receipt no.")}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{formatDate(receipt.receiptDate)}</strong>
          </div>
        </section>
      );
    case "customer":
      return (
        <ReceiptTextBlock
          label="Bill to"
          lines={nonEmptyLines([receipt.customerName, receipt.customerEmail], "Customer")}
          strong
        />
      );
    case "totals":
      return (
        <section className="receipt-block receipt-totals">
          <ReceiptTotal label="Subtotal" value={formatMoney(totals.subtotal, receipt.currency)} />
          <ReceiptTotal label={`Tax ${formatNumberInput(receipt.taxRate)}%`} value={formatMoney(totals.tax, receipt.currency)} />
          {receipt.discount > 0 ? (
            <ReceiptTotal label="Discount" value={formatMoney(-totals.discount, receipt.currency)} />
          ) : null}
          <div className="grand-total">
            <span>Total</span>
            <strong>{formatMoney(totals.total, receipt.currency)}</strong>
          </div>
          <ReceiptTotal label="Paid" value={formatMoney(totals.paid, receipt.currency)} />
          {totals.balance > 0 ? (
            <ReceiptTotal label="Balance due" value={formatMoney(totals.balance, receipt.currency)} />
          ) : null}
        </section>
      );
    case "payment":
      return (
        <section className="receipt-block receipt-payment">
          <div>
            <span>Payment</span>
            <strong>{valueOrPlaceholder(receipt.paymentMethod, "Payment method")}</strong>
          </div>
          <div>
            <span>Cashier</span>
            <strong>{valueOrPlaceholder(receipt.cashier, "Cashier")}</strong>
          </div>
        </section>
      );
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
              {item.taxable ? <small>Taxable</small> : null}
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

function nonEmptyLines(lines: string[], placeholder: string) {
  const cleanLines = lines.map((line) => line.trim()).filter(Boolean);
  return cleanLines.length > 0 ? cleanLines : [placeholder];
}
