import { ListPlus, Plus, Trash2 } from "lucide-preact";
import type { LineItem } from "../../types";
import { formatMoney, formatNumberInput, toNumber } from "../../domain/format";
import { Button, IconButton } from "../ui/Button";
import { Section } from "../ui/Section";

type ItemsSectionProps = {
  currency: string;
  items: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => void;
};

export function ItemsSection({ currency, items, onAddItem, onRemoveItem, onUpdateItem }: ItemsSectionProps) {
  return (
    <Section
      action={<Button className="small-button" icon={Plus} label="Add" onClick={onAddItem} variant="soft" />}
      icon={ListPlus}
      title="Items"
    >
      <div className="items-list">
        {items.map((item) => (
          <article className="item-row" key={item.id}>
            <label className="field item-description">
              <span>Description</span>
              <input
                onInput={(event) => onUpdateItem(item.id, "description", event.currentTarget.value)}
                type="text"
                value={item.description}
              />
            </label>

            <label className="field compact-field">
              <span>Qty</span>
              <input
                inputMode="decimal"
                min="0"
                onInput={(event) => onUpdateItem(item.id, "quantity", toNumber(event.currentTarget.value))}
                step="0.01"
                type="number"
                value={formatNumberInput(item.quantity)}
              />
            </label>

            <label className="field compact-field">
              <span>Price</span>
              <input
                inputMode="decimal"
                min="0"
                onInput={(event) => onUpdateItem(item.id, "unitPrice", toNumber(event.currentTarget.value))}
                step="0.01"
                type="number"
                value={formatNumberInput(item.unitPrice)}
              />
            </label>

            <label className="tax-check" title="Taxable item">
              <input
                checked={item.taxable}
                onChange={(event) => onUpdateItem(item.id, "taxable", event.currentTarget.checked)}
                type="checkbox"
              />
              <span>Tax</span>
            </label>

            <div className="line-total">{formatMoney(item.quantity * item.unitPrice, currency)}</div>

            <IconButton icon={Trash2} onClick={() => onRemoveItem(item.id)} title="Remove item" variant="danger" />
          </article>
        ))}
      </div>
    </Section>
  );
}
