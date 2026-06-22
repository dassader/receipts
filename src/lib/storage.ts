import type { LineItem, ReceiptState } from "../types";
import { normalizeReceiptBlocks } from "../domain/blocks";
import { createDefaultReceipt } from "../domain/defaultReceipt";
import { createId } from "../domain/ids";
import { normalizeNumber } from "../domain/format";
import { normalizePaperFormat } from "../domain/paper";

const STORAGE_KEY = "receipt-studio-state-v1";
const LEGACY_DEMO_MIGRATION_KEY = "receipt-studio-legacy-demo-migration-v1";
const legacyDemoReceiptNumberPattern = /^R-\d{8}-\d{3}$/;
const legacyDemoReceiptDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function loadReceiptState(): ReceiptState {
  const fallback = createDefaultReceipt();
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    markLegacyDemoMigrationComplete();
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReceiptState>;
    if (isLegacyDemoReceipt(parsed)) {
      markLegacyDemoMigrationComplete();
      saveReceiptState(fallback);
      return fallback;
    }

    const items =
      Array.isArray(parsed.items)
        ? parsed.items.map((item) => ({
            id: item.id || createId(),
            description: item.description || "",
            quantity: normalizeNumber(item.quantity, 1),
            unitPrice: normalizeNumber(item.unitPrice, 0),
          }))
        : fallback.items;

    const receipt = {
      ...fallback,
      ...parsed,
      blocks: normalizeReceiptBlocks(parsed.blocks, items),
      paper: normalizePaperFormat(parsed.paper),
      items,
    };

    markLegacyDemoMigrationComplete();
    return receipt;
  } catch {
    return fallback;
  }
}

export function saveReceiptState(receipt: ReceiptState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipt));
}

function isLegacyDemoReceipt(receipt: Partial<ReceiptState>) {
  if (window.localStorage.getItem(LEGACY_DEMO_MIGRATION_KEY) === "1") {
    return false;
  }

  return (
    receipt.sellerName === "Evergreen Services LLC" &&
    receipt.sellerAddress === "1315 74th St, Brooklyn, NY 11228" &&
    receipt.sellerPhone === "(718) 555-0142" &&
    receipt.sellerEmail === "billing@example.com" &&
    receipt.sellerWebsite === "example.com" &&
    receipt.sellerTaxId === "" &&
    receipt.customerName === "Walk-in customer" &&
    receipt.customerEmail === "" &&
    typeof receipt.receiptNumber === "string" &&
    legacyDemoReceiptNumberPattern.test(receipt.receiptNumber) &&
    typeof receipt.receiptDate === "string" &&
    legacyDemoReceiptDatePattern.test(receipt.receiptDate) &&
    receipt.paymentMethod === "Credit card" &&
    receipt.cashier === "Front desk" &&
    isLegacyDemoPaper(receipt.paper) &&
    receipt.currency === "USD" &&
    receipt.taxRate === 8.875 &&
    receipt.discount === 0 &&
    receipt.paidInFull === true &&
    receipt.amountPaid === 0 &&
    receipt.note === "No refunds after 30 days with original receipt." &&
    receipt.footer === "Thank you for your business." &&
    Array.isArray(receipt.items) &&
    receipt.items.length === 2 &&
    matchesLegacyDemoItem(receipt.items[0], "Service labor", 1, 85) &&
    matchesLegacyDemoItem(receipt.items[1], "Parts", 2, 12.5)
  );
}

function isLegacyDemoPaper(paper: unknown) {
  return paper === "letter" || paper === "thermal";
}

function matchesLegacyDemoItem(
  item: Partial<LineItem> | undefined,
  description: string,
  quantity: number,
  unitPrice: number,
) {
  return item?.description === description && item.quantity === quantity && item.unitPrice === unitPrice;
}

function markLegacyDemoMigrationComplete() {
  window.localStorage.setItem(LEGACY_DEMO_MIGRATION_KEY, "1");
}
