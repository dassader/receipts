import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import type { LineItem, ReceiptBlock, ReceiptState, Totals } from "../../types";
import { getOrderedReceiptItems, hasReceiptBlock } from "../../domain/blocks";
import { formatDate, formatMoney, formatNumberInput, formatQuantity } from "../../domain/format";

type ReceiptDocumentProps = {
  receipt: ReceiptState;
  totals: Totals;
};

type BlockPart = {
  block: ReceiptBlock;
  id: string;
  kind: "block";
};

type ItemsPart = {
  currency: string;
  id: string;
  kind: "items";
  rows: LineItem[];
};

type ReceiptPart = BlockPart | ItemsPart;

type ReceiptPage = {
  id: string;
  parts: ReceiptPart[];
};

export function ReceiptDocument({ receipt, totals }: ReceiptDocumentProps) {
  const parts = useMemo(() => buildReceiptParts(receipt), [receipt]);
  const partsSignature = useMemo(() => getPartsSignature(parts), [parts]);
  const measureRef = useRef<HTMLElement>(null);
  const [pagination, setPagination] = useState<{ pages: ReceiptPage[]; signature: string }>({
    pages: [],
    signature: "",
  });

  useLayoutEffect(() => {
    const nextPages = paginateParts(parts, measureRef.current);

    setPagination((current) => {
      if (current.signature === partsSignature && getPagesSignature(current.pages) === getPagesSignature(nextPages)) {
        return current;
      }

      return {
        pages: nextPages,
        signature: partsSignature,
      };
    });
  }, [parts, partsSignature, receipt, totals]);

  const visiblePages =
    pagination.signature === partsSignature && pagination.pages.length > 0
      ? pagination.pages
      : [
          {
            id: "page-1",
            parts,
          },
        ];

  return (
    <div className={`receipt-pages ${receipt.paper}`}>
      <article aria-hidden="true" className={`receipt receipt-measure ${receipt.paper}`} ref={measureRef}>
        {parts.map((part) => renderReceiptPart(part, receipt, totals, true))}
      </article>

      {visiblePages.map((page, index) => (
        <article className={`receipt receipt-page ${receipt.paper}`} id={index === 0 ? "receipt-preview" : undefined} key={page.id}>
          {page.parts.map((part) => renderReceiptPart(part, receipt, totals, false))}
        </article>
      ))}
    </div>
  );
}

function buildReceiptParts(receipt: ReceiptState): ReceiptPart[] {
  const items = getOrderedReceiptItems(receipt);
  let itemTableRendered = false;
  const parts: ReceiptPart[] = [];

  for (const block of receipt.blocks) {
    if (block.type === "item") {
      if (itemTableRendered) {
        continue;
      }

      itemTableRendered = true;

      if (items.length > 0) {
        parts.push({
          currency: receipt.currency,
          id: "items",
          kind: "items",
          rows: items,
        });
      }

      continue;
    }

    if (block.type === "taxRate" || block.type === "discount" || block.type === "amountPaid") {
      continue;
    }

    parts.push({
      block,
      id: block.id,
      kind: "block",
    });
  }

  return parts;
}

function renderReceiptPart(part: ReceiptPart, receipt: ReceiptState, totals: Totals, measuring: boolean) {
  if (part.kind === "items") {
    return (
      <ReceiptItemsGroup
        currency={part.currency}
        items={part.rows}
        key={part.id}
        measureId={measuring ? part.id : undefined}
      />
    );
  }

  return <ReceiptBlockView block={part.block} key={part.id} measureId={measuring ? part.id : undefined} receipt={receipt} totals={totals} />;
}

