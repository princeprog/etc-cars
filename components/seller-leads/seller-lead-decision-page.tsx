"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CalendarPlusIcon } from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { Button } from "@/components/ui/button";
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation";
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query";
import { getApiErrorMessage } from "@/types/api";
import type { SellerLead } from "@/types/seller-leads";
import {
  AcquisitionDecisionPanel,
  ConversionAction,
} from "./seller-lead-decision-form";
import {
  DecisionEvidenceColumn,
  DecisionLeadSummary,
} from "./seller-lead-decision-evidence";
import {
  getDecisionChoice,
  getInitialDecisionChoice,
  type DecisionChoiceId,
} from "./seller-lead-decision-model";

function DecisionWorkspace({ lead }: { lead: SellerLead }) {
  const router = useRouter();
  const updateMutation = useUpdateSellerLeadMutation();
  const [selectedChoiceId, setSelectedChoiceId] =
    React.useState<DecisionChoiceId | null>(() =>
      getInitialDecisionChoice(lead),
    );
  const [decisionNote, setDecisionNote] = React.useState(
    lead.decisionNote ?? "",
  );
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const selectedChoice = getDecisionChoice(selectedChoiceId);

  function changeChoice(choice: DecisionChoiceId) {
    setSelectedChoiceId(choice);
    setNoteError(null);
  }

  function changeNote(value: string) {
    setDecisionNote(value);
    if (value.trim()) setNoteError(null);
  }

  function saveDecision() {
    if (!selectedChoice || !lead.inspectionCompletedAt) return;

    const trimmedNote = decisionNote.trim();
    if (!trimmedNote) {
      setNoteError("Add a short note explaining the reason for this decision.");
      return;
    }

    void (async () => {
      try {
        await updateMutation.mutateAsync({
          id: lead.id,
          payload: {
            decision: selectedChoice.decision,
            decisionNote: trimmedNote,
            status: selectedChoice.status,
          },
        });
        toast.success(
          `${selectedChoice.successMessage}. Returning to seller lead overview.`,
        );
        router.push(`/seller-leads/${lead.id}`);
      } catch {
        // The mutation error is rendered inside the decision panel.
      }
    })();
  }

  return (
    <div className="flex h-svh min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 pb-8 md:h-[calc(100svh-1rem)] md:px-6 md:pt-1 md:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-normal">
            Seller Lead Decision Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the inspection findings and choose the next acquisition step.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/seller-leads/${lead.id}`}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back to Seller Lead
            </Link>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/follow-ups">
              <CalendarPlusIcon data-icon="inline-start" />
              Schedule Follow-Up
            </Link>
          </Button>
        </div>
      </div>

      <DecisionLeadSummary lead={lead} />

      <div className="grid items-start gap-4 xl:grid-cols-[1.25fr_1fr]">
        <DecisionEvidenceColumn lead={lead} />
        <div className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-0">
          <AcquisitionDecisionPanel
            lead={lead}
            selectedChoiceId={selectedChoiceId}
            decisionNote={decisionNote}
            noteError={noteError}
            pending={updateMutation.isPending}
            errorMessage={
              updateMutation.error
                ? getApiErrorMessage(updateMutation.error, "")
                : null
            }
            onChoiceChange={changeChoice}
            onNoteChange={changeNote}
            onCancel={() => router.push(`/seller-leads/${lead.id}`)}
            onSave={saveDecision}
          />
          <ConversionAction lead={lead} />
        </div>
      </div>
    </div>
  );
}

export function SellerLeadDecisionPage({ leadId }: { leadId: string }) {
  const leadQuery = useSellerLeadQuery(leadId);
  const lead = leadQuery.data?.sellerLead;
  const shellProps = {
    title: "Seller Lead Decision Review",
    breadcrumbs: [
      { label: "Seller Leads", href: "/seller-leads" },
      { label: "Seller Lead Overview", href: `/seller-leads/${leadId}` },
      { label: "Decision Review" },
    ],
  };

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ModuleLoadingState label="Loading seller lead decision" />
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
      <DecisionWorkspace lead={lead} />
    </AuthenticatedAppShell>
  );
}
