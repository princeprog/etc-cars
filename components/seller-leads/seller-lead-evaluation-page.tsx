"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { CheckCircle2Icon, CircleIcon, InfoIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateSellerLeadEstimatedCostMutation,
  useDeleteSellerLeadEstimatedCostMutation,
} from "@/hooks/mutations/seller-leads/use-seller-lead-estimated-cost-mutations"
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation"
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query"
import { getApiErrorMessage } from "@/types/api"
import {
  SELLER_LEAD_DECISIONS,
  SELLER_LEAD_ESTIMATED_COST_CATEGORIES,
  SELLER_LEAD_INSPECTION_RATINGS,
  SELLER_LEAD_STATUSES,
  type SellerLead,
  type SellerLeadDecision,
  type SellerLeadEstimatedCostCategory,
  type SellerLeadInspectionFindings,
  type SellerLeadInspectionRating,
  type SellerLeadStatus,
  type UpdateSellerLeadPayload,
} from "@/types/seller-leads"
import { formatVehicleMoney } from "../vehicles/vehicles.helpers"

const INSPECTION_KEYS = [
  "engine",
  "transmission",
  "suspension",
  "brakes",
  "tires",
  "exterior",
  "interior",
  "ac",
  "electrical",
  "papers",
] as const

type InspectionKey = (typeof INSPECTION_KEYS)[number]

type OverviewFormValues = {
  sellerName: string
  contactNumber: string
  email: string
  facebookName: string
  inquirySource: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: string
  vehicleVariant: string
  askingPrice: string
  region: string
  notes: string
}

type InspectionFormValues = {
  inspectionCompletedAt: string
  inspectionNotes: string
  inspectionFindings: Record<InspectionKey, { rating: SellerLeadInspectionRating; notes: string }>
}

type CostingFormValues = {
  targetBuyPrice: string
  expectedResalePrice: string
  targetProfitAmount: string
}

type DecisionFormValues = {
  decision: SellerLeadDecision | ""
  decisionNote: string
  status: SellerLeadStatus
}

function getEmptyInspectionFindings(): InspectionFormValues["inspectionFindings"] {
  return {
    engine: { rating: "good", notes: "" },
    transmission: { rating: "good", notes: "" },
    suspension: { rating: "good", notes: "" },
    brakes: { rating: "good", notes: "" },
    tires: { rating: "good", notes: "" },
    exterior: { rating: "good", notes: "" },
    interior: { rating: "good", notes: "" },
    ac: { rating: "good", notes: "" },
    electrical: { rating: "good", notes: "" },
    papers: { rating: "good", notes: "" },
  }
}

function mapInspectionFindings(findings: SellerLeadInspectionFindings | null | undefined) {
  const next = getEmptyInspectionFindings()

  for (const key of INSPECTION_KEYS) {
    const current = findings?.[key]
    if (current) {
      next[key] = {
        rating: current.rating,
        notes: current.notes ?? "",
      }
    }
  }

  return next
}

function getOverviewFormValues(lead: SellerLead): OverviewFormValues {
  return {
    sellerName: lead.sellerName,
    contactNumber: lead.contactNumber,
    email: lead.email ?? "",
    facebookName: lead.facebookName ?? "",
    inquirySource: lead.inquirySource ?? "",
    vehicleBrand: lead.vehicleBrand,
    vehicleModel: lead.vehicleModel,
    vehicleYear: lead.vehicleYear ? String(lead.vehicleYear) : "",
    vehicleVariant: lead.vehicleVariant ?? "",
    askingPrice: lead.askingPrice ?? "",
    region: lead.region ?? "",
    notes: lead.notes ?? "",
  }
}

function getInspectionFormValues(lead: SellerLead): InspectionFormValues {
  return {
    inspectionCompletedAt: lead.inspectionCompletedAt ? lead.inspectionCompletedAt.slice(0, 16) : "",
    inspectionNotes: lead.inspectionNotes ?? "",
    inspectionFindings: mapInspectionFindings(lead.inspectionFindings),
  }
}

