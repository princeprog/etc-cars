"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeftIcon, SaveIcon, SettingsIcon } from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCompleteSellerLeadInspectionMutation,
  useStartSellerLeadInspectionMutation,
  useUpdateSellerLeadInspectionMutation,
} from "@/hooks/mutations/inspection-checklists/use-inspection-checklists-mutations";
import { useSellerLeadInspectionQuery } from "@/hooks/queries/inspection-checklists/use-inspection-checklists-query";
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import type {
  SellerLeadInspection,
  SellerLeadInspectionAnswer,
} from "@/types/inspection-checklists";
import type { SellerLead, SellerLeadStatus } from "@/types/seller-leads";
import { SellerLeadInspectionChecklist } from "./seller-lead-inspection-checklist";
import {
  formatSellerLeadMoney,
  getActiveInspectionSections,
  getInspectionDraftFromRecord,
  getVehicleTitle,
  type InspectionDraft,
} from "./seller-lead-inspection-model";
import {
  InspectionFindingsPanel,
  InspectionProgressPanel,
  InspectionSummaryPanel,
} from "./seller-lead-inspection-panels";

function getStatusBadgeClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";
    case "Inspection Scheduled":
      return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    case "Evaluated":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    case "Approved to Buy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "Purchased":
      return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300";
    case "Rejected":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
  }
}

function SummaryItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-start gap-1 bg-card px-4 py-3",
        className,
      )}
    >
      <p className="w-full text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function LeadInspectionSummary({ lead }: { lead: SellerLead }) {
  const appointment = lead.pipeline?.context.latestFollowUpAt
    ? format(
        new Date(lead.pipeline.context.latestFollowUpAt),
        "MMM d, yyyy, h:mm a",
      )
    : "Not scheduled";

  return (
    <Card size="sm" className="gap-0 overflow-hidden rounded-lg py-0">
      <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
        <SummaryItem label="Seller">
          <p className="w-full truncate font-semibold" title={lead.sellerName}>
            {lead.sellerName}
          </p>
        </SummaryItem>
        <SummaryItem label="Vehicle">
          <p
            className="w-full truncate font-semibold"
            title={getVehicleTitle(lead)}
          >
            {getVehicleTitle(lead)}
          </p>
          <p className="w-full truncate text-sm text-muted-foreground">
            {lead.vehicleVariant || "Variant not recorded"}
          </p>
        </SummaryItem>
        <SummaryItem label="Seller Asking Price">
          <p className="w-full truncate text-lg font-semibold">
            {formatSellerLeadMoney(lead.askingPrice)}
          </p>
        </SummaryItem>
        <SummaryItem label="Lead Status">
          <Badge
            variant="outline"
            className={getStatusBadgeClassName(lead.status)}
          >
            {lead.status}
          </Badge>
        </SummaryItem>
        <SummaryItem label="Inspection Status">
          <Badge variant={lead.inspectionCompletedAt ? "secondary" : "outline"}>
            {lead.inspectionCompletedAt ? "Completed" : "Not Started"}
          </Badge>
        </SummaryItem>
        <SummaryItem label="Assigned Inspector">
          <p className="w-full truncate font-semibold">
            {lead.assigneeUserId ? "Assigned" : "Unassigned"}
          </p>
        </SummaryItem>
        <SummaryItem label="Appointment">
          <p className="w-full break-words text-sm font-medium leading-snug">
            {appointment}
          </p>
        </SummaryItem>
      </CardContent>
    </Card>
  );
}

