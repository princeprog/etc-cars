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
import { useCreateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-create-seller-lead-mutation"
import { useConvertSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-convert-seller-lead-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import { SELLER_LEAD_STATUSES, type SellerLeadStatus } from "@/types/seller-leads"
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicles"

function parsePhotoLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((fileUrl, index) => ({ fileUrl, sortOrder: index }))
}

export function SellerLeadsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const sellerLeadsQuery = useSellerLeadsQuery()
  const createMutation = useCreateSellerLeadMutation()
  const convertMutation = useConvertSellerLeadMutation()
  const [activeConvertLeadId, setActiveConvertLeadId] = React.useState<string | null>(null)

  const [form, setForm] = React.useState({
    sellerName: "",
    contactNumber: "",
    email: "",
    facebookName: "",
    inquirySource: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleVariant: "",
    askingPrice: "",
    region: "",
    notes: "",
    status: "New Inquiry" as SellerLeadStatus,
  })

  const [convertForm, setConvertForm] = React.useState({
    stockNumber: "",
    year: "",
    variant: "",
    purchasePrice: "",
    targetSellingPrice: "",
    minimumAcceptablePrice: "",
    status: "Incoming" as VehicleStatus,
    photoUrls: "",
  })

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMutation.mutateAsync(
      {
        sellerName: form.sellerName,
        contactNumber: form.contactNumber,
        email: form.email || null,
        facebookName: form.facebookName || null,
        inquirySource: form.inquirySource || null,
        vehicleBrand: form.vehicleBrand,
        vehicleModel: form.vehicleModel,
        vehicleYear: form.vehicleYear ? Number(form.vehicleYear) : null,
        vehicleVariant: form.vehicleVariant || null,
        askingPrice: form.askingPrice || null,
        region: form.region || null,
        notes: form.notes || null,
        status: form.status,
        assigneeUserId: authQuery.data?.user.id ?? null,
      },
      {
        onSuccess: () => {
          toast.success("Seller lead created")
          setForm({
            sellerName: "",
            contactNumber: "",
            email: "",
            facebookName: "",
            inquirySource: "",
            vehicleBrand: "",
            vehicleModel: "",
            vehicleYear: "",
            vehicleVariant: "",
            askingPrice: "",
            region: "",
            notes: "",
            status: "New Inquiry",
          })
        },
      },
    )
  }

  async function handleConvertSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeConvertLeadId) return

    await convertMutation.mutateAsync(
      {
        id: activeConvertLeadId,
        payload: {
          stockNumber: convertForm.stockNumber,
          year: convertForm.year ? Number(convertForm.year) : undefined,
          variant: convertForm.variant || null,
          purchasePrice: convertForm.purchasePrice || null,
          targetSellingPrice: convertForm.targetSellingPrice || null,
          minimumAcceptablePrice: convertForm.minimumAcceptablePrice || null,
          status: convertForm.status,
          photos: parsePhotoLines(convertForm.photoUrls),
        },
      },
      {
        onSuccess: () => {
          toast.success("Seller lead converted to inventory")
          setActiveConvertLeadId(null)
          setConvertForm({
            stockNumber: "",
            year: "",
            variant: "",
            purchasePrice: "",
            targetSellingPrice: "",
            minimumAcceptablePrice: "",
            status: "Incoming",
            photoUrls: "",
          })
        },
      },
    )
  }

  return (
    <AuthenticatedAppShell title="Seller Leads">
      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create Seller Lead</CardTitle>
            <CardDescription>Capture acquisition inquiries and assign them to yourself by default.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit}>
              <FieldGroup className="gap-4">
                <ApiErrorAlert title="Unable to create seller lead" message={getApiErrorMessage(createMutation.error, "")} />
                <Field><FieldLabel htmlFor="sellerName">Seller name</FieldLabel><Input id="sellerName" value={form.sellerName} onChange={(e) => setForm((v) => ({ ...v, sellerName: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="contactNumber">Contact number</FieldLabel><Input id="contactNumber" value={form.contactNumber} onChange={(e) => setForm((v) => ({ ...v, contactNumber: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="vehicleBrand">Vehicle brand</FieldLabel><Input id="vehicleBrand" value={form.vehicleBrand} onChange={(e) => setForm((v) => ({ ...v, vehicleBrand: e.target.value }))} required /></Field>
                <Field><FieldLabel htmlFor="vehicleModel">Vehicle model</FieldLabel><Input id="vehicleModel" value={form.vehicleModel} onChange={(e) => setForm((v) => ({ ...v, vehicleModel: e.target.value }))} required /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field><FieldLabel htmlFor="vehicleYear">Year</FieldLabel><Input id="vehicleYear" type="number" value={form.vehicleYear} onChange={(e) => setForm((v) => ({ ...v, vehicleYear: e.target.value }))} /></Field>
                  <Field><FieldLabel htmlFor="askingPrice">Asking price</FieldLabel><Input id="askingPrice" value={form.askingPrice} onChange={(e) => setForm((v) => ({ ...v, askingPrice: e.target.value }))} /></Field>
                </div>
                <Field><FieldLabel htmlFor="status">Status</FieldLabel><Select value={form.status} onValueChange={(value) => setForm((v) => ({ ...v, status: value as SellerLeadStatus }))}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent>{SELLER_LEAD_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
                <Field><FieldLabel htmlFor="notes">Notes</FieldLabel><Textarea id="notes" value={form.notes} onChange={(e) => setForm((v) => ({ ...v, notes: e.target.value }))} rows={4} /></Field>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating lead" className="w-full">Create seller lead</SubmitButton>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acquisition Queue</CardTitle>
            <CardDescription>Convert purchased opportunities into inventory directly from the queue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sellerLeadsQuery.isPending ? (
              <ModuleLoadingState label="Loading seller leads" />
            ) : sellerLeadsQuery.data?.sellerLeads.length ? (
              sellerLeadsQuery.data.sellerLeads.map((lead) => (
                <div key={lead.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{lead.sellerName}</p>
                      <p className="text-sm text-muted-foreground">{lead.vehicleBrand} {lead.vehicleModel}{lead.vehicleYear ? ` • ${lead.vehicleYear}` : ""}</p>
                      <p className="text-sm text-muted-foreground">{lead.contactNumber}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-muted px-2 py-1">{lead.status}</span>
                      {lead.askingPrice ? <span className="rounded-md bg-muted px-2 py-1">Asking {lead.askingPrice}</span> : null}
                    </div>
                  </div>
                  {lead.notes ? <p className="mt-3 text-sm text-muted-foreground">{lead.notes}</p> : null}
                  {lead.status !== "Purchased" && lead.status !== "Rejected" ? (
                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => setActiveConvertLeadId((current) => current === lead.id ? null : lead.id)}
                        className="text-sm font-medium text-primary"
                      >
                        {activeConvertLeadId === lead.id ? "Hide conversion form" : "Convert to vehicle"}
                      </button>
                      {activeConvertLeadId === lead.id ? (
                        <form onSubmit={handleConvertSubmit} className="rounded-md border bg-muted/30 p-4">
                          <FieldGroup className="gap-4">
                            <ApiErrorAlert title="Unable to convert seller lead" message={getApiErrorMessage(convertMutation.error, "")} />
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field><FieldLabel htmlFor="stockNumber">Stock number</FieldLabel><Input id="stockNumber" value={convertForm.stockNumber} onChange={(e) => setConvertForm((v) => ({ ...v, stockNumber: e.target.value }))} required /></Field>
                              <Field><FieldLabel htmlFor="convertYear">Vehicle year</FieldLabel><Input id="convertYear" type="number" value={convertForm.year} onChange={(e) => setConvertForm((v) => ({ ...v, year: e.target.value }))} /></Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field><FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel><Input id="purchasePrice" value={convertForm.purchasePrice} onChange={(e) => setConvertForm((v) => ({ ...v, purchasePrice: e.target.value }))} /></Field>
                              <Field><FieldLabel htmlFor="targetSellingPrice">Target selling price</FieldLabel><Input id="targetSellingPrice" value={convertForm.targetSellingPrice} onChange={(e) => setConvertForm((v) => ({ ...v, targetSellingPrice: e.target.value }))} /></Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field><FieldLabel htmlFor="minimumAcceptablePrice">Minimum acceptable price</FieldLabel><Input id="minimumAcceptablePrice" value={convertForm.minimumAcceptablePrice} onChange={(e) => setConvertForm((v) => ({ ...v, minimumAcceptablePrice: e.target.value }))} /></Field>
                              <Field><FieldLabel htmlFor="convertStatus">Vehicle status</FieldLabel><Select value={convertForm.status} onValueChange={(value) => setConvertForm((v) => ({ ...v, status: value as VehicleStatus }))}><SelectTrigger id="convertStatus"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_STATUSES.filter((status) => status !== "Sold").map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
                            </div>
                            <Field><FieldLabel htmlFor="photoUrls">Photo URLs</FieldLabel><Textarea id="photoUrls" value={convertForm.photoUrls} onChange={(e) => setConvertForm((v) => ({ ...v, photoUrls: e.target.value }))} rows={3} placeholder="One URL per line" /></Field>
                            <SubmitButton type="submit" pending={convertMutation.isPending} pendingLabel="Converting lead">Convert to vehicle</SubmitButton>
                          </FieldGroup>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState title="No seller leads yet" description="Create the first seller lead from the form to start the acquisition workflow." />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
