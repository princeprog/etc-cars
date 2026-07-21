"use client";

import * as React from "react";
import { CalendarClockIcon, CalendarPlusIcon } from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation";
import { useUpdateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-update-follow-up-mutation";
import { useActiveFollowUpQuery } from "@/hooks/queries/follow-ups/use-active-follow-up-query";
import { getApiErrorMessage, isAppApiError } from "@/types/api";
import type { LeadType } from "@/types/follow-ups";

type LeadFollowUpDialogFormProps = {
  leadType: LeadType;
  leadId: string;
  leadName: string;
  leadSecondary: string;
  currentUserId?: string;
  assigneeUserId: string | null;
  defaultDueAt: Date;
  defaultNote: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function LeadFollowUpDialogForm({
  leadType,
  leadId,
  leadName,
  leadSecondary,
  currentUserId,
  assigneeUserId: leadAssigneeUserId,
  defaultDueAt,
  defaultNote,
  onClose,
  onSuccess,
}: LeadFollowUpDialogFormProps) {
  const activeQuery = useActiveFollowUpQuery(leadType, leadId);
  const createMutation = useCreateFollowUpMutation();
  const updateMutation = useUpdateFollowUpMutation();
  const activeFollowUp = activeQuery.data?.followUp ?? null;
  const isRescheduleMode = Boolean(activeFollowUp);
  const assigneeUserId =
    activeFollowUp?.assigneeUserId ?? currentUserId ?? leadAssigneeUserId ?? "";
  const [dueAt, setDueAt] = React.useState<Date | undefined>(defaultDueAt);
  const [note, setNote] = React.useState(defaultNote);

  React.useEffect(() => {
    if (!activeQuery.isSuccess) {
      return;
    }

    if (activeFollowUp) {
      setDueAt(new Date(activeFollowUp.dueAt));
      setNote(activeFollowUp.note);
      return;
    }

    setDueAt(defaultDueAt);
    setNote(defaultNote);
  }, [activeQuery.isSuccess, activeFollowUp, defaultDueAt, defaultNote]);

  async function loadActiveFollowUpAfterConflict() {
    const result = await activeQuery.refetch();
    const followUp = result.data?.followUp;

    if (!followUp) {
      return false;
    }

    setDueAt(new Date(followUp.dueAt));
    setNote(followUp.note);
    createMutation.reset();
    toast.info("Existing follow-up loaded. Review and reschedule it.", {
      details: `${leadName} already has an active ${leadType} lead follow-up, so its current reminder was loaded.`,
    });
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assigneeUserId || !dueAt || !note.trim()) {
      return;
    }

    const payload = {
      dueAt: dueAt.toISOString(),
      note: note.trim(),
    };

    if (activeFollowUp) {
      await updateMutation.mutateAsync({
        id: activeFollowUp.id,
        payload,
      });
      toast.success("Follow-up rescheduled", {
        details: `${leadName}'s ${leadType} lead reminder now uses the updated date, time, and note.`,
      });
      onSuccess?.();
      onClose();
      return;
    }

    try {
      await createMutation.mutateAsync({
        leadType,
        ...(leadType === "buyer"
          ? { buyerLeadId: leadId }
          : { sellerLeadId: leadId }),
        assigneeUserId,
        ...payload,
      });
      toast.success("Follow-up scheduled", {
        details: `${leadName}'s ${leadType} lead reminder was scheduled for ${dueAt.toLocaleString()}.`,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      if (isAppApiError(error) && error.status === 409) {
        await loadActiveFollowUpAfterConflict();
      }
    }
  }

  const mutation = activeFollowUp ? updateMutation : createMutation;
  const title = isRescheduleMode
    ? "Reschedule Follow-Up"
    : "Schedule Follow-Up";
  const description = isRescheduleMode
    ? `Update the active follow-up for ${leadName}.`
    : `Create the next contact task for ${leadName}.`;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {activeQuery.isPending ? (
        <ModuleLoadingState label="Checking active follow-up" />
      ) : activeQuery.error ? (
        <ApiErrorAlert
          title="Unable to check active follow-up"
          message={getApiErrorMessage(activeQuery.error, "")}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <ApiErrorAlert
            title={
              isRescheduleMode
                ? "Unable to reschedule follow-up"
                : "Unable to schedule follow-up"
            }
            message={getApiErrorMessage(mutation.error, "")}
          />
          <div className="rounded-md border bg-muted/20 px-3 py-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {isRescheduleMode ? (
                  <CalendarClockIcon className="size-4" />
                ) : (
                  <CalendarPlusIcon className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{leadName}</p>
                <p className="break-words text-muted-foreground">
                  {leadSecondary}
                </p>
                {isRescheduleMode ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Active follow-up found. This will update the current task.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor={`${leadType}FollowUpDueAt`}>
                Due at
              </FieldLabel>
              <DateTimePicker
                id={`${leadType}FollowUpDueAt`}
                value={dueAt}
                onChange={setDueAt}
                minDate={new Date()}
                placeholder="Select due date and time"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${leadType}FollowUpNote`}>
                Follow-up note
              </FieldLabel>
              <Textarea
                id={`${leadType}FollowUpNote`}
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              pending={mutation.isPending}
              pendingLabel={
                isRescheduleMode
                  ? "Rescheduling follow-up"
                  : "Scheduling follow-up"
              }
              disabled={!assigneeUserId || !dueAt || !note.trim()}
            >
              {isRescheduleMode ? <CalendarClockIcon /> : <CalendarPlusIcon />}
              {isRescheduleMode ? "Reschedule Follow-Up" : "Schedule Follow-Up"}
            </SubmitButton>
          </DialogFooter>
        </form>
      )}
    </>
  );
}
