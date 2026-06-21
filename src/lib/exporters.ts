import type { PaperFormat } from "../types";

type ExportOptions = {
  fileBaseName: string;
  paper: PaperFormat;
  target: HTMLElement;
};

export async function exportReceiptPng({ fileBaseName, target }: ExportOptions) {
  const dataUrl = await renderReceiptDataUrl(target);
  await downloadDataUrl(dataUrl, `${fileBaseName}.png`);
}

export async function exportReceiptPdf({ fileBaseName, paper, target }: ExportOptions) {
  const [{ jsPDF }, dataUrl] = await Promise.all([import("jspdf"), renderReceiptDataUrl(target)]);
  const dimensions = await readImageDimensions(dataUrl);

  if (paper === "thermal") {
    const pageWidth = 80;
    const margin = 3;
    const imageWidth = pageWidth - margin * 2;
    const imageHeight = (dimensions.height / dimensions.width) * imageWidth;
    const pageHeight = Math.max(120, imageHeight + margin * 2);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageWidth, pageHeight] });
    pdf.addImage(dataUrl, "PNG", margin, margin, imageWidth, imageHeight);
    pdf.save(`${fileBaseName}.pdf`);
    return;
  }

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const margin = 14;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (dimensions.height / dimensions.width) * imageWidth;
  const usableHeight = pageHeight - margin * 2;
  pdf.addImage(dataUrl, "PNG", margin, margin, imageWidth, Math.min(imageHeight, usableHeight));
  pdf.save(`${fileBaseName}.pdf`);
}

export function warmExporterChunks() {
  window.setTimeout(() => {
    void Promise.all([import("html-to-image"), import("jspdf")]);
  }, 1400);
}

async function renderReceiptDataUrl(target: HTMLElement) {
  const { toPng } = await import("html-to-image");
  return toPng(target, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    pixelRatio: 2,
  });
}

async function downloadDataUrl(dataUrl: string, fileName: string) {
  const blob = await fetch(dataUrl).then((response) => response.blob());
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
}

function readImageDimensions(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = dataUrl;
  });
}
