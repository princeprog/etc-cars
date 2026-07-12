"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleIcon,
  FileTextIcon,
  GaugeIcon,
  InfoIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  SparklesIcon,
  UserRoundIcon,
  WrenchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation"
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query"
import { getApiErrorMessage } from "@/types/api"
import {
  SELLER_LEAD_DECISIONS,
  SELLER_LEAD_INSPECTION_RATINGS,
  SELLER_LEAD_STATUSES,
  type SellerLead,
  type SellerLeadDecision,
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

function getInspectionRatingColor(rating: SellerLeadInspectionRating) {
  switch (rating) {
    case "excellent":
      return "bg-emerald-500"
    case "good":
      return "bg-blue-500"
    case "fair":
      return "bg-amber-500"
    case "poor":
      return "bg-rose-500"
    default:
      return "bg-muted"
  }
}

function getInspectionScore(findings: InspectionFormValues["inspectionFindings"]) {
  const weights: Record<SellerLeadInspectionRating, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  }

  const total = INSPECTION_KEYS.reduce(
    (sum, key) => sum + weights[findings[key].rating],
    0,
  )

  return Math.round((total / (INSPECTION_KEYS.length * 4)) * 100)
}

function getInspectionBreakdown(findings: InspectionFormValues["inspectionFindings"]) {
  const poor = INSPECTION_KEYS.filter((key) => findings[key].rating === "poor")
  const fair = INSPECTION_KEYS.filter((key) => findings[key].rating === "fair")
  const strong = INSPECTION_KEYS.filter((key) =>
    ["excellent", "good"].includes(findings[key].rating),
  )

  return { poor, fair, strong }
}

