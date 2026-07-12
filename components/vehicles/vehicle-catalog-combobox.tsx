"use client";

import * as React from "react";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import type { VehicleCatalogItem } from "@/types/vehicle-catalog";

export function VehicleCatalogCombobox({
  id,
  value,
  items,
  placeholder,
  emptyLabel,
  addLabel,
  disabled = false,
  required = false,
  isLoading = false,
  isAdding = false,
  canAdd,
  onValueChange,
  onAdd,
}: {
  id: string;
  value: string;
  items: VehicleCatalogItem[];
  placeholder: string;
  emptyLabel: string;
  addLabel: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  isAdding?: boolean;
  canAdd: boolean;
  onValueChange: (value: string) => void;
  onAdd: () => void;
}) {
  const itemNames = React.useMemo(
    () => items.map((item) => item.name),
    [items],
  );

  return (
    <Combobox
      items={itemNames}
      value={value || null}
      inputValue={value}
      onInputValueChange={(nextValue) => onValueChange(nextValue)}
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear={Boolean(value)}
        disabled={disabled}
        required={required}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {isLoading ? "Loading options..." : emptyLabel}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
        {canAdd ? (
          <>
            <ComboboxSeparator />
            <div className="p-1">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={onAdd}
                disabled={isAdding}
              >
                {isAdding ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <PlusIcon data-icon="inline-start" />
                )}
                {addLabel}
              </Button>
            </div>
          </>
        ) : null}
      </ComboboxContent>
    </Combobox>
  );
}

export function normalizeCatalogName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function findCatalogItemByName(
  items: VehicleCatalogItem[],
  value: string,
) {
  const normalizedValue = normalizeCatalogName(value).toLocaleLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  return items.find(
    (item) =>
      normalizeCatalogName(item.name).toLocaleLowerCase() === normalizedValue,
  );
}
