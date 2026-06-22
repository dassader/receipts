import type { LineItem, ReceiptState } from "../types";
import { createReceiptBlock, receiptBlockDefinitions, sortReceiptBlocks } from "./blocks";
import { createId } from "./ids";

export function createDemoReceipt(): ReceiptState {
  const receiptDate = getTodayInputDate();
  const items: LineItem[] = [
    {
      id: createId(),
      description: "Diagnostic visit",
      quantity: 1,
      unitPrice: 85,
    },
    {
      id: createId(),
      description: "Plumbing repair labor",
      quantity: 2,
      unitPrice: 75,
    },
    {
      id: createId(),
      description: "Replacement faucet cartridge",
      quantity: 1,
      unitPrice: 42,
    },
    {
      id: createId(),
      description: "Braided supply lines",
      quantity: 2,
      unitPrice: 14,
    },
    {
      id: createId(),
      description: "Cleanup and disposal",
      quantity: 1,
      unitPrice: 15,
    },
  ];

  return {
    blocks: sortReceiptBlocks(
      receiptBlockDefinitions.flatMap((definition) =>
        definition.type === "item"
          ? items.map((item) => createReceiptBlock("item", item.id))
          : [createReceiptBlock(definition.type)],
      ),
    ),
    sellerName: "Harbor Home Repair LLC",
    sellerAddress: "1847 Maple Avenue\nAustin, TX 78704",
    sellerPhone: "(512) 555-0198",
    sellerEmail: "billing@harborhomerepair.com",
    sellerWebsite: "harborhomerepair.com",
    sellerTaxId: "TX Sales Tax ID 320-555-0187",
    customerName: "Maya Johnson",
    customerEmail: "maya.johnson@example.com",
    receiptNumber: `HR-${receiptDate.replace(/-/g, "")}-1042`,
    receiptDate,
    paymentMethod: "Credit card",
    cashier: "Nina Patel",
    paper: "letter",
    currency: "USD",
    taxRate: 8.25,
    discount: 6.4,
    paidInFull: false,
    amountPaid: 340,
    note: "Work completed at 214 Oak Ridge Dr. Paid by Visa ending 4242. Installed parts include a 90-day workmanship warranty.",
    footer: "Harbor Home Repair LLC appreciates your business.",
    items,
  };
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
