export type PaperFormat = "thermal" | "letter";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
};

export type ReceiptState = {
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
