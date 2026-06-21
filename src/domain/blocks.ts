import type { LineItem, ReceiptBlock, ReceiptBlockType, ReceiptState } from "../types";
import { createId } from "./ids";

export type ReceiptBlockDefinition = {
  description: string;
  label: string;
  order: number;
  repeatable: boolean;
  type: ReceiptBlockType;
};

export const receiptBlockDefinitions: ReceiptBlockDefinition[] = [
  {
    type: "businessName",
    label: "Business name",
    description: "Legal name or DBA",
    order: 10,
    repeatable: false,
  },
  {
    type: "businessAddress",
    label: "Business address",
    description: "Street, city, state, ZIP",
    order: 20,
    repeatable: false,
  },
  {
    type: "businessPhone",
    label: "Phone",
    description: "Business phone",
    order: 30,
    repeatable: false,
  },
  {
    type: "businessEmail",
    label: "Email",
    description: "Business email",
    order: 40,
    repeatable: false,
  },
  {
    type: "businessWebsite",
    label: "Website",
    description: "Business website",
    order: 50,
    repeatable: false,
  },
  {
    type: "businessId",
    label: "Business ID",
    description: "Optional tax or license ID",
    order: 60,
    repeatable: false,
  },
  {
    type: "receiptDetails",
    label: "Receipt details",
    description: "Number and issue date",
    order: 70,
    repeatable: false,
  },
  {
    type: "customer",
    label: "Customer",
    description: "Name and email",
    order: 80,
    repeatable: false,
  },
  {
    type: "item",
    label: "Item",
    description: "Description, quantity, price",
    order: 90,
    repeatable: true,
  },
  {
    type: "totals",
    label: "Totals",
    description: "Tax, discount, paid amount",
    order: 100,
    repeatable: false,
  },
  {
    type: "payment",
    label: "Payment",
    description: "Method and cashier",
    order: 110,
    repeatable: false,
  },
  {
    type: "note",
    label: "Note",
    description: "Policy or customer note",
    order: 120,
    repeatable: false,
  },
  {
    type: "footer",
    label: "Footer",
    description: "Final receipt line",
    order: 130,
    repeatable: false,
  },
];

const blockDefinitionsByType = new Map(receiptBlockDefinitions.map((definition) => [definition.type, definition]));

export function getReceiptBlockDefinition(type: ReceiptBlockType) {
  return blockDefinitionsByType.get(type) || receiptBlockDefinitions[0];
}

export function isReceiptBlockType(value: unknown): value is ReceiptBlockType {
  return typeof value === "string" && blockDefinitionsByType.has(value as ReceiptBlockType);
}

export function createReceiptBlock(type: ReceiptBlockType, itemId?: string): ReceiptBlock {
  return {
    id: createId(),
    itemId,
    type,
  };
}

export function sortReceiptBlocks(blocks: ReceiptBlock[]) {
  return blocks
    .map((block, index) => ({ block, index }))
    .sort((left, right) => {
      const leftOrder = getReceiptBlockDefinition(left.block.type).order;
      const rightOrder = getReceiptBlockDefinition(right.block.type).order;
      return leftOrder === rightOrder ? left.index - right.index : leftOrder - rightOrder;
    })
    .map(({ block }) => block);
}

export function createDefaultReceiptBlocks(items: LineItem[]) {
  return sortReceiptBlocks([
    createReceiptBlock("businessName"),
    createReceiptBlock("businessAddress"),
    createReceiptBlock("businessPhone"),
    createReceiptBlock("businessEmail"),
    createReceiptBlock("businessWebsite"),
    createReceiptBlock("receiptDetails"),
    createReceiptBlock("customer"),
    ...items.map((item) => createReceiptBlock("item", item.id)),
    createReceiptBlock("totals"),
    createReceiptBlock("payment"),
    createReceiptBlock("note"),
    createReceiptBlock("footer"),
  ]);
}

export function normalizeReceiptBlocks(value: unknown, items: LineItem[]) {
  const itemIds = new Set(items.map((item) => item.id));
  const seenSingletons = new Set<ReceiptBlockType>();
  const blocks: ReceiptBlock[] = [];

  if (Array.isArray(value)) {
    for (const maybeBlock of value) {
      if (!maybeBlock || typeof maybeBlock !== "object") {
        continue;
      }

      const rawType = "type" in maybeBlock ? maybeBlock.type : undefined;
      const types =
        rawType === "businessContact"
          ? (["businessPhone", "businessEmail", "businessWebsite"] as const)
          : isReceiptBlockType(rawType)
            ? ([rawType] as const)
            : [];

      if (types.length === 0) {
        continue;
      }

      const itemId = "itemId" in maybeBlock && typeof maybeBlock.itemId === "string" ? maybeBlock.itemId : undefined;

      for (const type of types) {
        const definition = getReceiptBlockDefinition(type);

        if (!definition.repeatable && seenSingletons.has(type)) {
          continue;
        }

        if (type === "item" && (!itemId || !itemIds.has(itemId))) {
          continue;
        }

        if (!definition.repeatable) {
          seenSingletons.add(type);
        }

        blocks.push({
          id:
            types.length === 1 && "id" in maybeBlock && typeof maybeBlock.id === "string"
              ? maybeBlock.id
              : createId(),
          itemId,
          type,
        });
      }
    }
  }

  return blocks.length > 0 ? sortReceiptBlocks(blocks) : createDefaultReceiptBlocks(items);
}

export function getOrderedReceiptItems(receipt: ReceiptState) {
  const itemById = new Map(receipt.items.map((item) => [item.id, item]));
  const items: LineItem[] = [];

  for (const block of receipt.blocks) {
    if (block.type !== "item" || !block.itemId) {
      continue;
    }

    const item = itemById.get(block.itemId);

    if (item) {
      items.push(item);
    }
  }

  return items;
}
