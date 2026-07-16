"use client";

import {
  AlertTriangleIcon,
  ClipboardPenLineIcon,
  CircleIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getInspectionMetrics,
  type InspectionDraft,
  type OverallCondition,
} from "./seller-lead-inspection-model";

function CountRow({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "good" | "fair" | "poor" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <CircleIcon
          aria-hidden="true"
          className={cn(
            "size-2 fill-current",
            tone === "good" && "text-emerald-500",
            tone === "fair" && "text-amber-500",
            tone === "poor" && "text-rose-500",
            tone === "neutral" && "text-muted-foreground/50",
          )}
        />
        {label}
      </span>
      <span>{count}</span>
    </div>
  );
}

export function InspectionProgressPanel({ draft }: { draft: InspectionDraft }) {
  const metrics = getInspectionMetrics(draft);

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardHeader className="border-b py-2.5">
        <CardTitle className="text-base font-semibold">
          2. Inspection Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 py-2.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Overall completion</span>
            <span className="font-semibold">{metrics.completion}%</span>
          </div>
          <Progress
            value={metrics.completion}
            aria-label="Inspection completion"
            className="[&>[data-slot=progress-indicator]]:bg-blue-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Components checked</span>
            <span>
              {metrics.checked} of {metrics.total}
            </span>
          </div>
          <CountRow label="Good" count={metrics.counts.good} tone="good" />
          <CountRow label="Fair" count={metrics.counts.fair} tone="fair" />
          <CountRow label="Poor" count={metrics.counts.poor} tone="poor" />
          <CountRow
            label="Not checked"
            count={metrics.counts.unchecked}
            tone="neutral"
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-md border p-2.5">
          <p className="text-sm font-semibold">Readiness</p>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Current readiness</span>
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-800"
            >
              {metrics.readiness}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete all required inspection areas before submitting.
          </p>
          <Separator />
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Required areas remaining</span>
            <span className="font-semibold">{metrics.requiredRemaining}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InspectionFindingsPanel({
  draft,
  onChange,
}: {
  draft: InspectionDraft;
  onChange: (draft: InspectionDraft) => void;
}) {
  const fields = [
    {
      id: "major-issues",
      label: "Major Issues",
      description:
        "Document visible damage, warning signs, missing parts, paperwork problems, or mechanical concerns.",
      key: "majorIssues" as const,
      icon: AlertTriangleIcon,
      placeholder:
        "Example: Left fender repaint marks, weak A/C cooling, delayed transmission response.",
    },
    {
      id: "recommended-repairs",
      label: "Recommended Repairs",
      description:
        "List repair work, replacement parts, detailing, or verification needed before acquisition.",
      key: "recommendedRepairs" as const,
      icon: WrenchIcon,
      placeholder:
        "Example: Replace front tires, service brakes, request OR/CR copy, deep clean interior.",
    },
    {
      id: "inspector-notes",
      label: "Inspector Notes",
      description:
        "Add overall inspection context, seller remarks, test drive notes, or decision guidance.",
      key: "inspectorNotes" as const,
      icon: ClipboardPenLineIcon,
      placeholder:
        "Example: Seller is flexible on price. Unit is usable but needs repair allowance.",
    },
  ];

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-base font-semibold">
          3. Key Findings
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        <FieldGroup className="gap-3">
          {fields.map((field) => (
            <Field
              key={field.id}
              className="gap-2 rounded-md border bg-muted/20 p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <field.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <FieldLabel htmlFor={field.id} className="text-sm font-semibold">
                    {field.label}
                  </FieldLabel>
                  <FieldDescription className="text-xs leading-5">
                    {field.description}
                  </FieldDescription>
                </div>
              </div>
              <Textarea
                id={field.id}
                rows={3}
                value={draft[field.key]}
                onChange={(event) =>
                  onChange({ ...draft, [field.key]: event.target.value })
                }
                placeholder={field.placeholder}
                className="min-h-24 resize-y bg-background text-sm leading-6"
              />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

export function InspectionSummaryPanel({
  draft,
  onChange,
}: {
  draft: InspectionDraft;
  onChange: (draft: InspectionDraft) => void;
}) {
  const metrics = getInspectionMetrics(draft);
  const conditions: Array<{ value: OverallCondition; label: string }> = [
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-base font-semibold">
          4. Inspection Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-0 py-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex min-w-0 flex-col gap-2 px-4 py-1">
          <p className="text-xs font-medium">Overall Condition</p>
          <Select
            value={draft.overallCondition}
            onValueChange={(value: OverallCondition) =>
              onChange({ ...draft, overallCondition: value })
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {conditions.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-col gap-2 border-t px-4 py-3 sm:border-t-0 sm:border-l sm:py-1">
          <p className="text-xs font-medium">Estimated Repair Cost</p>
          <InputGroup className="h-8">
            <InputGroupAddon>
              <InputGroupText>₱</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              inputMode="numeric"
              value={draft.estimatedRepairCost}
              onChange={(event) =>
                onChange({
                  ...draft,
                  estimatedRepairCost: event.target.value.replace(
                    /[^0-9]/g,
                    "",
                  ),
                })
              }
              placeholder="0"
              aria-label="Estimated repair cost"
            />
          </InputGroup>
        </div>
        <div className="flex min-w-0 flex-col gap-2 border-t px-4 py-3 xl:border-t-0 xl:border-l xl:py-1">
          <p className="text-xs font-medium">Inspection Score</p>
          <p className="pt-2 text-lg font-medium">{metrics.score} / 100</p>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2 border-t px-4 py-3 sm:border-l xl:border-t-0 xl:py-1">
          <p className="text-xs font-medium">Acquisition Readiness</p>
          <Badge
            variant="outline"
            className="mt-1 border-amber-300 bg-amber-50 text-amber-800"
          >
            {metrics.readiness}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
