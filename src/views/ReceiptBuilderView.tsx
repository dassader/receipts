import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Eye, Plus } from "lucide-preact";
import { useLocation } from "preact-iso";
import type { LineItem, ReceiptBlock, ReceiptBlockType, ReceiptState } from "../types";
import { createReceiptBlock, sortReceiptBlocks } from "../domain/blocks";
import { createDemoReceipt } from "../domain/demoReceipt";
import { getTotals } from "../domain/totals";
import { createId } from "../domain/ids";
import { updatePrintPageSize } from "../domain/paper";
import { routeWithFade } from "../lib/navigation";
import { loadReceiptState, saveReceiptState } from "../lib/storage";
import { createPreviewRoute } from "../routes";
import { AppShell } from "../layouts/AppShell";
import { FieldPalette } from "../components/builder/FieldPalette";
import { ReceiptBlockEditor } from "../components/builder/ReceiptBlockEditor";
import { PaperPickerDialog } from "../components/print/PaperPickerDialog";
import { Button } from "../components/ui/Button";

const demoHoldDelayMs = 2000;
const demoCountdownSeconds = 3;

export function ReceiptBuilderView() {
  const location = useLocation();
  const [receipt, setReceipt] = useState(loadReceiptState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [previewSetupOpen, setPreviewSetupOpen] = useState(false);
  const [demoCountdown, setDemoCountdown] = useState<number | null>(null);
  const demoHoldTimeoutRef = useRef<number | null>(null);
  const demoCountdownIntervalRef = useRef<number | null>(null);
  const demoLongPressTriggeredRef = useRef(false);
  const suppressNextFieldsClickRef = useRef(false);
  const fieldsButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(
    () => () => {
      clearDemoHoldTimer();
      clearDemoCountdownTimer();
    },
    [],
  );

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
    if (demoCountdown !== null) {
      return;
    }

    if (paletteOpen) {
      closePalette();
      return;
    }

    openPalette();
  };

  const finishPaletteClose = (event: JSX.TargetedAnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (!paletteOpen && event.animationName === "tray-exit") {
      setPaletteVisible(false);
      fieldsButtonRef.current?.focus();
    }
  };

  const clearDemoHoldTimer = () => {
    if (demoHoldTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(demoHoldTimeoutRef.current);
    demoHoldTimeoutRef.current = null;
  };

  const clearDemoCountdownTimer = () => {
    if (demoCountdownIntervalRef.current === null) {
      return;
    }

    window.clearInterval(demoCountdownIntervalRef.current);
    demoCountdownIntervalRef.current = null;
  };

  const applyDemoReceipt = () => {
    const nextReceipt = createDemoReceipt();

    clearDemoCountdownTimer();
    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = nextReceipt.paper;
    updatePrintPageSize(nextReceipt.paper);
    setPaletteOpen(false);
    setPaletteVisible(false);
    setPreviewSetupOpen(false);
    setDemoCountdown(null);
  };

  const startDemoCountdown = () => {
    clearDemoHoldTimer();
    clearDemoCountdownTimer();
    demoLongPressTriggeredRef.current = true;
    setPaletteOpen(false);
    setPreviewSetupOpen(false);
    setDemoCountdown(demoCountdownSeconds);

    let nextCountdown = demoCountdownSeconds;
    demoCountdownIntervalRef.current = window.setInterval(() => {
      nextCountdown -= 1;

      if (nextCountdown <= 0) {
        applyDemoReceipt();
        return;
      }

      setDemoCountdown(nextCountdown);
    }, 1000);
  };

  const startFieldsHold = (event: JSX.TargetedPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || demoCountdown !== null) {
      return;
    }

    clearDemoHoldTimer();
    demoLongPressTriggeredRef.current = false;
    demoHoldTimeoutRef.current = window.setTimeout(startDemoCountdown, demoHoldDelayMs);
  };

  const startFieldsMouseHold = (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || demoCountdown !== null) {
      return;
    }

    clearDemoHoldTimer();
    demoLongPressTriggeredRef.current = false;
    demoHoldTimeoutRef.current = window.setTimeout(startDemoCountdown, demoHoldDelayMs);
  };

  const startFieldsTouchHold = () => {
    if (demoCountdown !== null) {
      return;
    }

    clearDemoHoldTimer();
    demoLongPressTriggeredRef.current = false;
    demoHoldTimeoutRef.current = window.setTimeout(startDemoCountdown, demoHoldDelayMs);
  };

  const stopFieldsHold = () => {
    clearDemoHoldTimer();

    if (!demoLongPressTriggeredRef.current) {
      return;
    }

    suppressNextFieldsClickRef.current = true;
    demoLongPressTriggeredRef.current = false;
  };

  const handleFieldsClick = () => {
    if (suppressNextFieldsClickRef.current || demoCountdown !== null) {
      suppressNextFieldsClickRef.current = false;
      return;
    }

    togglePalette();
  };

  const openPreviewWithPaper = (paper: ReceiptState["paper"]) => {
    const nextReceipt = { ...receipt, paper };

    setReceipt(nextReceipt);
    saveReceiptState(nextReceipt);
    document.body.dataset.paper = paper;
    updatePrintPageSize(paper);
    setPreviewSetupOpen(false);
    requestAnimationFrame(() => routeWithFade(location, createPreviewRoute(paper)));
  };

  return (
    <AppShell
      actions={
        <>
          <Button
            aria-controls="field-picker-tray"
            aria-expanded={paletteOpen}
            buttonRef={fieldsButtonRef}
            className={`action-button fields-action ${paletteOpen ? "is-open" : ""}`}
            icon={Plus}
            label="Fields"
            onClick={handleFieldsClick}
            onMouseDown={startFieldsMouseHold}
            onMouseLeave={stopFieldsHold}
            onMouseUp={stopFieldsHold}
            onPointerCancel={stopFieldsHold}
            onPointerDown={startFieldsHold}
            onPointerLeave={stopFieldsHold}
            onPointerUp={stopFieldsHold}
            onTouchCancel={stopFieldsHold}
            onTouchEnd={stopFieldsHold}
            onTouchStart={startFieldsTouchHold}
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
          id="field-picker-tray"
          onAnimationEnd={finishPaletteClose}
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

      {demoCountdown !== null ? (
        <div aria-live="assertive" className="demo-countdown" role="status">
          Demo in {demoCountdown}
        </div>
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
