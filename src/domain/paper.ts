import type { PaperFormat } from "../types";

export type PaperDefinition = {
  format: PaperFormat;
  label: string;
  shortLabel: string;
  sizeLabel: string;
  cssPageSize: string;
};

export const paperDefinitions: Record<PaperFormat, PaperDefinition> = {
  letter: {
    format: "letter",
    label: "US Letter",
    shortLabel: "Letter",
    sizeLabel: "8.5 x 11 in",
    cssPageSize: "letter",
  },
  legal: {
    format: "legal",
    label: "US Legal",
    shortLabel: "Legal",
    sizeLabel: "8.5 x 14 in",
    cssPageSize: "legal",
  },
  a4: {
    format: "a4",
    label: "A4",
    shortLabel: "A4",
    sizeLabel: "210 x 297 mm",
    cssPageSize: "A4",
  },
  a5: {
    format: "a5",
    label: "A5",
    shortLabel: "A5",
    sizeLabel: "148 x 210 mm",
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
