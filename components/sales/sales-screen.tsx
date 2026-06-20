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
import { useCreateSaleMutation } from "@/hooks/mutations/sales/use-create-sale-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useSalesQuery } from "@/hooks/queries/sales/use-sales-query"
import { getApiErrorMessage } from "@/types/api"

export function SalesScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const buyerLeadsQuery = useBuyerLeadsQuery()
  const salesQuery = useSalesQuery()
  const createMutation = useCreateSaleMutation()
  const [form, setForm] = React.useState({
    buyerLeadId: "",
    vehicleId: "",
    saleDate: "",
    finalSaleAmount: "",
    agentName: "",
    commissionOverrideAmount: "",
    commissionOverrideReason: "",
    buyerClosingNote: "",
  })

  const selectedBuyerLead = buyerLeadsQuery.data?.buyerLeads.find((lead) => lead.id === form.buyerLeadId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMutation.mutateAsync(
      {
        buyerLeadId: form.buyerLeadId,
        vehicleId: form.vehicleId,
        saleDate: new Date(form.saleDate).toISOString(),
        finalSaleAmount: form.finalSaleAmount,
        agentName: form.agentName || authQuery.data?.user.fullName || null,
        commissionOverrideAmount: form.commissionOverrideAmount || null,
        commissionOverrideReason: form.commissionOverrideReason || null,
        buyerClosingNote: form.buyerClosingNote || null,
      },
      {
        onSuccess: () => {
          toast.success("Sale finalized")
          setForm((current) => ({
            ...current,
            buyerLeadId: "",
            vehicleId: "",
            saleDate: "",
            finalSaleAmount: "",
            commissionOverrideAmount: "",
            commissionOverrideReason: "",
            buyerClosingNote: "",
          }))
        },
      },
    )
  }

  return (
    <AuthenticatedAppShell title="Sales">
      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Finalize Sale</CardTitle>
            <CardDescription>Use a buyer lead that is already linked to a vehicle. Dashboard metrics refresh after a successful close.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <ApiErrorAlert title="Unable to finalize sale" message={getApiErrorMessage(createMutation.error, "")} />
                <Field><FieldLabel htmlFor="buyerLeadId">Buyer lead</FieldLabel><Select value={form.buyerLeadId} onValueChange={(value) => setForm((current) => ({ ...current, buyerLeadId: value, vehicleId: "" }))}><SelectTrigger id="buyerLeadId"><SelectValue placeholder="Select buyer lead" /></SelectTrigger><SelectContent>{buyerLeadsQuery.data?.buyerLeads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.buyerName} • {lead.status}</SelectItem>)}</SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="vehicleId">Linked vehicle</FieldLabel><Select value={form.vehicleId} onValueChange={(value) => setForm((current) => ({ ...current, vehicleId: value }))}><SelectTrigger id="vehicleId"><SelectValue placeholder="Select linked vehicle" /></SelectTrigger><SelectContent>{selectedBuyerLead?.vehicles.map((vehicle) => <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.stockNumber} • {vehicle.brand} {vehicle.model}</SelectItem>)}</SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="saleDate">Sale date</FieldLabel><Input id="saleDate" type="datetime-local" value={form.saleDate} onChange={(e) => setForm((current) => ({ ...current, saleDate: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="finalSaleAmount">Final sale amount</FieldLabel><Input id="finalSaleAmount" value={form.finalSaleAmount} onChange={(e) => setForm((current) => ({ ...current, finalSaleAmount: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="agentName">Agent name</FieldLabel><Input id="agentName" value={form.agentName} placeholder={authQuery.data?.user.fullName ?? "Assigned agent"} onChange={(e) => setForm((current) => ({ ...current, agentName: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="commissionOverrideAmount">Commission override amount</FieldLabel><Input id="commissionOverrideAmount" value={form.commissionOverrideAmount} onChange={(e) => setForm((current) => ({ ...current, commissionOverrideAmount: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="commissionOverrideReason">Commission override reason</FieldLabel><Input id="commissionOverrideReason" value={form.commissionOverrideReason} onChange={(e) => setForm((current) => ({ ...current, commissionOverrideReason: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="buyerClosingNote">Buyer closing note</FieldLabel><Input id="buyerClosingNote" value={form.buyerClosingNote} onChange={(e) => setForm((current) => ({ ...current, buyerClosingNote: e.target.value }))} /></Field>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Finalizing sale" className="w-full">Finalize sale</SubmitButton>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Finalized sales and the commission values recorded with them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesQuery.isPending ? (
              <ModuleLoadingState label="Loading sales" />
            ) : salesQuery.data?.sales.length ? (
              salesQuery.data.sales.map((sale) => (
                <div key={sale.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{sale.vehicle.stockNumber} • {sale.vehicle.brand} {sale.vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">Sale amount {sale.finalSaleAmount} • Gross profit {sale.grossProfitAmount ?? "N/A"}</p>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs">Commission {sale.commission.finalAmount}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No sales yet" description="Finalize the first sale to validate the full inventory-to-dashboard workflow." />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
