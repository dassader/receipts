import type { ReceiptState } from "../types";
import { createId } from "./ids";

export function createDefaultReceipt(): ReceiptState {
  return {
    sellerName: "Evergreen Services LLC",
    sellerAddress: "1315 74th St, Brooklyn, NY 11228",
    sellerPhone: "(718) 555-0142",
    sellerEmail: "billing@example.com",
    sellerWebsite: "example.com",
    sellerTaxId: "",
    customerName: "Walk-in customer",
    customerEmail: "",
    receiptNumber: `R-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(
      100 + Math.random() * 900,
    )}`,
    receiptDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Credit card",
    cashier: "Front desk",
    paper: "letter",
    currency: "USD",
    taxRate: 8.875,
    discount: 0,
    paidInFull: true,
    amountPaid: 0,
    note: "No refunds after 30 days with original receipt.",
    footer: "Thank you for your business.",
    items: [
      {
        id: createId(),
        description: "Service labor",
        quantity: 1,
        unitPrice: 85,
        taxable: true,
      },
      {
        id: createId(),
        description: "Parts",
        quantity: 2,
        unitPrice: 12.5,
        taxable: true,
      },
    ],
  };
}
