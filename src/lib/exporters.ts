import type { PaperFormat } from "../types";
import { getPaperDefinition } from "../domain/paper";

type ExportOptions = {
  fileBaseName: string;
  paper: PaperFormat;
  target: HTMLElement;
};

export async function exportReceiptPdf({ fileBaseName, paper, target }: ExportOptions) {
  const [{ jsPDF }, dataUrl] = await Promise.all([import("jspdf"), renderReceiptDataUrl(target)]);
  const dimensions = await readImageDimensions(dataUrl);
  const definition = getPaperDefinition(paper);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: definition.pdfFormat });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 0;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (dimensions.height / dimensions.width) * imageWidth;

  pdf.addImage(dataUrl, "PNG", margin, margin, imageWidth, Math.min(imageHeight, pageHeight));
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

function readImageDimensions(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = dataUrl;
  });
}
