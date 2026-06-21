import type { PaperFormat } from "../types";

export type PaperDefinition = {
  format: PaperFormat;
  label: string;
  shortLabel: string;
  cssPageSize: string;
};

export const paperDefinitions: Record<PaperFormat, PaperDefinition> = {
  letter: {
    format: "letter",
    label: "US Letter",
    shortLabel: "Letter",
    cssPageSize: "letter",
  },
  legal: {
    format: "legal",
    label: "US Legal",
    shortLabel: "Legal",
    cssPageSize: "legal",
  },
  a4: {
    format: "a4",
    label: "A4",
    shortLabel: "A4",
    cssPageSize: "A4",
  },
  a5: {
    format: "a5",
    label: "A5",
    shortLabel: "A5",
    cssPageSize: "A5",
  },
};

export const paperOptions = Object.values(paperDefinitions);

export function normalizePaperFormat(value: unknown): PaperFormat {
  return value === "legal" || value === "a4" || value === "a5" || value === "letter" ? value : "letter";
}

export function getPaperDefinition(format: PaperFormat) {
  return paperDefinitions[format];
}

export function updatePrintPageSize(format: PaperFormat) {
  const styleId = "receipt-print-page-size";
  const definition = getPaperDefinition(format);
  let style = document.querySelector<HTMLStyleElement>(`#${styleId}`);

  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.append(style);
  }

  style.textContent = `@media print { @page { size: ${definition.cssPageSize}; margin: 0; } }`;
}
