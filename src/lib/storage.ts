import type { ReceiptState } from "../types";
import { createDefaultReceipt } from "../domain/defaultReceipt";
import { createId } from "../domain/ids";
import { normalizeNumber } from "../domain/format";
import { normalizePaperFormat } from "../domain/paper";

const STORAGE_KEY = "receipt-studio-state-v1";

export function loadReceiptState(): ReceiptState {
  const fallback = createDefaultReceipt();
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReceiptState>;

    return {
      ...fallback,
      ...parsed,
      paper: normalizePaperFormat(parsed.paper),
      items:
        Array.isArray(parsed.items) && parsed.items.length > 0
          ? parsed.items.map((item) => ({
              id: item.id || createId(),
              description: item.description || "",
              quantity: normalizeNumber(item.quantity, 1),
              unitPrice: normalizeNumber(item.unitPrice, 0),
              taxable: item.taxable !== false,
            }))
          : fallback.items,
    };
  } catch {
    return fallback;
  }
}

export function saveReceiptState(receipt: ReceiptState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipt));
}
