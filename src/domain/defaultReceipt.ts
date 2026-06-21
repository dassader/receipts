import type { ReceiptState } from "../types";

export function createDefaultReceipt(): ReceiptState {
  return {
    blocks: [],
    sellerName: "",
    sellerAddress: "",
    sellerPhone: "",
    sellerEmail: "",
    sellerWebsite: "",
    sellerTaxId: "",
    customerName: "",
    customerEmail: "",
    receiptNumber: "",
    receiptDate: "",
    paymentMethod: "",
    cashier: "",
    paper: "letter",
    currency: "USD",
    taxRate: 0,
    discount: 0,
    paidInFull: true,
    amountPaid: 0,
    note: "",
    footer: "",
    items: [],
  };
}