function getInspectionReadiness(findings: InspectionFormValues["inspectionFindings"]) {
  const { poor, fair } = getInspectionBreakdown(findings)

  if (poor.length > 0) {
    return {
      label: "Needs attention",
      description: "Critical issues found. Review before costing.",
      progress: 38,
    }
  }

  if (fair.length >= 3) {
    return {
      label: "Proceed with caution",
      description: "Vehicle is costable but needs realistic repair allowance.",
      progress: 68,
    }
  }

  return {
    label: "Ready for costing",
    description: "Condition profile is stable enough to move into valuation.",
    progress: 84,
  }
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

  const score = getInspectionScore(values.inspectionFindings)
  const breakdown = getInspectionBreakdown(values.inspectionFindings)
  const readiness = getInspectionReadiness(values.inspectionFindings)
  const fairCount = breakdown.fair.length
  const poorCount = breakdown.poor.length
  const strongCount = breakdown.strong.length

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Vehicle Condition Checklist</CardTitle>
              <CardDescription>Rate each component and leave short professional notes for costing and negotiation.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                <div key={rating} className="flex items-center gap-2 rounded-full border px-3 py-1">
                  <span className={`size-2 rounded-full ${getInspectionRatingColor(rating)}`} />
                  <span className="capitalize">{rating}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {INSPECTION_KEYS.map((key) => (
              <Card key={key} className="border-border/70 shadow-none">
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{formatInspectionLabel(key)}</p>
                      <p className="text-xs text-muted-foreground">Condition rating and inspection remark</p>
                    </div>
                    <span className={`mt-1 size-2.5 rounded-full ${getInspectionRatingColor(values.inspectionFindings[key].rating)}`} />
                  </div>

                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    spacing={0}
                    value={values.inspectionFindings[key].rating}
                    onValueChange={(value) => {
                      if (value) {
                        updateInspectionField(key, "rating", value)
                      }
                    }}
                    className="w-full"
                  >
                    {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                      <ToggleGroupItem
                        key={rating}
                        value={rating}
                        className="flex-1 capitalize"
                        aria-label={`${formatInspectionLabel(key)} ${rating}`}
                      >
                        {rating.charAt(0).toUpperCase()}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  <Input
                    value={values.inspectionFindings[key].notes}
                    onChange={(event) => updateInspectionField(key, "notes", event.target.value)}
                    placeholder="Add inspection note"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Detailed Findings</CardTitle>
          <CardDescription>Summarized insights based on the condition checklist recorded above.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="mt-0.5 size-4 text-rose-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Major Defects Found</p>
                {poorCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.poor.map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">{formatInspectionLabel(key)}:</span>{" "}
                        {values.inspectionFindings[key].notes || "Requires immediate review."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No major defects recorded during inspection.</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <WrenchIcon className="mt-0.5 size-4 text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Immediate Repair Needs</p>
                {fairCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.fair.map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">{formatInspectionLabel(key)}:</span>{" "}
                        {values.inspectionFindings[key].notes || "Allocate repair allowance during costing."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No moderate issues flagged for immediate costing attention.</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <SparklesIcon className="mt-0.5 size-4 text-emerald-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Strong Condition Areas</p>
                {strongCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.strong.slice(0, 5).map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">{formatInspectionLabel(key)}:</span>{" "}
                        {values.inspectionFindings[key].notes || "Condition supports a positive buy case."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No strong-condition highlights recorded yet.</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <MessageSquareTextIcon className="mt-0.5 size-4 text-blue-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Recommended Next Steps</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Proceed to costing using the recorded inspection notes and ratings.</li>
                  <li>Use fair and poor components as the basis for repair and reconditioning assumptions.</li>
                  <li>Finalize acquisition decision only after estimated costs align with target margin.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Visual Inspection Summary</CardTitle>
          <CardDescription>A quick operational view of condition quality and readiness for costing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Inspection Score</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-foreground">{score}</span>
                <span className="pb-1 text-sm text-muted-foreground">/100</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{score >= 75 ? "Good condition" : score >= 55 ? "Mixed condition" : "High review required"}</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Poor Components</p>
              <p className="mt-3 text-4xl font-semibold text-rose-500">{poorCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Out of {INSPECTION_KEYS.length} inspected areas</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fair Components</p>
              <p className="mt-3 text-4xl font-semibold text-amber-500">{fairCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Items likely to affect reconditioning budget</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Readiness</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{readiness.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{readiness.description}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Inspection Readiness</p>
                <span className="text-sm font-medium text-muted-foreground">{readiness.progress}%</span>
              </div>
              <Progress value={readiness.progress} />
            </div>
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangleIcon className="text-amber-500" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                {poorCount > 0
                  ? "Critical issues were recorded. Review the inspection before moving to decision."
                  : fairCount > 0
                    ? "No critical issues detected, but moderate reconditioning should be reflected in costing."
                    : "No material condition blockers detected. This unit appears clean enough to proceed to costing."}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {dirty ? "You have unsaved changes in Inspection." : "Inspection is up to date."}
        </p>
        <SubmitButton type="button" onClick={() => void onSave()} pending={pending} pendingLabel="Saving inspection">
          Save Inspection
        </SubmitButton>
      </div>
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
  const inspectionScore = getInspectionScore(getInspectionFormValues(lead).inspectionFindings)
  const readinessProgress = [
    Boolean(lead.inspectionCompletedAt),
    Boolean(lead.targetBuyPrice && lead.expectedResalePrice),
    Boolean(lead.decision),
    lead.status === "Approved to Buy",
  ].filter(Boolean).length * 25

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
  const primaryBlocker = lead.pipeline?.blockers[0] ?? null
  const primaryWarning = lead.pipeline?.warnings[0] ?? null

  return (
    <div className="space-y-4">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Financial Summary</CardTitle>
          <CardDescription>Acquisition economics and current buy-side posture.</CardDescription>
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
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Workflow Guidance</CardTitle>
          <CardDescription>The system&apos;s current stage, next step, and any blockers for this seller lead.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Alert className="border-border bg-muted/30">
            <InfoIcon />
            <AlertTitle>{lead.pipeline?.nextAction?.label ?? lead.recommendedAction ?? "Awaiting evaluation data"}</AlertTitle>
            <AlertDescription>
              {lead.pipeline?.nextAction?.description ??
                (lead.recommendedAction
                  ? "Use this as a guide only. Final acquisition approval should still come from staff or admin."
                  : "Complete inspection and costing assumptions so the system can surface a clearer recommendation.")}
            </AlertDescription>
          </Alert>
          {primaryBlocker ? (
            <Alert variant="destructive">
              <AlertTriangleIcon />
              <AlertTitle>{primaryBlocker.label}</AlertTitle>
              <AlertDescription>{primaryBlocker.description}</AlertDescription>
            </Alert>
          ) : null}
          {primaryWarning ? (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>{primaryWarning.label}</AlertTitle>
              <AlertDescription>{primaryWarning.description}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Stage</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{lead.pipeline?.stageLabel ?? lead.status}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lead.pipeline ? `${lead.pipeline.progressPercent}% through the acquisition workflow.` : "Pipeline stage is being derived from the current status."}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Inspection Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold text-foreground">{inspectionScore}</span>
                <span className="pb-1 text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval State</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {lead.approvedToBuyAt ? "Approved to Buy" : "Not approved"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lead.approvedToBuyAt ? format(new Date(lead.approvedToBuyAt), "MMM d, yyyy h:mm a") : "Approval is still pending."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Conversion Readiness</CardTitle>
          <CardDescription>How close this seller workflow is to becoming an inventory unit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                {lead.status === "Approved to Buy" ? "Ready to convert" : "Still in workflow"}
              </p>
              <span className="text-sm font-medium text-muted-foreground">{readinessProgress}%</span>
            </div>
            <Progress value={readinessProgress} />
          </div>
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

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Lead Information</CardTitle>
          <CardDescription>Reference details for acquisition coordination.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 text-sm">
          <div className="flex items-start gap-3">
            <UserRoundIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-muted-foreground">Seller Contact</p>
              <p className="font-medium text-foreground">{lead.contactNumber}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-muted-foreground">Region</p>
              <p className="font-medium text-foreground">{lead.region ?? "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <FileTextIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-muted-foreground">Inquiry Source</p>
              <p className="font-medium text-foreground">{lead.inquirySource ?? "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <GaugeIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-muted-foreground">Current Status</p>
              <p className="font-medium text-foreground">{lead.pipeline?.stageLabel ?? lead.status}</p>
            </div>
          </div>
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
  const [decisionValues, setDecisionValues] = React.useState<DecisionFormValues | null>(null)

  React.useEffect(() => {
    if (!lead) return

    setOverviewValues(getOverviewFormValues(lead))
    setInspectionValues(getInspectionFormValues(lead))
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
          { label: "Workflow" },
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
          { label: "Workflow" },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <ApiErrorAlert title="Unable to load seller lead" message={getApiErrorMessage(leadQuery.error, "")} />
        </div>
      </AuthenticatedAppShell>
    )
  }

  if (!lead || !overviewValues || !inspectionValues || !decisionValues) {
    return (
      <AuthenticatedAppShell
        title="Seller Lead Evaluation"
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: "Workflow" },
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
  const decisionDirty =
    serialize(buildDecisionPayload(decisionValues)) !== serialize(buildDecisionPayload(getDecisionFormValues(lead)))

  return (
    <AuthenticatedAppShell
      title="Seller Lead Evaluation"
      breadcrumbs={[
        { label: "Seller Leads", href: "/seller-leads" },
        { label: "Workflow" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Seller Lead Evaluation</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Acquisition Workflow</p>
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Next Step</p>
                <p className="mt-1 text-lg font-semibold">{lead.pipeline?.nextAction?.label ?? lead.recommendedAction ?? "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-xl border border-border/70 bg-background p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
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
