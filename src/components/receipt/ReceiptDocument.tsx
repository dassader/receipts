import type { ReceiptState, Totals } from "../../types";
import { formatDate, formatMoney, formatNumberInput, formatQuantity } from "../../domain/format";

type ReceiptDocumentProps = {
  receipt: ReceiptState;
  totals: Totals;
};

export function ReceiptDocument({ receipt, totals }: ReceiptDocumentProps) {
  const sellerLines = [receipt.sellerAddress, receipt.sellerPhone, receipt.sellerEmail, receipt.sellerWebsite].filter(
    Boolean,
  );
  const customerLines = [receipt.customerName, receipt.customerEmail].filter(Boolean);

  return (
    <article className={`receipt ${receipt.paper}`} id="receipt-preview">
      <header className="receipt-business">
        <h2>{receipt.sellerName || "Your LLC"}</h2>
        {sellerLines.length > 0 ? (
          <p>
            {sellerLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ) : null}
        {receipt.sellerTaxId ? <p>Business ID: {receipt.sellerTaxId}</p> : null}
      </header>

      <section className="receipt-meta">
        <div>
          <span>Receipt</span>
          <strong>{receipt.receiptNumber}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{formatDate(receipt.receiptDate)}</strong>
        </div>
      </section>

      {customerLines.length > 0 ? (
        <section className="receipt-customer">
          <span>Bill to</span>
          <p>
            {customerLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <table className="receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.description || "Item"}
                {item.taxable ? <small>Taxable</small> : null}
              </td>
              <td>{formatQuantity(item.quantity)}</td>
              <td>{formatMoney(item.unitPrice, receipt.currency)}</td>
              <td>{formatMoney(item.quantity * item.unitPrice, receipt.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="receipt-totals">
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

      <section className="receipt-payment">
        <div>
          <span>Payment</span>
          <strong>{receipt.paymentMethod}</strong>
        </div>
        {receipt.cashier ? (
          <div>
            <span>Cashier</span>
            <strong>{receipt.cashier}</strong>
          </div>
        ) : null}
      </section>

      {receipt.note ? <p className="receipt-note">{receipt.note}</p> : null}
      <footer>{receipt.footer || "Thank you for your business."}</footer>
    </article>
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