function getCostingFormValues(lead: SellerLead): CostingFormValues {
  return {
    targetBuyPrice: lead.targetBuyPrice ?? "",
    expectedResalePrice: lead.expectedResalePrice ?? "",
    targetProfitAmount: lead.targetProfitAmount ?? "",
  }
}

function getDecisionFormValues(lead: SellerLead): DecisionFormValues {
  return {
    decision: lead.decision ?? "",
    decisionNote: lead.decisionNote ?? "",
    status: lead.status,
  }
}

function toInspectionFindingsPayload(values: InspectionFormValues["inspectionFindings"]) {
  return Object.fromEntries(
    INSPECTION_KEYS.map((key) => [
      key,
      {
        rating: values[key].rating,
        notes: values[key].notes.trim() || null,
      },
    ]),
  )
}

function buildOverviewPayload(values: OverviewFormValues): UpdateSellerLeadPayload {
  return {
    sellerName: values.sellerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    vehicleBrand: values.vehicleBrand,
    vehicleModel: values.vehicleModel,
    vehicleYear: values.vehicleYear ? Number(values.vehicleYear) : null,
    vehicleVariant: values.vehicleVariant || null,
    askingPrice: values.askingPrice || null,
    region: values.region || null,
    notes: values.notes || null,
  }
}

function buildInspectionPayload(values: InspectionFormValues): UpdateSellerLeadPayload {
  return {
    inspectionCompletedAt: values.inspectionCompletedAt ? new Date(values.inspectionCompletedAt).toISOString() : null,
    inspectionNotes: values.inspectionNotes || null,
    inspectionFindings: toInspectionFindingsPayload(values.inspectionFindings),
  }
}

function buildCostingPayload(values: CostingFormValues): UpdateSellerLeadPayload {
  return {
    targetBuyPrice: values.targetBuyPrice || null,
    expectedResalePrice: values.expectedResalePrice || null,
    targetProfitAmount: values.targetProfitAmount || null,
  }
}

function buildDecisionPayload(values: DecisionFormValues): UpdateSellerLeadPayload {
  return {
    decision: values.decision || null,
    decisionNote: values.decisionNote || null,
    status: values.status,
  }
}

function formatPercent(value: string | null) {
  return value ? `${value}%` : "—"
}

function formatInspectionLabel(key: InspectionKey) {
  if (key === "ac") return "A/C"
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function getSellerLeadVehicleLabel(lead: SellerLead) {
  return [lead.vehicleBrand, lead.vehicleModel, lead.vehicleYear ? String(lead.vehicleYear) : "", lead.vehicleVariant ?? ""]
    .filter(Boolean)
    .join(" • ")
}

function buildConvertVehicleHref(lead: SellerLead) {
  const params = new URLSearchParams({
    sellerLeadId: lead.id,
    sellerName: lead.sellerName,
    vehicleBrand: lead.vehicleBrand,
    vehicleModel: lead.vehicleModel,
  })

  if (lead.vehicleYear) params.set("vehicleYear", String(lead.vehicleYear))
  if (lead.vehicleVariant) params.set("vehicleVariant", lead.vehicleVariant)
  if (lead.targetBuyPrice ?? lead.askingPrice) {
    params.set("askingPrice", lead.targetBuyPrice ?? lead.askingPrice ?? "")
  }
  if (lead.region) params.set("region", lead.region)
  if (lead.notes) params.set("notes", lead.notes)

  return `/vehicles/new?${params.toString()}`
}

function getStatusBadgeVariant(status: SellerLeadStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Approved to Buy":
    case "Purchased":
      return "secondary"
    case "Rejected":
      return "destructive"
    default:
      return "outline"
  }
}

function getDecisionBadgeVariant(decision: SellerLeadDecision | null): "default" | "secondary" | "outline" | "destructive" {
  switch (decision) {
    case "Buy":
      return "secondary"
    case "Walk Away":
      return "destructive"
    default:
      return "outline"
  }
}

