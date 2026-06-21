import { useEffect, useMemo, useState } from "preact/hooks";
import { Eye, Plus } from "lucide-preact";
import { useLocation } from "preact-iso";
import type { LineItem, ReceiptBlock, ReceiptBlockType, ReceiptState } from "../types";
import { createReceiptBlock, sortReceiptBlocks } from "../domain/blocks";
import { getTotals } from "../domain/totals";
import { createId } from "../domain/ids";
import { updatePrintPageSize } from "../domain/paper";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { createPreviewRoute } from "../routes";
import { AppShell } from "../layouts/AppShell";
import { FieldPalette } from "../components/builder/FieldPalette";
import { ReceiptBlockEditor } from "../components/builder/ReceiptBlockEditor";
import { PaperPickerDialog } from "../components/print/PaperPickerDialog";
import { Button } from "../components/ui/Button";

export function ReceiptBuilderView() {
  const location = useLocation();
  const [receipt, setReceipt] = useState(loadReceiptState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [previewSetupOpen, setPreviewSetupOpen] = useState(false);
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

    closePalette();
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

  const openPreview = () => {
    setPreviewSetupOpen(true);
  };

  const openPalette = () => {
    setPaletteVisible(true);
    setPaletteOpen(true);
  };

  const closePalette = () => {
    setPaletteOpen(false);
  };

  const togglePalette = () => {
    if (paletteOpen) {
      closePalette();
      return;
    }

    openPalette();
  };

  const finishPaletteClose = (animationName: string) => {
    if (!paletteOpen && animationName === "tray-exit") {
      setPaletteVisible(false);
    }
  };

  const openPreviewWithPaper = (paper: ReceiptState["paper"]) => {
    const nextReceipt = { ...receipt, paper };

    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = paper;
    updatePrintPageSize(paper);
    setPreviewSetupOpen(false);
    location.route(createPreviewRoute(paper));
  };

  return (
    <AppShell
      actions={
        <>
          <Button
            className={`action-button fields-action ${paletteOpen ? "is-open" : ""}`}
            icon={Plus}
            label="Fields"
            onClick={togglePalette}
            title={paletteOpen ? "Close fields" : "Open fields"}
            variant="soft"
          />
          <Button className="action-button" icon={Eye} label="Preview" onClick={openPreview} variant="primary" />
        </>
      }
    >
      <main className="workspace">
        <form autoComplete="on" className="tool-panel builder-panel">
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

      {paletteVisible ? (
        <aside
          aria-label="Field choices"
          className={`field-picker-tray ${paletteOpen ? "is-open" : "is-closing"}`}
          onAnimationEnd={(event) => finishPaletteClose(event.animationName)}
        >
          <FieldPalette activeTypes={activeBlockTypes} onAddBlock={addBlock} />
        </aside>
      ) : null}

      {previewSetupOpen ? (
        <PaperPickerDialog
          onCancel={() => setPreviewSetupOpen(false)}
          onSelect={openPreviewWithPaper}
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
