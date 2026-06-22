import type { ReceiptState, Totals } from "../types";
import { hasReceiptBlock } from "./blocks";
import { formatMoney, formatNumberInput } from "./format";

export type ReceiptTotalRow = {
  emphasized?: boolean;
  key: "subtotal" | "tax" | "discount" | "total" | "paid" | "balance";
  label: string;
  value: string;
};

export function getReceiptTotalRows(receipt: ReceiptState, totals: Totals): ReceiptTotalRow[] {
  const rows: ReceiptTotalRow[] = [
    {
      key: "subtotal",
      label: "Subtotal",
      value: formatMoney(totals.subtotal, receipt.currency),
    },
  ];

  if (hasReceiptBlock(receipt, "taxRate") && receipt.taxRate > 0) {
    rows.push({
      key: "tax",
      label: `Tax ${formatNumberInput(receipt.taxRate)}%`,
      value: formatMoney(totals.tax, receipt.currency),
    });
  }

  if (hasReceiptBlock(receipt, "discount") && totals.discount > 0) {
    rows.push({
      key: "discount",
      label: "Discount",
      value: formatMoney(-totals.discount, receipt.currency),
    });
  }

  rows.push({
    emphasized: true,
    key: "total",
    label: "Total",
    value: formatMoney(totals.total, receipt.currency),
  });

  if (hasReceiptBlock(receipt, "amountPaid")) {
    rows.push({
      key: "paid",
      label: "Paid",
      value: formatMoney(totals.paid, receipt.currency),
    });
  }

  if (hasReceiptBlock(receipt, "amountPaid") && totals.balance > 0) {
    rows.push({
      key: "balance",
      label: "Balance due",
      value: formatMoney(totals.balance, receipt.currency),
    });
  }

  return rows;
}
