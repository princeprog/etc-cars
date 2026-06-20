"use client"

import * as React from "react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCompleteFollowUpMutation } from "@/hooks/mutations/follow-ups/use-complete-follow-up-mutation"
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useFollowUpsQuery } from "@/hooks/queries/follow-ups/use-follow-ups-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import { type LeadType } from "@/types/follow-ups"

export function FollowUpsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const followUpsQuery = useFollowUpsQuery()
  const sellerLeadsQuery = useSellerLeadsQuery()
  const buyerLeadsQuery = useBuyerLeadsQuery()
  const createMutation = useCreateFollowUpMutation()
  const completeMutation = useCompleteFollowUpMutation()
  const [outcomeNotes, setOutcomeNotes] = React.useState<Record<string, string>>({})

  const [form, setForm] = React.useState({
    leadType: "seller" as LeadType,
    leadId: "",
    dueAt: "",
    note: "",
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMutation.mutateAsync(
      {
        leadType: form.leadType,
        sellerLeadId: form.leadType === "seller" ? form.leadId : undefined,
        buyerLeadId: form.leadType === "buyer" ? form.leadId : undefined,
        assigneeUserId: authQuery.data?.user.id ?? "",
        dueAt: new Date(form.dueAt).toISOString(),
        note: form.note,
      },
      {
        onSuccess: () => {
          toast.success("Follow-up created")
          setForm({
            leadType: "seller",
            leadId: "",
            dueAt: "",
            note: "",
          })
        },
      },
    )
  }

  const leadOptions = form.leadType === "seller"
    ? sellerLeadsQuery.data?.sellerLeads.map((lead) => ({ id: lead.id, label: `${lead.sellerName} • ${lead.vehicleBrand} ${lead.vehicleModel}` })) ?? []
    : buyerLeadsQuery.data?.buyerLeads.map((lead) => ({ id: lead.id, label: `${lead.buyerName} • ${lead.contactNumber}` })) ?? []

  const overdue = followUpsQuery.data?.followUps.filter((followUp) => followUp.status === "Overdue") ?? []
  const due = followUpsQuery.data?.followUps.filter((followUp) => followUp.status === "Due") ?? []
  const completed = followUpsQuery.data?.followUps.filter((followUp) => followUp.status === "Completed") ?? []

  return (
    <AuthenticatedAppShell title="Follow-Ups">
      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create Follow-Up</CardTitle>
            <CardDescription>Schedule due work against either seller or buyer leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <ApiErrorAlert title="Unable to create follow-up" message={getApiErrorMessage(createMutation.error, "")} />
                <Field><FieldLabel htmlFor="leadType">Lead type</FieldLabel><Select value={form.leadType} onValueChange={(value) => setForm((v) => ({ ...v, leadType: value as LeadType, leadId: "" }))}><SelectTrigger id="leadType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seller">Seller lead</SelectItem><SelectItem value="buyer">Buyer lead</SelectItem></SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="leadId">Lead</FieldLabel><Select value={form.leadId} onValueChange={(value) => setForm((v) => ({ ...v, leadId: value }))}><SelectTrigger id="leadId"><SelectValue placeholder="Select a lead" /></SelectTrigger><SelectContent>{leadOptions.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.label}</SelectItem>)}</SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="dueAt">Due at</FieldLabel><Input id="dueAt" type="datetime-local" value={form.dueAt} onChange={(e) => setForm((v) => ({ ...v, dueAt: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="note">Note</FieldLabel><Textarea id="note" value={form.note} onChange={(e) => setForm((v) => ({ ...v, note: e.target.value }))} rows={4} required /></Field>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating follow-up" className="w-full">Create follow-up</SubmitButton>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <ApiErrorAlert title="Follow-up action failed" message={getApiErrorMessage(completeMutation.error, "")} />
          {followUpsQuery.isPending ? (
            <ModuleLoadingState label="Loading follow-ups" />
          ) : (
            <>
              {[
                { title: "Overdue", description: "Past due and incomplete.", items: overdue },
                { title: "Due", description: "Current open follow-ups.", items: due },
                { title: "Completed", description: "Finished follow-up work.", items: completed },
              ].map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.items.length ? section.items.map((followUp) => (
                      <div key={followUp.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{followUp.note}</p>
                            <p className="text-sm text-muted-foreground">{followUp.leadType} lead • due {new Date(followUp.dueAt).toLocaleString()}</p>
                          </div>
                          <span className="rounded-md bg-muted px-2 py-1 text-xs">{followUp.status}</span>
                        </div>
                        {followUp.status !== "Completed" ? (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              rows={3}
                              placeholder="Outcome note"
                              value={outcomeNotes[followUp.id] ?? ""}
                              onChange={(e) => setOutcomeNotes((current) => ({ ...current, [followUp.id]: e.target.value }))}
                            />
                            <SubmitButton
                              type="button"
                              pending={completeMutation.isPending}
                              pendingLabel="Completing"
                              onClick={() =>
                                completeMutation.mutate(
                                  {
                                    id: followUp.id,
                                    payload: {
                                      outcomeNote: outcomeNotes[followUp.id] ?? "",
                                    },
                                  },
                                  {
                                    onSuccess: () => {
                                      toast.success("Follow-up completed")
                                      setOutcomeNotes((current) => ({ ...current, [followUp.id]: "" }))
                                    },
                                  },
                                )
                              }
                            >
                              Complete follow-up
                            </SubmitButton>
                          </div>
                        ) : followUp.outcomeNote ? (
                          <p className="mt-3 text-sm text-muted-foreground">{followUp.outcomeNote}</p>
                        ) : null}
                      </div>
                    )) : (
                      <EmptyState title={`No ${section.title.toLowerCase()} follow-ups`} description="This queue is currently clear." />
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </AuthenticatedAppShell>
  )
}
