import type { ReceiptBlockType } from "../../types";
import { receiptBlockDefinitions } from "../../domain/blocks";
import { blockIcons } from "./blockIcons";

type FieldPaletteProps = {
  activeTypes: Set<ReceiptBlockType>;
  onAddBlock: (type: ReceiptBlockType) => void;
};

export function FieldPalette({ activeTypes, onAddBlock }: FieldPaletteProps) {
  return (
    <div className="field-palette">
      {receiptBlockDefinitions.map((definition) => {
        const Icon = blockIcons[definition.type];
        const added = activeTypes.has(definition.type) && !definition.repeatable;

        return (
          <button
            className={`palette-option ${added ? "is-added" : ""}`}
            disabled={added}
            key={definition.type}
            onClick={() => onAddBlock(definition.type)}
            type="button"
          >
            <Icon aria-hidden="true" />
            <span>{definition.label}</span>
            <small>{added ? "Added" : definition.description}</small>
          </button>
        );
      })}
    </div>
  );
}
