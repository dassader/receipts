import { useEffect, useMemo } from "preact/hooks";
import { ArrowLeft, Printer } from "lucide-preact";
import { useLocation } from "preact-iso";
import type { PaperFormat } from "../types";
import { getTotals } from "../domain/totals";
import { normalizePaperFormat, updatePrintPageSize } from "../domain/paper";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { appRoutes } from "../routes";
import { AppShell } from "../layouts/AppShell";
import { ReceiptDocument } from "../components/receipt/ReceiptDocument";
import { Button } from "../components/ui/Button";

export function ReceiptPreviewPage() {
  const location = useLocation();
  const paper = getPaperFromQuery(location.query.paper);
  const savedReceipt = useMemo(() => loadReceiptState(), []);
  const receipt = useMemo(() => (paper ? { ...savedReceipt, paper } : savedReceipt), [paper, savedReceipt]);
  const totals = useMemo(() => getTotals(receipt), [receipt]);

  useEffect(() => {
    if (!paper) {
      location.route(appRoutes.home, true);
      return;
    }

    document.body.dataset.paper = paper;
    updatePrintPageSize(paper);
  }, [location, paper]);

  if (!paper) {
    return null;
  }

  const openEditor = () => {
    location.route(appRoutes.home);
  };

  const printReceipt = () => {
    saveReceiptState(receipt);
    document.body.dataset.paper = paper;
    updatePrintPageSize(paper);
    requestAnimationFrame(() => window.print());
  };

  return (
    <AppShell
      actions={
        <>
          <Button className="action-button" icon={ArrowLeft} label="Edit" onClick={openEditor} variant="soft" />
          <Button className="action-button" icon={Printer} label="Print" onClick={printReceipt} variant="primary" />
        </>
      }
    >
      <main className="preview-page">
        <div aria-label="Receipt preview" className="preview-page-viewer">
          <div className="preview-page-canvas">
            <ReceiptDocument receipt={receipt} totals={totals} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function getPaperFromQuery(value: string | undefined): PaperFormat | null {
  if (!value) {
    return null;
  }

  const paper = normalizePaperFormat(value);
  return paper === value ? paper : null;
}
