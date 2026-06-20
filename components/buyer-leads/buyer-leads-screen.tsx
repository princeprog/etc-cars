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
import { useCreateBuyerLeadMutation } from "@/hooks/mutations/buyer-leads/use-create-buyer-lead-mutation"
import { useLinkBuyerLeadVehicleMutation, useUnlinkBuyerLeadVehicleMutation } from "@/hooks/mutations/buyer-leads/use-link-buyer-lead-vehicle-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { getApiErrorMessage } from "@/types/api"
import { BUYER_LEAD_STATUSES, type BuyerLeadStatus } from "@/types/buyer-leads"

export function BuyerLeadsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const buyerLeadsQuery = useBuyerLeadsQuery()
  const vehiclesQuery = useVehiclesQuery()
  const createMutation = useCreateBuyerLeadMutation()
  const linkMutation = useLinkBuyerLeadVehicleMutation()
  const unlinkMutation = useUnlinkBuyerLeadVehicleMutation()
  const [linkSelections, setLinkSelections] = React.useState<Record<string, string>>({})

  const [form, setForm] = React.useState({
    buyerName: "",
    contactNumber: "",
    email: "",
    inquirySource: "",
    desiredBudget: "",
    notes: "",
    status: "New Inquiry" as BuyerLeadStatus,
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMutation.mutateAsync(
      {
        buyerName: form.buyerName,
        contactNumber: form.contactNumber,
        email: form.email || null,
        inquirySource: form.inquirySource || null,
        desiredBudget: form.desiredBudget || null,
        notes: form.notes || null,
        status: form.status,
        assigneeUserId: authQuery.data?.user.id ?? null,
      },
      {
        onSuccess: () => {
          toast.success("Buyer lead created")
          setForm({
            buyerName: "",
            contactNumber: "",
            email: "",
            inquirySource: "",
            desiredBudget: "",
            notes: "",
            status: "New Inquiry",
          })
        },
      },
    )
  }

  const availableVehicles = vehiclesQuery.data?.vehicles.filter((vehicle) => vehicle.status !== "Sold") ?? []

  return (
    <AuthenticatedAppShell title="Buyer Leads">
      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create Buyer Lead</CardTitle>
            <CardDescription>Capture buyer demand and assign ownership to the signed-in user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <ApiErrorAlert title="Unable to create buyer lead" message={getApiErrorMessage(createMutation.error, "")} />
                <Field><FieldLabel htmlFor="buyerName">Buyer name</FieldLabel><Input id="buyerName" value={form.buyerName} onChange={(e) => setForm((v) => ({ ...v, buyerName: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="contactNumber">Contact number</FieldLabel><Input id="contactNumber" value={form.contactNumber} onChange={(e) => setForm((v) => ({ ...v, contactNumber: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="desiredBudget">Desired budget</FieldLabel><Input id="desiredBudget" value={form.desiredBudget} onChange={(e) => setForm((v) => ({ ...v, desiredBudget: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="status">Status</FieldLabel><Select value={form.status} onValueChange={(value) => setForm((v) => ({ ...v, status: value as BuyerLeadStatus }))}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent>{BUYER_LEAD_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="notes">Notes</FieldLabel><Textarea id="notes" value={form.notes} onChange={(e) => setForm((v) => ({ ...v, notes: e.target.value }))} rows={4} /></Field>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating buyer lead" className="w-full">Create buyer lead</SubmitButton>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buyer Pipeline</CardTitle>
            <CardDescription>Link candidate vehicles so sales can be finalized from the UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiErrorAlert title="Buyer lead action failed" message={getApiErrorMessage(linkMutation.error ?? unlinkMutation.error, "")} />
            {buyerLeadsQuery.isPending ? (
              <ModuleLoadingState label="Loading buyer leads" />
            ) : buyerLeadsQuery.data?.buyerLeads.length ? (
              buyerLeadsQuery.data.buyerLeads.map((lead) => {
                const linkedIds = new Set(lead.vehicles.map((vehicle) => vehicle.id))
                const candidateVehicles = availableVehicles.filter((vehicle) => !linkedIds.has(vehicle.id))

                return (
                  <div key={lead.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium">{lead.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{lead.contactNumber}</p>
                      </div>
                      <span className="w-fit rounded-md bg-muted px-2 py-1 text-xs">{lead.status}</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium">Linked vehicles</p>
                      {lead.vehicles.length ? (
                        lead.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                            <span>{vehicle.stockNumber} • {vehicle.brand} {vehicle.model} • {vehicle.status}</span>
                            <button
                              type="button"
                              className="text-primary"
                              onClick={() =>
                                unlinkMutation.mutate(
                                  { id: lead.id, vehicleId: vehicle.id },
                                  { onSuccess: () => toast.success("Vehicle unlinked") },
                                )
                              }
                            >
                              Unlink
                            </button>
                          </div>
                        ))
                      ) : (
                        <EmptyState title="No vehicles linked" description="Link at least one vehicle before finalizing a sale for this buyer." />
                      )}

                      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <Select
                          value={linkSelections[lead.id] ?? ""}
                          onValueChange={(value) => setLinkSelections((current) => ({ ...current, [lead.id]: value }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Select a vehicle to link" /></SelectTrigger>
                          <SelectContent>
                            {candidateVehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.stockNumber} • {vehicle.brand} {vehicle.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <SubmitButton
                          type="button"
                          pending={linkMutation.isPending}
                          pendingLabel="Linking"
                          onClick={() => {
                            const vehicleId = linkSelections[lead.id]
                            if (!vehicleId) return
                            linkMutation.mutate(
                              { id: lead.id, vehicleId },
                              {
                                onSuccess: () => {
                                  toast.success("Vehicle linked to buyer lead")
                                  setLinkSelections((current) => ({ ...current, [lead.id]: "" }))
                                },
                              },
                            )
                          }}
                        >
                          Link vehicle
                        </SubmitButton>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <EmptyState title="No buyer leads yet" description="Create the first buyer lead to start matching demand with inventory." />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
