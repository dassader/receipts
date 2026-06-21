export type PaperFormat = "letter" | "legal" | "a4" | "a5";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type ReceiptBlockType =
  | "businessName"
  | "businessAddress"
  | "businessPhone"
  | "businessEmail"
  | "businessWebsite"
  | "businessId"
  | "receiptNumber"
  | "receiptDate"
  | "customerName"
  | "customerEmail"
  | "item"
  | "taxRate"
  | "discount"
  | "amountPaid"
  | "totalSummary"
  | "paymentMethod"
  | "cashier"
  | "note"
  | "footer";

export type ReceiptBlock = {
  id: string;
  itemId?: string;
  type: ReceiptBlockType;
};

export type ReceiptState = {
  blocks: ReceiptBlock[];
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerWebsite: string;
  sellerTaxId: string;
  customerName: string;
  customerEmail: string;
  receiptNumber: string;
  receiptDate: string;
  paymentMethod: string;
  cashier: string;
  paper: PaperFormat;
  currency: string;
  taxRate: number;
  discount: number;
  paidInFull: boolean;
  amountPaid: number;
  note: string;
  footer: string;
  items: LineItem[];
};

export type Totals = {
  subtotal: number;
  taxableSubtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
