import { useEffect, useMemo, useState } from "preact/hooks";
import { Eye, Plus, Printer, X } from "lucide-preact";
import { useLocation } from "preact-iso";
import type { LineItem, PaperFormat, ReceiptBlock, ReceiptBlockType, ReceiptState } from "../types";
import { createReceiptBlock, sortReceiptBlocks } from "../domain/blocks";
import { getTotals } from "../domain/totals";
import { createId } from "../domain/ids";
import { updatePrintPageSize } from "../domain/paper";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { createPreviewRoute } from "../routes";
import { AppShell } from "../layouts/AppShell";
import { FieldPalette } from "../components/builder/FieldPalette";
import { ReceiptBlockEditor } from "../components/builder/ReceiptBlockEditor";
import { PrintSetupDialog } from "../components/print/PrintSetupDialog";
import { Button, IconButton } from "../components/ui/Button";

export function ReceiptBuilderView() {
  const location = useLocation();
  const [receipt, setReceipt] = useState(loadReceiptState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [printSetupOpen, setPrintSetupOpen] = useState(false);
  const [previewSetupOpen, setPreviewSetupOpen] = useState(false);
  const [draftPaper, setDraftPaper] = useState<PaperFormat>(receipt.paper);
  const totals = useMemo(() => getTotals(receipt), [receipt]);
  const activeBlockTypes = useMemo(() => new Set(receipt.blocks.map((block) => block.type)), [receipt.blocks]);

  useEffect(() => {
    document.body.dataset.paper = receipt.paper;
    updatePrintPageSize(receipt.paper);
  }, [receipt.paper]);

  useEffect(() => {
    const handleBeforePrint = () => updatePrintPageSize(receipt.paper);

    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, [receipt.paper]);

  const updateReceipt = (updater: (current: ReceiptState) => ReceiptState) => {
    setReceipt((current) => {
      const nextReceipt = updater(current);
      saveReceiptState(nextReceipt);
      return nextReceipt;
    });
  };

  const updateField = <K extends keyof ReceiptState>(field: K, value: ReceiptState[K]) => {
    updateReceipt((current) =>
      field === "amountPaid" ? { ...current, amountPaid: value as number, paidInFull: false } : { ...current, [field]: value },
    );
  };

  const addBlock = (type: ReceiptBlockType) => {
    updateReceipt((current) => ({
      ...current,
      ...createNextReceiptBlocks(current, type),
    }));

    setPaletteOpen(false);
  };

  const removeBlock = (block: ReceiptBlock) => {
    updateReceipt((current) => {
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
  };

  const updateItem = <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => {
    updateReceipt((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const printReceipt = () => {
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

  const openPreview = () => {
    setDraftPaper(receipt.paper);
    setPreviewSetupOpen(true);
  };

  const confirmPreview = () => {
    const nextReceipt = { ...receipt, paper: draftPaper };

    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = draftPaper;
    updatePrintPageSize(draftPaper);
    setPreviewSetupOpen(false);
    location.route(createPreviewRoute(draftPaper));
  };

  return (
    <AppShell
      actions={
        <>
          <Button className="action-button" icon={Eye} label="Preview" onClick={openPreview} variant="soft" />
          <Button className="action-button" icon={Printer} label="Print" onClick={printReceipt} variant="primary" />
        </>
      }
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
      </main>

      {printSetupOpen ? (
        <PrintSetupDialog
          onCancel={() => setPrintSetupOpen(false)}
          onPaperChange={setDraftPaper}
          onConfirm={confirmPrint}
          paper={draftPaper}
        />
      ) : null}

      {previewSetupOpen ? (
        <PrintSetupDialog
          confirmIcon={Eye}
          confirmLabel="Preview"
          eyebrow="Preview"
          onCancel={() => setPreviewSetupOpen(false)}
          onConfirm={confirmPreview}
          onPaperChange={setDraftPaper}
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
      description: "",
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
