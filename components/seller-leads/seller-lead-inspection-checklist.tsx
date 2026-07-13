"use client";

import * as React from "react";
import { MessageSquareTextIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  INSPECTION_SECTIONS,
  type InspectionDraft,
  type InspectionItemValue,
  type InspectionRating,
} from "./seller-lead-inspection-model";

const RATING_OPTIONS: Array<{
  label: string;
  value: Exclude<InspectionRating, null> | "not-checked";
}> = [
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Not Checked", value: "not-checked" },
];

function ratingClassName(value: string) {
  switch (value) {
    case "good":
      return "data-[state=on]:border-emerald-400 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-800 dark:data-[state=on]:border-emerald-800 dark:data-[state=on]:bg-emerald-950/40 dark:data-[state=on]:text-emerald-200";
    case "fair":
      return "data-[state=on]:border-amber-400 data-[state=on]:bg-amber-50 data-[state=on]:text-amber-800 dark:data-[state=on]:border-amber-800 dark:data-[state=on]:bg-amber-950/40 dark:data-[state=on]:text-amber-200";
    case "poor":
      return "data-[state=on]:border-rose-400 data-[state=on]:bg-rose-50 data-[state=on]:text-rose-800 dark:data-[state=on]:border-rose-800 dark:data-[state=on]:bg-rose-950/40 dark:data-[state=on]:text-rose-200";
    default:
      return "data-[state=on]:bg-muted data-[state=on]:text-foreground";
  }
}

function InspectionChecklistRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: InspectionItemValue;
  onChange: (value: InspectionItemValue) => void;
}) {
  const [showNotes, setShowNotes] = React.useState(Boolean(value.notes));

  return (
    <div className="border-t first:border-t-0">
      <div className="grid items-center gap-2 px-4 py-1 md:grid-cols-[minmax(12rem,1fr)_minmax(21rem,1.45fr)_2.25rem]">
        <p className="min-w-0 text-sm">{label}</p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={value.rating ?? "not-checked"}
          onValueChange={(nextValue) => {
            if (!nextValue) return;
            onChange({
              ...value,
              rating:
                nextValue === "not-checked"
                  ? null
                  : (nextValue as Exclude<InspectionRating, null>),
            });
          }}
          className="w-full [&_[data-slot=toggle-group-item]]:h-7"
          aria-label={`${label} condition`}
        >
          {RATING_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={cn(
                "min-w-0 flex-1 text-xs",
                ratingClassName(option.value),
              )}
              aria-label={`${label}: ${option.label}`}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Add note for ${label}`}
          title={`Add note for ${label}`}
          onClick={() => setShowNotes((current) => !current)}
        >
          <MessageSquareTextIcon />
        </Button>
      </div>
      {showNotes ? (
        <div className="px-4 pb-3 md:pl-[calc(40%+1rem)]">
          <Input
            value={value.notes}
            onChange={(event) =>
              onChange({ ...value, notes: event.target.value })
            }
            placeholder={`Add a note for ${label.toLowerCase()}`}
            aria-label={`${label} note`}
          />
        </div>
      ) : null}
    </div>
  );
}

export function SellerLeadInspectionChecklist({
  draft,
  onChange,
}: {
  draft: InspectionDraft;
  onChange: (draft: InspectionDraft) => void;
}) {
  function updateItem(id: string, value: InspectionItemValue) {
    onChange({
      ...draft,
      items: { ...draft.items, [id]: value },
    });
  }

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardHeader className="gap-1 border-b py-3">
        <CardTitle className="text-base font-semibold">
          1. Vehicle Condition Checklist
        </CardTitle>
        <CardDescription>
          Evaluate each area and select the condition that best represents the
          vehicle.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <Accordion
          type="single"
          collapsible
          defaultValue="exterior"
          className="overflow-hidden rounded-md border"
        >
          {INSPECTION_SECTIONS.map((section) => {
            const checked = section.items.filter(
              (item) => draft.items[item.id].rating !== null,
            ).length;

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-b last:border-b-0"
              >
                <AccordionTrigger className="min-h-9 rounded-none px-3 py-0 hover:no-underline">
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-3">
                    <span>{section.label}</span>
                    <span className="shrink-0 text-xs font-medium text-primary">
                      {checked} of {section.items.length} checked
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  {section.items.map((item) => (
                    <InspectionChecklistRow
                      key={item.id}
                      label={item.label}
                      value={draft.items[item.id]}
                      onChange={(value) => updateItem(item.id, value)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