function ReceiptBlockView({
  block,
  measureId,
  receipt,
  totals,
}: {
  block: ReceiptBlock;
  measureId?: string;
  receipt: ReceiptState;
  totals: Totals;
}) {
  switch (block.type) {
    case "businessName":
      return (
        <header className="receipt-block receipt-business-name" data-measure-part={measureId}>
          <h2>{trimValue(receipt.sellerName)}</h2>
        </header>
      );
    case "businessAddress":
      return <ReceiptTextBlock label="Address" lines={[trimValue(receipt.sellerAddress)]} measureId={measureId} />;
    case "businessPhone":
      return <ReceiptTextBlock label="Phone" lines={[trimValue(receipt.sellerPhone)]} measureId={measureId} />;
    case "businessEmail":
      return <ReceiptTextBlock label="Email" lines={[trimValue(receipt.sellerEmail)]} measureId={measureId} />;
    case "businessWebsite":
      return <ReceiptTextBlock label="Website" lines={[trimValue(receipt.sellerWebsite)]} measureId={measureId} />;
    case "businessId":
      return <ReceiptTextBlock label="Business ID" lines={[trimValue(receipt.sellerTaxId)]} measureId={measureId} />;
    case "receiptNumber":
      return <ReceiptTextBlock label="Receipt" lines={[trimValue(receipt.receiptNumber)]} measureId={measureId} strong />;
    case "receiptDate":
      return <ReceiptTextBlock label="Date" lines={[formatDate(receipt.receiptDate)]} measureId={measureId} strong />;
    case "customerName":
      return <ReceiptTextBlock label="Bill to" lines={[trimValue(receipt.customerName)]} measureId={measureId} strong />;
    case "customerEmail":
      return <ReceiptTextBlock label="Customer email" lines={[trimValue(receipt.customerEmail)]} measureId={measureId} />;
    case "taxRate":
    case "discount":
    case "amountPaid":
      return null;
    case "totalSummary":
      return (
        <section className="receipt-block receipt-totals" data-measure-part={measureId}>
          <ReceiptTotal label="Subtotal" value={formatMoney(totals.subtotal, receipt.currency)} />
          {hasReceiptBlock(receipt, "taxRate") && receipt.taxRate > 0 ? (
            <ReceiptTotal label={`Tax ${formatNumberInput(receipt.taxRate)}%`} value={formatMoney(totals.tax, receipt.currency)} />
          ) : null}
          {hasReceiptBlock(receipt, "discount") && totals.discount > 0 ? (
            <ReceiptTotal label="Discount" value={formatMoney(-totals.discount, receipt.currency)} />
          ) : null}
          <div className="grand-total">
            <span>Total</span>
            <strong>{formatMoney(totals.total, receipt.currency)}</strong>
          </div>
          {hasReceiptBlock(receipt, "amountPaid") ? (
            <ReceiptTotal label="Paid" value={formatMoney(totals.paid, receipt.currency)} />
          ) : null}
          {hasReceiptBlock(receipt, "amountPaid") && totals.balance > 0 ? (
            <ReceiptTotal label="Balance due" value={formatMoney(totals.balance, receipt.currency)} />
          ) : null}
        </section>
      );
    case "paymentMethod":
      return <ReceiptTextBlock label="Payment" lines={[trimValue(receipt.paymentMethod)]} measureId={measureId} strong />;
    case "cashier":
      return <ReceiptTextBlock label="Cashier" lines={[trimValue(receipt.cashier)]} measureId={measureId} strong />;
    case "note":
      return (
        <p className="receipt-block receipt-note" data-measure-part={measureId}>
          {trimValue(receipt.note)}
        </p>
      );
    case "footer":
      return (
        <footer className="receipt-block" data-measure-part={measureId}>
          {trimValue(receipt.footer)}
        </footer>
      );
  }
}

function ReceiptItemsGroup({ currency, items, measureId }: { currency: string; items: LineItem[]; measureId?: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="receipt-block receipt-items-block" data-measure-part={measureId}>
      <div className="receipt-items-heading">
        <span>Item</span>
        <span>Qty</span>
        <span>Price</span>
        <span>Total</span>
      </div>

      {items.map((item) => (
        <div className="receipt-items-row" data-measure-item-row={measureId ? `${measureId}:${item.id}` : undefined} key={item.id}>
          <strong>{trimValue(item.description)}</strong>
          <span>{formatQuantity(item.quantity)}</span>
          <span>{formatMoney(item.unitPrice, currency)}</span>
          <span>{formatMoney(item.quantity * item.unitPrice, currency)}</span>
        </div>
      ))}
    </section>
  );
}

