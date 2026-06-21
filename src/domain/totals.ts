import type { ReceiptState, Totals } from "../types";
import { getOrderedReceiptItems, hasReceiptBlock } from "./blocks";

export function getTotals(receipt: ReceiptState): Totals {
  const items = getOrderedReceiptItems(receipt);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = hasReceiptBlock(receipt, "taxRate") ? Math.max(receipt.taxRate, 0) : 0;
  const taxableSubtotal = taxRate > 0 ? subtotal : 0;
  const tax = taxableSubtotal * (taxRate / 100);
  const discount = hasReceiptBlock(receipt, "discount") ? Math.min(Math.max(receipt.discount, 0), subtotal + tax) : 0;
  const total = Math.max(0, subtotal + tax - discount);
  const paid = hasReceiptBlock(receipt, "amountPaid")
    ? receipt.paidInFull
      ? total
      : Math.min(Math.max(receipt.amountPaid, 0), total)
    : 0;
  const balance = hasReceiptBlock(receipt, "amountPaid") ? Math.max(0, total - paid) : 0;

  return { subtotal, taxableSubtotal, tax, discount, total, paid, balance };
}
