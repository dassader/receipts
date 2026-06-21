import type { ReceiptState, Totals } from "../types";
import { getOrderedReceiptItems } from "./blocks";

export function getTotals(receipt: ReceiptState): Totals {
  const items = getOrderedReceiptItems(receipt);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxableSubtotal = items.reduce(
    (sum, item) => sum + (item.taxable ? item.quantity * item.unitPrice : 0),
    0,
  );
  const tax = taxableSubtotal * (receipt.taxRate / 100);
  const discount = Math.min(Math.max(receipt.discount, 0), subtotal + tax);
  const total = Math.max(0, subtotal + tax - discount);
  const paid = receipt.paidInFull ? total : Math.min(Math.max(receipt.amountPaid, 0), total);
  const balance = Math.max(0, total - paid);

  return { subtotal, taxableSubtotal, tax, discount, total, paid, balance };
}
