import { useEffect, useMemo, useState } from "preact/hooks";
import { Eye, Plus, Printer, X } from "lucide-preact";
import type { BeforeInstallPromptEvent, LineItem, PaperFormat, ReceiptBlock, ReceiptBlockType, ReceiptState } from "../types";
import { createReceiptBlock, getReceiptBlockDefinition, sortReceiptBlocks } from "../domain/blocks";
import { getTotals } from "../domain/totals";
import { createId } from "../domain/ids";
import { updatePrintPageSize } from "../domain/paper";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { AppShell } from "../layouts/AppShell";
import { FieldPalette } from "../components/builder/FieldPalette";
import { ReceiptBlockEditor } from "../components/builder/ReceiptBlockEditor";
import { PrintSetupDialog } from "../components/print/PrintSetupDialog";
import { Button, IconButton } from "../components/ui/Button";
import { ReceiptPreview } from "../components/receipt/ReceiptPreview";

export function ReceiptBuilderView() {
  const [receipt, setReceipt] = useState(loadReceiptState);
  const [status, setStatus] = useState("Saved");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [printSetupOpen, setPrintSetupOpen] = useState(false);
  const [draftPaper, setDraftPaper] = useState<PaperFormat>(receipt.paper);
  const totals = useMemo(() => getTotals(receipt), [receipt]);
  const activeBlockTypes = useMemo(() => new Set(receipt.blocks.map((block) => block.type)), [receipt.blocks]);

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

  useEffect(() => {
    const handleBeforePrint = () => updatePrintPageSize(receipt.paper);

    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, [receipt.paper]);

  const updateField = <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => {
    setReceipt((current) =>
      field === "amountPaid" ? { ...current, amountPaid: value as number, paidInFull: false } : { ...current, [field]: value },
    );
    setStatus("Saved");
  };

  const addBlock = (type: ReceiptBlockType) => {
    const definition = getReceiptBlockDefinition(type);

    setReceipt((current) => ({
      ...current,
      ...createNextReceiptBlocks(current, type),
    }));

    setPaletteOpen(false);
    setStatus(`${definition.label} added`);
  };

  const removeBlock = (block: ReceiptBlock) => {
    const definition = getReceiptBlockDefinition(block.type);

    setReceipt((current) => {
      if (block.type !== "item") {
        return { ...current, blocks: current.blocks.filter((candidate) => candidate.id !== block.id) };
      }

      if (!block.itemId) {
        return current;
      }

      return {
        ...current,
        blocks: current.blocks.filter((candidate) => candidate.id !== block.id),
        items: current.items.filter((item) => item.id !== block.itemId),
      };
    });

    setStatus(`${definition.label} removed`);
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

  const printReceipt = () => {
    setDraftPaper(receipt.paper);
    setPrintSetupOpen(true);
    setStatus("Choose paper");
  };

  const confirmPrint = () => {
    const nextReceipt = { ...receipt, paper: draftPaper };

    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = draftPaper;
    updatePrintPageSize(draftPaper);
    setPrintSetupOpen(false);
    setStatus("Ready to print");
    requestAnimationFrame(() => window.print());
  };

  const openPreview = () => {
    saveReceiptState(receipt);
    window.location.hash = "#/preview";
  };

  return (
    <AppShell
      actions={
        <>
          <Button className="action-button" icon={Eye} label="Preview" onClick={openPreview} variant="soft" />
          <Button className="action-button" icon={Printer} label="Print" onClick={printReceipt} variant="primary" />
        </>
      }
      installAvailable={Boolean(installPrompt)}
      onInstall={installApp}
    >
      <main className="workspace">
        <form autoComplete="on" className="tool-panel builder-panel">
          <div className="builder-toolbar">
            <div>
              <p className="eyebrow">Constructor</p>
              <h2>Receipt fields</h2>
            </div>
            <IconButton
              className="builder-add-button"
              icon={paletteOpen ? X : Plus}
              onClick={() => setPaletteOpen((current) => !current)}
              title={paletteOpen ? "Close fields" : "Add field"}
              variant="primary"
            />
          </div>

          {paletteOpen ? <FieldPalette activeTypes={activeBlockTypes} onAddBlock={addBlock} /> : null}

          {receipt.blocks.length > 0 ? (
            receipt.blocks.map((block) => (
              <ReceiptBlockEditor
                block={block}
                key={block.id}
                onRemoveBlock={removeBlock}
                onUpdateField={updateField}
                onUpdateItem={updateItem}
                receipt={receipt}
                totals={totals}
              />
            ))
          ) : (
            <section className="empty-builder">No fields selected</section>
          )}
        </form>

        <ReceiptPreview receipt={receipt} status={status} totals={totals} />
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

function createNextReceiptBlocks(receipt: ReceiptState, type: ReceiptBlockType) {
  if (type === "item") {
    const item: LineItem = {
      id: createId(),
      description: "New item",
      quantity: 1,
      unitPrice: 0,
    };

    return {
      blocks: sortReceiptBlocks([...receipt.blocks, createReceiptBlock("item", item.id)]),
      items: [...receipt.items, item],
    };
  }

  if (receipt.blocks.some((block) => block.type === type)) {
    return {
      blocks: receipt.blocks,
      items: receipt.items,
    };
  }

  return {
    blocks: sortReceiptBlocks([...receipt.blocks, createReceiptBlock(type)]),
    items: receipt.items,
  };
}