function InspectionWorkspace({ lead }: { lead: SellerLead }) {
  const inspectionQuery = useSellerLeadInspectionQuery(lead.id);
  const startMutation = useStartSellerLeadInspectionMutation(lead.id);
  const inspection = inspectionQuery.data?.inspection ?? null;

  async function startInspection() {
    await startMutation.mutateAsync(undefined, {
      onSuccess: () => toast.success("Inspection checklist started"),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 md:px-6 md:pt-0 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-normal">
            Vehicle Inspection
          </h1>
          <p className="text-sm text-muted-foreground">
            Record the vehicle&apos;s condition before proceeding to the
            acquisition decision.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link href={`/seller-leads/${lead.id}`}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to Seller Lead
          </Link>
        </Button>
      </div>

      <LeadInspectionSummary lead={lead} />

      {inspectionQuery.isPending ? (
        <ModuleLoadingState label="Loading inspection checklist" />
      ) : inspectionQuery.error ? (
        <ApiErrorAlert
          title="Unable to load inspection checklist"
          message={getApiErrorMessage(inspectionQuery.error, "")}
        />
      ) : !inspection ? (
        <Card size="sm" className="rounded-lg">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Start inspection</h2>
              <p className="text-sm text-muted-foreground">
                Use the dealership checklist configured in inspection settings.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Checklist changes made by admins will update draft inspections
                until they are completed.
              </p>
              <SubmitButton
                type="button"
                pending={startMutation.isPending}
                pendingLabel="Starting inspection"
                onClick={() => void startInspection()}
              >
                Start Inspection
              </SubmitButton>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ActiveInspectionForm
          key={`${inspection.id}-${inspection.updatedAt}`}
          lead={lead}
          inspection={inspection}
        />
      )}
    </div>
  );
}

function ActiveInspectionForm({
  lead,
  inspection,
}: {
  lead: SellerLead;
  inspection: SellerLeadInspection;
}) {
  const router = useRouter();
  const updateMutation = useUpdateSellerLeadInspectionMutation(lead.id);
  const completeMutation = useCompleteSellerLeadInspectionMutation(lead.id);
  const [draft, setDraft] = React.useState<InspectionDraft>(() =>
    getInspectionDraftFromRecord(inspection),
  );
  const sections = getActiveInspectionSections(
    inspection.templateSnapshot.sections,
  );
  const readOnly = inspection.status === "completed";
  const pending = updateMutation.isPending || completeMutation.isPending;

  async function saveDraft() {
    await updateMutation.mutateAsync(buildInspectionUpdatePayload(draft), {
      onSuccess: () => toast.success("Inspection draft saved"),
    });
  }

  async function completeInspection() {
    await updateMutation.mutateAsync(buildInspectionUpdatePayload(draft));
    await completeMutation.mutateAsync(undefined, {
      onSuccess: () => toast.success("Inspection completed for review"),
    });
    router.push(`/seller-leads/${lead.id}/decision`);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {inspection.templateSnapshot.templateName} v
            {inspection.templateSnapshot.versionNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {readOnly
              ? "Completed inspections are read-only."
              : "Draft inspection"}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/settings/inspection-checklists">
            <SettingsIcon data-icon="inline-start" />
            Manage Checklists
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[1.35fr_1fr] xl:items-start">
        <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-4">
          <div className="order-1 xl:order-none">
            <SellerLeadInspectionChecklist
              draft={draft}
              onChange={setDraft}
              sections={sections}
              readOnly={readOnly}
            />
          </div>
          <div className="order-4 xl:order-none">
            <InspectionSummaryPanel
              draft={draft}
              onChange={setDraft}
              sections={sections}
              readOnly={readOnly}
            />
          </div>
        </div>
        <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-4">
          <div className="order-2 xl:order-none">
            <InspectionProgressPanel draft={draft} sections={sections} />
          </div>
          <div className="order-3 xl:order-none">
            <InspectionFindingsPanel
              draft={draft}
              onChange={setDraft}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

      {!readOnly ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <p className="text-xs text-muted-foreground sm:mr-2">
            Completing the inspection will move this seller lead to Decision
            Review.
          </p>
          <SubmitButton
            type="button"
            variant="outline"
            pending={pending}
            pendingLabel="Saving draft"
            onClick={() => void saveDraft()}
          >
            Save as Draft
          </SubmitButton>
          <SubmitButton
            type="button"
            pending={pending}
            pendingLabel="Completing inspection"
            onClick={() => void completeInspection()}
          >
            <SaveIcon data-icon="inline-start" />
            Complete Inspection
          </SubmitButton>
        </div>
      ) : null}
    </>
  );
}

function buildInspectionUpdatePayload(draft: InspectionDraft) {
  const answers = Object.fromEntries(
    Object.entries(draft.items).map(([id, value]) => [
      id,
      {
        rating: value.rating,
        notes: value.notes.trim() || null,
      } satisfies SellerLeadInspectionAnswer,
    ]),
  );

  return {
    answers,
    majorIssues: draft.majorIssues || null,
    recommendedRepairs: draft.recommendedRepairs || null,
    inspectorNotes: draft.inspectorNotes || null,
    estimatedRepairCost: draft.estimatedRepairCost || null,
  };
}

export function SellerLeadInspectionPage({ leadId }: { leadId: string }) {
  const leadQuery = useSellerLeadQuery(leadId);
  const lead = leadQuery.data?.sellerLead;
  const shellProps = {
    title: "Vehicle Inspection",
    breadcrumbs: [
      { label: "Seller Leads", href: "/seller-leads" },
      { label: "Vehicle Inspection" },
    ],
  };

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ModuleLoadingState label="Loading seller lead inspection" />
        </div>
      </AuthenticatedAppShell>
    );
  }

  if (leadQuery.error) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ApiErrorAlert
            title="Unable to load seller lead"
            message={getApiErrorMessage(leadQuery.error, "")}
          />
        </div>
      </AuthenticatedAppShell>
    );
  }

  if (!lead) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <EmptyState
            title="Seller lead not found"
            description="The requested seller lead could not be loaded."
          />
        </div>
      </AuthenticatedAppShell>
    );
  }

  return (
    <AuthenticatedAppShell {...shellProps}>
      <InspectionWorkspace key={lead.updatedAt} lead={lead} />
    </AuthenticatedAppShell>
  );
}