function serialize(value: unknown) {
  return JSON.stringify(value)
}

function OverviewTab({
  values,
  onChange,
  onSave,
  pending,
  dirty,
}: {
  values: OverviewFormValues
  onChange: (values: OverviewFormValues) => void
  onSave: () => Promise<void>
  pending: boolean
  dirty: boolean
}) {
  function updateField<K extends keyof OverviewFormValues>(key: K, value: OverviewFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Lead Overview</CardTitle>
        <CardDescription>Maintain the seller profile and the original vehicle intake details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Seller Details</h3>
            <p className="text-sm text-muted-foreground">Administrative contact details and identity for the lead.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="sellerName">Seller name</FieldLabel>
              <Input id="sellerName" value={values.sellerName} onChange={(e) => updateField("sellerName", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
              <Input id="contactNumber" value={values.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" value={values.email} onChange={(e) => updateField("email", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="facebookName">Facebook name</FieldLabel>
              <Input id="facebookName" value={values.facebookName} onChange={(e) => updateField("facebookName", e.target.value)} />
            </Field>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Vehicle Intake</h3>
            <p className="text-sm text-muted-foreground">Capture exactly what the seller is offering before inspection and negotiation.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="vehicleBrand">Vehicle brand</FieldLabel>
              <Input id="vehicleBrand" value={values.vehicleBrand} onChange={(e) => updateField("vehicleBrand", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="vehicleModel">Vehicle model</FieldLabel>
              <Input id="vehicleModel" value={values.vehicleModel} onChange={(e) => updateField("vehicleModel", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="vehicleYear">Year</FieldLabel>
              <Input id="vehicleYear" type="number" value={values.vehicleYear} onChange={(e) => updateField("vehicleYear", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="vehicleVariant">Variant</FieldLabel>
              <Input id="vehicleVariant" value={values.vehicleVariant} onChange={(e) => updateField("vehicleVariant", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="askingPrice">Seller asking price</FieldLabel>
              <Input id="askingPrice" value={values.askingPrice} onChange={(e) => updateField("askingPrice", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="inquirySource">Inquiry source</FieldLabel>
              <Input id="inquirySource" value={values.inquirySource} onChange={(e) => updateField("inquirySource", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="region">Region</FieldLabel>
              <Input id="region" value={values.region} onChange={(e) => updateField("region", e.target.value)} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="sellerNotes">Seller notes</FieldLabel>
            <Textarea id="sellerNotes" rows={5} value={values.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </Field>
        </section>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {dirty ? "You have unsaved changes in Overview." : "Overview is up to date."}
          </p>
          <SubmitButton type="button" onClick={() => void onSave()} pending={pending} pendingLabel="Saving overview">
            Save Overview
          </SubmitButton>
        </div>
      </CardContent>
    </Card>
  )
}

function InspectionTab({
  values,
  onChange,
  onSave,
  pending,
  dirty,
}: {
  values: InspectionFormValues
  onChange: (values: InspectionFormValues) => void
  onSave: () => Promise<void>
  pending: boolean
  dirty: boolean
}) {
  function updateField<K extends keyof InspectionFormValues>(key: K, value: InspectionFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function updateInspectionField(key: InspectionKey, field: "rating" | "notes", value: string) {
    onChange({
      ...values,
      inspectionFindings: {
        ...values.inspectionFindings,
        [key]: {
          ...values.inspectionFindings[key],
          [field]: value,
        },
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Inspection Report</CardTitle>
        <CardDescription>Document the unit’s actual condition after physical appraisal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inspectionCompletedAt">Inspection completed at</FieldLabel>
            <Input id="inspectionCompletedAt" type="datetime-local" value={values.inspectionCompletedAt} onChange={(e) => updateField("inspectionCompletedAt", e.target.value)} />
          </Field>
          <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Use this tab to capture inspection evidence first. Costing and decision should be based on what’s recorded here.
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="inspectionNotes">Inspection notes</FieldLabel>
          <Textarea id="inspectionNotes" rows={4} value={values.inspectionNotes} onChange={(e) => updateField("inspectionNotes", e.target.value)} />
        </Field>

        <Separator />

        <div className="space-y-4">
          {INSPECTION_KEYS.map((key) => (
            <div key={key} className="grid gap-3 rounded-xl border border-border/70 p-4 md:grid-cols-[180px_180px_minmax(0,1fr)]">
              <div className="text-sm font-medium text-foreground">{formatInspectionLabel(key)}</div>
              <NativeSelect
                value={values.inspectionFindings[key].rating}
                onChange={(event) => updateInspectionField(key, "rating", event.target.value)}
              >
                {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                  <NativeSelectOption key={rating} value={rating}>
                    {rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Input
                value={values.inspectionFindings[key].notes}
                onChange={(event) => updateInspectionField(key, "notes", event.target.value)}
                placeholder="Inspection note"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {dirty ? "You have unsaved changes in Inspection." : "Inspection is up to date."}
          </p>
          <SubmitButton type="button" onClick={() => void onSave()} pending={pending} pendingLabel="Saving inspection">
            Save Inspection
          </SubmitButton>
        </div>
      </CardContent>
    </Card>
  )
}

function EstimatedCostsCard({ leadId, lead }: { leadId: string; lead: SellerLead }) {
  const createMutation = useCreateSellerLeadEstimatedCostMutation()
  const deleteMutation = useDeleteSellerLeadEstimatedCostMutation()
  const [category, setCategory] = React.useState<SellerLeadEstimatedCostCategory>("repair")
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(
      { id: leadId, payload: { category, amount, note } },
      {
        onSuccess: () => {
          setAmount("")
          setNote("")
          toast.success("Estimated cost added")
        },
      },
    )
  }

  async function handleDelete(costId: string) {
    await deleteMutation.mutateAsync(
      { id: leadId, costId },
      {
        onSuccess: () => toast.success("Estimated cost removed"),
      },
    )
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Estimated Costs</CardTitle>
            <CardDescription>Pre-purchase work and acquisition costs recorded during evaluation.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-lg font-semibold tabular-nums">{formatVehicleMoney(lead.estimatedCostsTotal)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <ApiErrorAlert
          title="Unable to update estimated costs"
          message={getApiErrorMessage(createMutation.error ?? deleteMutation.error, "")}
        />

        {lead.estimatedCosts.length > 0 ? (
          <div className="space-y-3">
            {lead.estimatedCosts.map((cost) => (
              <div key={cost.id} className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium capitalize">{cost.category}</span>
                    <span className="text-sm font-semibold tabular-nums">{formatVehicleMoney(cost.amount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{cost.note}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDelete(cost.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No estimated costs recorded yet.
          </div>
        )}

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimatedCostCategory">Category</Label>
              <NativeSelect id="estimatedCostCategory" value={category} onChange={(event) => setCategory(event.target.value as SellerLeadEstimatedCostCategory)}>
                {SELLER_LEAD_ESTIMATED_COST_CATEGORIES.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCostAmount">Amount</Label>
              <Input id="estimatedCostAmount" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedCostNote">Note</Label>
            <Textarea id="estimatedCostNote" value={note} onChange={(event) => setNote(event.target.value)} rows={3} required />
          </div>
          <SubmitButton pending={createMutation.isPending} pendingLabel="Adding estimated cost">
            <PlusIcon />
            Add Estimated Cost
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}

function CostingTab({
  leadId,
  lead,
  values,
  onChange,
  onSave,
  pending,
  dirty,
}: {
  leadId: string
  lead: SellerLead
  values: CostingFormValues
  onChange: (values: CostingFormValues) => void
  onSave: () => Promise<void>
  pending: boolean
  dirty: boolean
}) {
  function updateField<K extends keyof CostingFormValues>(key: K, value: CostingFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Costing & Valuation</CardTitle>
          <CardDescription>Turn the inspection findings into target pricing, resale assumptions, and expected profitability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="targetBuyPrice">Target buy price</FieldLabel>
              <Input id="targetBuyPrice" value={values.targetBuyPrice} onChange={(e) => updateField("targetBuyPrice", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="expectedResalePrice">Expected resale price</FieldLabel>
              <Input id="expectedResalePrice" value={values.expectedResalePrice} onChange={(e) => updateField("expectedResalePrice", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="targetProfitAmount">Target profit amount</FieldLabel>
              <Input id="targetProfitAmount" value={values.targetProfitAmount} onChange={(e) => updateField("targetProfitAmount", e.target.value)} />
            </Field>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Estimated costs</span>
                <span className="font-medium">{formatVehicleMoney(lead.estimatedCostsTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Total investment</span>
                <span className="font-medium">{formatVehicleMoney(lead.estimatedTotalInvestment)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Gross profit</span>
                <span className="font-medium">{formatVehicleMoney(lead.estimatedGrossProfit)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Profit margin</span>
                <span className="font-medium">{formatPercent(lead.estimatedProfitMargin)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {dirty ? "You have unsaved changes in Costing." : "Costing assumptions are up to date."}
            </p>
            <SubmitButton type="button" onClick={() => void onSave()} pending={pending} pendingLabel="Saving costing">
              Save Costing
            </SubmitButton>
          </div>
        </CardContent>
      </Card>

      <EstimatedCostsCard leadId={leadId} lead={lead} />
    </div>
  )
}

function DecisionTab({
  lead,
  values,
  onChange,
  onSave,
  pending,
  dirty,
}: {
  lead: SellerLead
  values: DecisionFormValues
  onChange: (values: DecisionFormValues) => void
  onSave: () => Promise<void>
  pending: boolean
  dirty: boolean
}) {
  function updateField<K extends keyof DecisionFormValues>(key: K, value: DecisionFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Decision & Approval</CardTitle>
        <CardDescription>Finalize the acquisition direction and unlock conversion only when approval is complete.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">System recommendation</p>
              <p>{lead.recommendedAction ?? "No recommendation yet. Complete costing assumptions first."}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="decision">Decision</FieldLabel>
            <NativeSelect id="decision" value={values.decision || "none"} onChange={(event) => updateField("decision", event.target.value === "none" ? "" : (event.target.value as SellerLeadDecision))}>
              <NativeSelectOption value="none">No decision yet</NativeSelectOption>
              {SELLER_LEAD_DECISIONS.map((decision) => (
                <NativeSelectOption key={decision} value={decision}>
                  {decision}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="status">Lead status</FieldLabel>
            <NativeSelect id="status" value={values.status} onChange={(event) => updateField("status", event.target.value as SellerLeadStatus)}>
              {SELLER_LEAD_STATUSES.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {status}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="decisionNote">Decision note</FieldLabel>
          <Textarea id="decisionNote" rows={4} value={values.decisionNote} onChange={(e) => updateField("decisionNote", e.target.value)} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">Approval state</p>
            <p className="mt-1 font-medium text-foreground">{lead.approvedToBuyAt ? "Approved to Buy" : "Not approved"}</p>
            <p className="mt-1 text-muted-foreground">
              {lead.approvedToBuyAt ? format(new Date(lead.approvedToBuyAt), "MMM d, yyyy h:mm a") : "Move the lead to Approved to Buy when management is ready to acquire."}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">Conversion readiness</p>
            <p className="mt-1 font-medium text-foreground">{lead.status === "Approved to Buy" ? "Ready to convert" : "Approval required before conversion"}</p>
            <Button type="button" className="mt-3 w-full" disabled={lead.status !== "Approved to Buy"} asChild>
              <Link href={buildConvertVehicleHref(lead)}>Convert to Vehicle</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {dirty ? "You have unsaved changes in Decision." : "Decision and approval are up to date."}
          </p>
          <SubmitButton type="button" onClick={() => void onSave()} pending={pending} pendingLabel="Saving decision">
            Save Decision
          </SubmitButton>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryRail({ lead }: { lead: SellerLead }) {
  const readinessItems = [
    {
      complete: Boolean(lead.inspectionCompletedAt),
      title: "Inspection recorded",
      description: "Appraisal evidence is documented.",
    },
    {
      complete: Boolean(lead.targetBuyPrice && lead.expectedResalePrice),
      title: "Valuation set",
      description: "Buy and resale assumptions are complete.",
    },
    {
      complete: Boolean(lead.decision),
      title: "Decision selected",
      description: "A clear acquisition direction is on file.",
    },
    {
      complete: lead.status === "Approved to Buy",
      title: "Approved to buy",
      description: "This lead can now convert into inventory.",
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Acquisition Summary</CardTitle>
          <CardDescription>Decision dashboard for this seller lead.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{lead.sellerName}</p>
            <p className="text-sm text-muted-foreground">{getSellerLeadVehicleLabel(lead)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
            <Badge variant={getDecisionBadgeVariant(lead.decision)}>{lead.decision ?? "Pending"}</Badge>
            <Badge variant={lead.approvedToBuyAt ? "secondary" : "outline"}>
              {lead.approvedToBuyAt ? "Approved" : "Not approved"}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Seller asking</span>
              <span className="font-medium">{formatVehicleMoney(lead.askingPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Target buy</span>
              <span className="font-medium">{formatVehicleMoney(lead.targetBuyPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Expected resale</span>
              <span className="font-medium">{formatVehicleMoney(lead.expectedResalePrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Estimated costs</span>
              <span className="font-medium">{formatVehicleMoney(lead.estimatedCostsTotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Total investment</span>
              <span className="font-medium">{formatVehicleMoney(lead.estimatedTotalInvestment)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Profit margin</span>
              <span className="font-medium">{formatPercent(lead.estimatedProfitMargin)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Recommendation</span>
              <span className="font-medium">{lead.recommendedAction ?? "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {readinessItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-muted-foreground">
                  {item.complete ? (
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                  ) : (
                    <CircleIcon className="size-4" />
                  )}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {index < readinessItems.length - 1 ? <Separator /> : null}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function SellerLeadEvaluationPage({ leadId }: { leadId: string }) {
  const leadQuery = useSellerLeadQuery(leadId)
  const updateMutation = useUpdateSellerLeadMutation()
  const lead = leadQuery.data?.sellerLead

  const [activeTab, setActiveTab] = React.useState("overview")
  const [overviewValues, setOverviewValues] = React.useState<OverviewFormValues | null>(null)
  const [inspectionValues, setInspectionValues] = React.useState<InspectionFormValues | null>(null)
  const [costingValues, setCostingValues] = React.useState<CostingFormValues | null>(null)
  const [decisionValues, setDecisionValues] = React.useState<DecisionFormValues | null>(null)

  React.useEffect(() => {
    if (!lead) return

    setOverviewValues(getOverviewFormValues(lead))
    setInspectionValues(getInspectionFormValues(lead))
    setCostingValues(getCostingFormValues(lead))
    setDecisionValues(getDecisionFormValues(lead))
  }, [lead])

  async function saveSection(payload: UpdateSellerLeadPayload, successMessage: string) {
    await updateMutation.mutateAsync(
      { id: leadId, payload },
      {
        onSuccess: () => {
          toast.success(successMessage)
        },
      },
    )
  }

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell
        title="Seller Lead Evaluation"
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: "Evaluation" },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <ModuleLoadingState label="Loading seller lead evaluation" />
        </div>
      </AuthenticatedAppShell>
    )
  }

  if (leadQuery.error) {
    return (
      <AuthenticatedAppShell
        title="Seller Lead Evaluation"
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: "Evaluation" },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <ApiErrorAlert title="Unable to load seller lead" message={getApiErrorMessage(leadQuery.error, "")} />
        </div>
      </AuthenticatedAppShell>
    )
  }

  if (!lead || !overviewValues || !inspectionValues || !costingValues || !decisionValues) {
    return (
      <AuthenticatedAppShell
        title="Seller Lead Evaluation"
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: "Evaluation" },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <EmptyState title="Seller lead not found" description="The requested seller lead could not be loaded." />
        </div>
      </AuthenticatedAppShell>
    )
  }

  const overviewDirty = serialize(buildOverviewPayload(overviewValues)) !== serialize(buildOverviewPayload(getOverviewFormValues(lead)))
  const inspectionDirty =
    serialize(buildInspectionPayload(inspectionValues)) !== serialize(buildInspectionPayload(getInspectionFormValues(lead)))
  const costingDirty = serialize(buildCostingPayload(costingValues)) !== serialize(buildCostingPayload(getCostingFormValues(lead)))
  const decisionDirty =
    serialize(buildDecisionPayload(decisionValues)) !== serialize(buildDecisionPayload(getDecisionFormValues(lead)))

  return (
    <AuthenticatedAppShell
      title="Seller Lead Evaluation"
      breadcrumbs={[
        { label: "Seller Leads", href: "/seller-leads" },
        { label: "Evaluation" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Seller Lead Evaluation</p>
                <h2 className="text-2xl font-semibold tracking-tight">{lead.sellerName}</h2>
                <p className="text-sm text-muted-foreground">{getSellerLeadVehicleLabel(lead)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                <Badge variant={getDecisionBadgeVariant(lead.decision)}>{lead.decision ?? "Pending"}</Badge>
                <Badge variant={lead.approvedToBuyAt ? "secondary" : "outline"}>
                  {lead.approvedToBuyAt ? "Approved" : "Not approved"}
                </Badge>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Seller Asking</p>
                <p className="mt-1 text-lg font-semibold">{formatVehicleMoney(lead.askingPrice)}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Investment</p>
                <p className="mt-1 text-lg font-semibold">{formatVehicleMoney(lead.estimatedTotalInvestment)}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expected Margin</p>
                <p className="mt-1 text-lg font-semibold">{formatPercent(lead.estimatedProfitMargin)}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommendation</p>
                <p className="mt-1 text-lg font-semibold">{lead.recommendedAction ?? "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-xl border border-border/70 bg-background p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
              <TabsTrigger value="costing">Costing</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                values={overviewValues}
                onChange={setOverviewValues}
                onSave={() => saveSection(buildOverviewPayload(overviewValues), "Overview updated")}
                pending={updateMutation.isPending}
                dirty={overviewDirty}
              />
            </TabsContent>

            <TabsContent value="inspection">
              <InspectionTab
                values={inspectionValues}
                onChange={setInspectionValues}
                onSave={() => saveSection(buildInspectionPayload(inspectionValues), "Inspection updated")}
                pending={updateMutation.isPending}
                dirty={inspectionDirty}
              />
            </TabsContent>

            <TabsContent value="costing">
              <CostingTab
                leadId={leadId}
                lead={lead}
                values={costingValues}
                onChange={setCostingValues}
                onSave={() => saveSection(buildCostingPayload(costingValues), "Costing updated")}
                pending={updateMutation.isPending}
                dirty={costingDirty}
              />
            </TabsContent>

            <TabsContent value="decision">
              <DecisionTab
                lead={lead}
                values={decisionValues}
                onChange={setDecisionValues}
                onSave={() => saveSection(buildDecisionPayload(decisionValues), "Decision updated")}
                pending={updateMutation.isPending}
                dirty={decisionDirty}
              />
            </TabsContent>
          </Tabs>

          <SummaryRail lead={lead} />
        </div>
      </div>
    </AuthenticatedAppShell>
  )
}
