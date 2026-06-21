import { useEffect, useMemo, useState } from "preact/hooks";
import { ArrowLeft, Printer } from "lucide-preact";
import type { PaperFormat, ReceiptState } from "../types";
import { getTotals } from "../domain/totals";
import { updatePrintPageSize } from "../domain/paper";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { AppShell } from "../layouts/AppShell";
import { PrintSetupDialog } from "../components/print/PrintSetupDialog";
import { ReceiptDocument } from "../components/receipt/ReceiptDocument";
import { Button } from "../components/ui/Button";

export function ReceiptPreviewPage() {
  const [receipt, setReceipt] = useState<ReceiptState>(loadReceiptState);
  const [printSetupOpen, setPrintSetupOpen] = useState(false);
  const [draftPaper, setDraftPaper] = useState<PaperFormat>(receipt.paper);
  const totals = useMemo(() => getTotals(receipt), [receipt]);

  useEffect(() => {
    document.body.dataset.paper = receipt.paper;
    updatePrintPageSize(receipt.paper);
  }, [receipt.paper]);

  const openEditor = () => {
    window.location.hash = "";
  };

  const openPrintSetup = () => {
    setDraftPaper(receipt.paper);
    setPrintSetupOpen(true);
  };

  const confirmPrint = () => {
    const nextReceipt = { ...receipt, paper: draftPaper };

    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = draftPaper;
    updatePrintPageSize(draftPaper);
    setPrintSetupOpen(false);
    requestAnimationFrame(() => window.print());
  };

  return (
    <AppShell
      actions={
        <>
          <Button className="action-button" icon={ArrowLeft} label="Edit" onClick={openEditor} variant="soft" />
          <Button className="action-button" icon={Printer} label="Print" onClick={openPrintSetup} variant="primary" />
        </>
      }
      installAvailable={false}
      onInstall={() => undefined}
    >
      <main className="preview-page">
        <div className="preview-page-canvas">
          <ReceiptDocument receipt={receipt} totals={totals} />
        </div>
      </main>

      {printSetupOpen ? (
        <PrintSetupDialog
          onCancel={() => setPrintSetupOpen(false)}
          onPaperChange={setDraftPaper}
          onPrint={confirmPrint}
          paper={draftPaper}
        />
      ) : null}
    </AppShell>
  );
}
