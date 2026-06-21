import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { FileDown, Printer } from "lucide-preact";
import type { BeforeInstallPromptEvent, LineItem, ReceiptState } from "../types";
import { getTotals } from "../domain/totals";
import { createId } from "../domain/ids";
import { updatePrintPageSize } from "../domain/paper";
import { fileBaseName } from "../lib/pwa";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { exportReceiptPdf } from "../lib/exporters";
import { AppShell } from "../layouts/AppShell";
import { Button } from "../components/ui/Button";
import { BusinessSection } from "../components/forms/BusinessSection";
import { SaleSection } from "../components/forms/SaleSection";
import { ItemsSection } from "../components/forms/ItemsSection";
import { TotalsSection } from "../components/forms/TotalsSection";
import { NotesSection } from "../components/forms/NotesSection";
import { ReceiptPreview } from "../components/receipt/ReceiptPreview";

export function ReceiptBuilderView() {
  const [receipt, setReceipt] = useState(loadReceiptState);
  const [status, setStatus] = useState("Saved");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const totals = useMemo(() => getTotals(receipt), [receipt]);

  useEffect(() => {
    saveReceiptState(receipt);
    document.body.dataset.paper = receipt.paper;
    updatePrintPageSize(receipt.paper);
  }, [receipt]);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  const updateField = <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => {
    setReceipt((current) => ({ ...current, [field]: value }));
    setStatus("Saved");
  };

  const addItem = () => {
    setReceipt((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: createId(),
          description: "New item",
          quantity: 1,
          unitPrice: 0,
          taxable: true,
        },
      ],
    }));
    setStatus("Item added");
  };

  const removeItem = (id: string) => {
    setReceipt((current) => {
      if (current.items.length === 1) {
        setStatus("Keep one item");
        return current;
      }

      setStatus("Item removed");
      return { ...current, items: current.items.filter((item) => item.id !== id) };
    });
  };

  const updateItem = <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => {
    setReceipt((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
    setStatus("Saved");
  };

  const installApp = async () => {
    if (!installPrompt) {
      setStatus("Install unavailable");
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const exportPdf = async () => {
    if (!receiptRef.current) {
      return;
    }

    setStatus("Rendering PDF");
    await exportReceiptPdf({
      fileBaseName: fileBaseName(receipt.receiptNumber),
      paper: receipt.paper,
      target: receiptRef.current,
    });
    setStatus("PDF ready");
  };

  return (
    <AppShell
      actions={
        <>
          <Button className="action-button" icon={Printer} label="Print" onClick={() => window.print()} variant="primary" />
          <Button className="action-button" icon={FileDown} label="Save PDF" onClick={exportPdf} />
        </>
      }
      installAvailable={Boolean(installPrompt)}
      onInstall={installApp}
    >
      <main className="workspace">
        <form autoComplete="on" className="tool-panel">
          <BusinessSection receipt={receipt} updateField={updateField} />
          <SaleSection receipt={receipt} updateField={updateField} />
          <ItemsSection
            currency={receipt.currency}
            items={receipt.items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
          <TotalsSection receipt={receipt} totals={totals} updateField={updateField} />
          <NotesSection receipt={receipt} updateField={updateField} />
        </form>

        <ReceiptPreview receipt={receipt} receiptRef={receiptRef} status={status} totals={totals} />
      </main>
    </AppShell>
  );
}
