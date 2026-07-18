"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  CarFrontIcon,
  CheckCircle2Icon,
  CheckIcon,
  HandshakeIcon,
  InfoIcon,
  LockKeyholeIcon,
  SaveIcon,
  SearchIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { SubmitButton } from "@/components/operations/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SellerLead } from "@/types/seller-leads";
import {
  buildConvertVehicleHref,
  DECISION_CHOICES,
  getDecisionChoice,
  type DecisionChoiceId,
  type DecisionTone,
} from "./seller-lead-decision-model";

const DECISION_ICONS: Record<DecisionChoiceId, LucideIcon> = {
  review: SearchIcon,
  negotiate: HandshakeIcon,
  approve: CheckCircle2Icon,
  "walk-away": XCircleIcon,
};

const SELECTED_CLASSES: Record<DecisionTone, string> = {
  neutral: "border-blue-300 bg-blue-50/70",
  warning: "border-amber-400 bg-amber-50/75",
  success: "border-emerald-300 bg-emerald-50/70",
  danger: "border-rose-300 bg-rose-50/70",
};

const ICON_CLASSES: Record<DecisionTone, string> = {
  neutral: "text-slate-600",
  warning: "text-amber-700",
  success: "text-emerald-700",
  danger: "text-rose-600",
};

const BADGE_CLASSES: Record<DecisionTone, string> = {
  neutral: "border-blue-200 bg-blue-100 text-blue-700",
  warning: "border-amber-200 bg-amber-100 text-amber-700",
  success: "border-emerald-200 bg-emerald-100 text-emerald-700",
  danger: "border-rose-200 bg-rose-100 text-rose-700",
};

export function AcquisitionDecisionPanel({
  lead,
  selectedChoiceId,
  decisionNote,
  noteError,
  pending,
  errorMessage,
  onChoiceChange,
  onNoteChange,
  onCancel,
  onSave,
}: {
  lead: SellerLead;
  selectedChoiceId: DecisionChoiceId | null;
  decisionNote: string;
  noteError: string | null;
  pending: boolean;
  errorMessage: string | null;
  onChoiceChange: (choice: DecisionChoiceId) => void;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const inspectionMissing = !lead.inspectionCompletedAt;
  const selectedChoice = getDecisionChoice(selectedChoiceId);

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardHeader className="px-4 pt-2.5 pb-1.5">
        <CardTitle className="text-base font-semibold">
          Acquisition Decision
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Select the most appropriate next step based on the inspection results.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-2.5">
        {inspectionMissing ? (
          <Alert className="border-amber-300 bg-amber-50/70">
            <InfoIcon className="text-amber-700" />
            <AlertDescription className="flex flex-col gap-2 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Complete the vehicle inspection before recording a decision.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="w-fit bg-background"
                asChild
              >
                <Link href={`/seller-leads/${lead.id}/inspection`}>
                  Start Inspection
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="rounded-md border-blue-200 bg-blue-50/40 px-3 py-2">
            <InfoIcon className="text-blue-600" />
            <AlertDescription className="text-xs leading-5">
              Choosing a decision will update the seller lead status. You can
              review the result from the seller lead overview.
            </AlertDescription>
          </Alert>
        )}

        {errorMessage ? (
          <ApiErrorAlert
            title="Unable to save decision"
            message={errorMessage}
          />
        ) : null}

        <RadioGroup
          value={selectedChoiceId ?? ""}
          onValueChange={(value) => onChoiceChange(value as DecisionChoiceId)}
          className="gap-1.5"
          aria-label="Acquisition decision"
        >
          {DECISION_CHOICES.map((choice) => {
            const Icon = DECISION_ICONS[choice.id];
            const selected = choice.id === selectedChoiceId;
            return (
              <label
                key={choice.id}
                htmlFor={`decision-${choice.id}`}
                className={cn(
                  "grid min-h-12 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md border px-3 py-1.5 transition-colors",
                  selected
                    ? SELECTED_CLASSES[choice.tone]
                    : "hover:bg-muted/30",
                  inspectionMissing || pending
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
                )}
              >
                <RadioGroupItem
                  id={`decision-${choice.id}`}
                  value={choice.id}
                  disabled={inspectionMissing || pending}
                />
                <Icon
                  className={cn("size-4.5 shrink-0", ICON_CLASSES[choice.tone])}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {choice.title}
                  </span>
                  <span className="block text-[10px] leading-3 text-muted-foreground">
                    {choice.description}
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "hidden text-[11px] sm:inline-flex",
                    BADGE_CLASSES[choice.tone],
                  )}
                >
                  {choice.statusLabel}
                </Badge>
              </label>
            );
          })}
        </RadioGroup>

        <Field className="gap-1.5" data-invalid={Boolean(noteError)}>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="decision-note" className="font-semibold">
              Decision Note
            </FieldLabel>
            <span className="text-xs text-destructive">Required</span>
          </div>
          <Textarea
            id="decision-note"
            rows={2}
            value={decisionNote}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Explain the inspection evidence, price considerations, and reason for this decision."
            className="min-h-16 resize-y text-sm leading-5"
            aria-invalid={Boolean(noteError)}
            disabled={inspectionMissing || pending}
          />
          {noteError ? <FieldError>{noteError}</FieldError> : null}
          <FieldDescription className="text-xs">
            This note will appear in the seller lead overview and activity
            history.
          </FieldDescription>
        </Field>

        <div className="rounded-md border px-3 py-2">
          <p className="text-xs font-semibold">What happens next</p>
          {selectedChoice ? (
            <ul className="mt-1 space-y-0.5">
              {selectedChoice.nextSteps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-xs">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Select a decision to preview the resulting workflow.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
          <SubmitButton
            type="button"
            pending={pending}
            pendingLabel="Saving decision"
            disabled={inspectionMissing || !selectedChoice}
            onClick={onSave}
          >
            <SaveIcon data-icon="inline-start" />
            Save Decision
          </SubmitButton>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated{" "}
          {format(new Date(lead.updatedAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </CardContent>
    </Card>
  );
}

export function ConversionAction({ lead }: { lead: SellerLead }) {
  const enabled = lead.status === "Approved to Buy";

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardContent className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <CarFrontIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Convert to Vehicle</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? "Create the inventory record for this approved acquisition."
                : "Available after this seller lead is approved for purchase."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!enabled ? (
            <Badge
              variant="outline"
              className="bg-muted text-[11px] text-muted-foreground"
            >
              <LockKeyholeIcon data-icon="inline-start" />
              Requires approval
            </Badge>
          ) : null}
          {enabled ? (
            <Button size="sm" asChild>
              <Link href={buildConvertVehicleHref(lead)}>
                Convert to Vehicle
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Convert to Vehicle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