function ReceiptTextBlock({
  label,
  lines,
  measureId,
  strong = false,
}: {
  label: string;
  lines: string[];
  measureId?: string;
  strong?: boolean;
}) {
  return (
    <section className="receipt-block receipt-text-block" data-measure-part={measureId}>
      <span>{label}</span>
      <p className={strong ? "strong-lines" : ""}>
        {lines.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </section>
  );
}

function ReceiptTotal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function trimValue(value: string) {
  return value.trim();
}

function paginateParts(parts: ReceiptPart[], measureRoot: HTMLElement | null): ReceiptPage[] {
  if (!measureRoot || parts.length === 0) {
    return [
      {
        id: "page-1",
        parts,
      },
    ];
  }

  const availableHeight = getAvailablePageHeight(measureRoot);

  if (availableHeight <= 0) {
    return [
      {
        id: "page-1",
        parts,
      },
    ];
  }

  const pages: ReceiptPage[] = [];
  let currentParts: ReceiptPart[] = [];
  let currentHeight = 0;

  const pushPage = () => {
    pages.push({
      id: `page-${pages.length + 1}`,
      parts: currentParts,
    });
    currentParts = [];
    currentHeight = 0;
  };

  const appendPart = (part: ReceiptPart, height: number) => {
    if (currentParts.length > 0 && currentHeight + height > availableHeight) {
      pushPage();
    }

    currentParts.push(part);
    currentHeight += height;
  };

  for (const part of parts) {
    const measured = getMeasuredPart(measureRoot, part.id);

    if (!measured) {
      continue;
    }

    if (part.kind === "block") {
      appendPart(part, getOuterHeight(measured));
      continue;
    }

    appendItemsPart(part, measured, measureRoot, availableHeight, appendPart, () => {
      if (currentParts.length > 0) {
        pushPage();
      }
    });
  }

  if (currentParts.length > 0 || pages.length === 0) {
    pushPage();
  }

  return pages;
}

function appendItemsPart(
  part: ItemsPart,
  measured: HTMLElement,
  measureRoot: HTMLElement,
  availableHeight: number,
  appendPart: (part: ReceiptPart, height: number) => void,
  pushCurrentPage: () => void,
) {
  const rowHeights = part.rows.map((row) => getOuterHeight(getMeasuredItemRow(measureRoot, `${part.id}:${row.id}`)));
  const rowsHeight = rowHeights.reduce((total, height) => total + height, 0);
  const baseHeight = Math.max(0, getOuterHeight(measured) - rowsHeight);
  let chunkRows: LineItem[] = [];
  let chunkHeight = baseHeight;
  let chunkStart = 0;

  const flushChunk = () => {
    if (chunkRows.length === 0) {
      return;
    }

    appendPart(
      {
        ...part,
        id: `${part.id}-${chunkStart}`,
        rows: chunkRows,
      },
      chunkHeight,
    );

    chunkRows = [];
    chunkHeight = baseHeight;
  };

  part.rows.forEach((row, index) => {
    const rowHeight = rowHeights[index];
    const nextHeight = chunkHeight + rowHeight;

    if (chunkRows.length === 0) {
      chunkStart = index;
      chunkRows = [row];
      chunkHeight = nextHeight;
      return;
    }

    if (nextHeight > availableHeight) {
      flushChunk();
      pushCurrentPage();
      chunkStart = index;
      chunkRows = [row];
      chunkHeight = baseHeight + rowHeight;
      return;
    }

    chunkRows.push(row);
    chunkHeight = nextHeight;
  });

  flushChunk();
}

function getAvailablePageHeight(measureRoot: HTMLElement) {
  const styles = window.getComputedStyle(measureRoot);
  const pageHeight = measureRoot.getBoundingClientRect().height;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;

  return pageHeight - paddingTop - paddingBottom;
}

function getMeasuredPart(root: HTMLElement, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-measure-part]")).find((element) => element.dataset.measurePart === id);
}

function getMeasuredItemRow(root: HTMLElement, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-measure-item-row]")).find(
    (element) => element.dataset.measureItemRow === id,
  );
}

function getOuterHeight(element: HTMLElement | undefined) {
  if (!element) {
    return 0;
  }

  const styles = window.getComputedStyle(element);
  const marginTop = Number.parseFloat(styles.marginTop) || 0;
  const marginBottom = Number.parseFloat(styles.marginBottom) || 0;

  return element.getBoundingClientRect().height + marginTop + marginBottom;
}

function getPartsSignature(parts: ReceiptPart[]) {
  return parts
    .map((part) => (part.kind === "items" ? `${part.id}:${part.rows.map(getItemSignature).join(",")}` : part.id))
    .join("|");
}

function getPagesSignature(pages: ReceiptPage[]) {
  return pages
    .map((page) =>
      page.parts
        .map((part) => (part.kind === "items" ? `${part.id}:${part.rows.map(getItemSignature).join(",")}` : part.id))
        .join("|"),
    )
    .join("/");
}

function getItemSignature(item: LineItem) {
  return `${item.id}:${item.description}:${item.quantity}:${item.unitPrice}`;
}
