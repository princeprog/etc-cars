"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShuffleIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCreateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-create-seller-lead-mutation"
import {
  useCreateSellerLeadEstimatedCostMutation,
  useDeleteSellerLeadEstimatedCostMutation,
} from "@/hooks/mutations/seller-leads/use-seller-lead-estimated-cost-mutations"
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import {
  SELLER_LEAD_DECISIONS,
  SELLER_LEAD_ESTIMATED_COST_CATEGORIES,
  SELLER_LEAD_INSPECTION_RATINGS,
  SELLER_LEAD_STATUSES,
  type CreateSellerLeadPayload,
  type SellerLead,
  type SellerLeadDecision,
  type SellerLeadEstimatedCostCategory,
  type SellerLeadInspectionFindings,
  type SellerLeadInspectionRating,
  type SellerLeadListFilters,
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

type SellerLeadFormValues = {
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
  status: SellerLeadStatus
  inspectionCompletedAt: string
  inspectionNotes: string
  targetBuyPrice: string
  expectedResalePrice: string
  targetProfitAmount: string
  decision: SellerLeadDecision | ""
  decisionNote: string
  inspectionFindings: Record<InspectionKey, { rating: SellerLeadInspectionRating; notes: string }>
}

function getEmptyInspectionFindings(): SellerLeadFormValues["inspectionFindings"] {
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

function getEmptySellerLeadFormValues(): SellerLeadFormValues {
  return {
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
    inspectionCompletedAt: "",
    inspectionNotes: "",
    targetBuyPrice: "",
    expectedResalePrice: "",
    targetProfitAmount: "",
    decision: "",
    decisionNote: "",
    inspectionFindings: getEmptyInspectionFindings(),
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

function getSellerLeadFormValues(lead: SellerLead): SellerLeadFormValues {
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
    status: lead.status,
    inspectionCompletedAt: lead.inspectionCompletedAt ? lead.inspectionCompletedAt.slice(0, 16) : "",
    inspectionNotes: lead.inspectionNotes ?? "",
    targetBuyPrice: lead.targetBuyPrice ?? "",
    expectedResalePrice: lead.expectedResalePrice ?? "",
    targetProfitAmount: lead.targetProfitAmount ?? "",
    decision: lead.decision ?? "",
    decisionNote: lead.decisionNote ?? "",
    inspectionFindings: mapInspectionFindings(lead.inspectionFindings),
  }
}

function toInspectionFindingsPayload(values: SellerLeadFormValues["inspectionFindings"]) {
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

function parseSellerLeadPayload(values: SellerLeadFormValues, assigneeUserId: string | null): CreateSellerLeadPayload {
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
    status: values.status,
    assigneeUserId,
  }
}

function parseUpdateSellerLeadPayload(values: SellerLeadFormValues): UpdateSellerLeadPayload {
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
    status: values.status,
    inspectionCompletedAt: values.inspectionCompletedAt ? new Date(values.inspectionCompletedAt).toISOString() : null,
    inspectionNotes: values.inspectionNotes || null,
    inspectionFindings: toInspectionFindingsPayload(values.inspectionFindings),
    targetBuyPrice: values.targetBuyPrice || null,
    expectedResalePrice: values.expectedResalePrice || null,
    targetProfitAmount: values.targetProfitAmount || null,
    decision: values.decision || null,
    decisionNote: values.decisionNote || null,
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
  if (lead.targetBuyPrice ?? lead.askingPrice) params.set("askingPrice", lead.targetBuyPrice ?? lead.askingPrice ?? "")
  if (lead.region) params.set("region", lead.region)
  if (lead.notes) params.set("notes", lead.notes)

  return `/vehicles/new?${params.toString()}`
}

function getSellerLeadStatusBadgeVariant(status: SellerLeadStatus): "default" | "secondary" | "outline" | "destructive" {
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

function getAssigneeLabel(assigneeUserId: string | null, currentUserId?: string) {
  if (!assigneeUserId) return "Unassigned"
  if (assigneeUserId === currentUserId) return "You"
  return "Assigned"
}

function formatPercent(value: string | null) {
  return value ? `${value}%` : "—"
}

function formatInspectionLabel(key: InspectionKey) {
  if (key === "ac") return "A/C"
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function SellerLeadForm({
  values,
  onChange,
}: {
  values: SellerLeadFormValues
  onChange: (values: SellerLeadFormValues) => void
}) {
  function updateField<K extends keyof SellerLeadFormValues>(key: K, value: SellerLeadFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Seller Details</h3>
          <p className="text-sm text-muted-foreground">
            Capture the core contact information for the acquisition inquiry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sellerName">Seller name</FieldLabel>
            <Input id="sellerName" value={values.sellerName} onChange={(e) => updateField("sellerName", e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
            <Input id="contactNumber" value={values.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} required />
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
          <h3 className="text-sm font-semibold text-foreground">Vehicle Details</h3>
          <p className="text-sm text-muted-foreground">
            Record the unit being offered so the team can move it cleanly into evaluation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vehicleBrand">Vehicle brand</FieldLabel>
            <Input id="vehicleBrand" value={values.vehicleBrand} onChange={(e) => updateField("vehicleBrand", e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="vehicleModel">Vehicle model</FieldLabel>
            <Input id="vehicleModel" value={values.vehicleModel} onChange={(e) => updateField("vehicleModel", e.target.value)} required />
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
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Lead Context</h3>
          <p className="text-sm text-muted-foreground">
            Capture source, region, current workflow status, and intake notes.
          </p>
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
          <FieldLabel htmlFor="sellerStatus">Status</FieldLabel>
          <Select value={values.status} onValueChange={(value) => updateField("status", value as SellerLeadStatus)}>
            <SelectTrigger id="sellerStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SELLER_LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="sellerNotes">Notes</FieldLabel>
          <Textarea id="sellerNotes" rows={5} value={values.notes} onChange={(e) => updateField("notes", e.target.value)} />
        </Field>
      </section>
    </FieldGroup>
  )
}

function AcquisitionEvaluationForm({
  values,
  onChange,
}: {
  values: SellerLeadFormValues
  onChange: (values: SellerLeadFormValues) => void
}) {
  function updateField<K extends keyof SellerLeadFormValues>(key: K, value: SellerLeadFormValues[K]) {
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
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Pricing & Decision</h3>
          <p className="text-sm text-muted-foreground">
            Record the target buy number, expected resale, and the current acquisition decision.
          </p>
        </div>
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
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="decision">Decision</FieldLabel>
            <Select value={values.decision || "none"} onValueChange={(value) => updateField("decision", value === "none" ? "" : (value as SellerLeadDecision))}>
              <SelectTrigger id="decision">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No decision yet</SelectItem>
                {SELLER_LEAD_DECISIONS.map((decision) => (
                  <SelectItem key={decision} value={decision}>
                    {decision}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="inspectionCompletedAt">Inspection completed at</FieldLabel>
            <Input id="inspectionCompletedAt" type="datetime-local" value={values.inspectionCompletedAt} onChange={(e) => updateField("inspectionCompletedAt", e.target.value)} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="decisionNote">Decision note</FieldLabel>
          <Textarea id="decisionNote" rows={3} value={values.decisionNote} onChange={(e) => updateField("decisionNote", e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="inspectionNotes">Inspection notes</FieldLabel>
          <Textarea id="inspectionNotes" rows={4} value={values.inspectionNotes} onChange={(e) => updateField("inspectionNotes", e.target.value)} />
        </Field>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Inspection Checklist</h3>
          <p className="text-sm text-muted-foreground">
            Give each system a condition rating and short note so the costing discussion has real inspection context.
          </p>
        </div>
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
      </section>
    </div>
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

function AcquisitionSummaryCard({ lead }: { lead: SellerLead }) {
  const rows = [
    { label: "Seller asking", value: formatVehicleMoney(lead.askingPrice) },
    { label: "Target buy", value: formatVehicleMoney(lead.targetBuyPrice) },
    { label: "Expected resale", value: formatVehicleMoney(lead.expectedResalePrice) },
    { label: "Estimated costs", value: formatVehicleMoney(lead.estimatedCostsTotal) },
    { label: "Total investment", value: formatVehicleMoney(lead.estimatedTotalInvestment) },
    { label: "Gross profit", value: formatVehicleMoney(lead.estimatedGrossProfit) },
    { label: "Profit margin", value: formatPercent(lead.estimatedProfitMargin) },
    { label: "Recommendation", value: lead.recommendedAction ?? "—" },
  ]

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Acquisition Summary</CardTitle>
        <CardDescription>Live evaluation economics based on the current inspection and estimated costs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground">{row.value}</span>
          </div>
        ))}
        <Separator />
        <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Decision</span>
            <Badge variant={getDecisionBadgeVariant(lead.decision)}>{lead.decision ?? "Pending"}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Approval</span>
            <Badge variant={lead.status === "Approved to Buy" || lead.status === "Purchased" ? "secondary" : "outline"}>
              {lead.approvedToBuyAt ? "Approved" : "Not approved"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EditSellerLeadDialogForm({
  leadId,
  mutation,
  onClose,
}: {
  leadId: string
  mutation: ReturnType<typeof useUpdateSellerLeadMutation>
  onClose: () => void
}) {
  const leadQuery = useSellerLeadQuery(leadId)
  const lead = leadQuery.data?.sellerLead
  const [values, setValues] = React.useState<SellerLeadFormValues | null>(null)

  React.useEffect(() => {
    if (lead) {
      setValues(getSellerLeadFormValues(lead))
    }
  }, [lead])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values) return

    await mutation.mutateAsync(
      {
        id: leadId,
        payload: parseUpdateSellerLeadPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Seller lead updated")
        },
      },
    )
  }

  if (leadQuery.isPending || !lead || !values) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Loading seller lead</DialogTitle>
          <DialogDescription>Preparing the acquisition evaluation workspace.</DialogDescription>
        </DialogHeader>
        <ModuleLoadingState label="Loading seller lead" />
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Seller Lead</DialogTitle>
        <DialogDescription>Review the unit, update the economics, and approve the lead only when the deal is ready.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ApiErrorAlert title="Unable to update seller lead" message={getApiErrorMessage(mutation.error ?? leadQuery.error, "")} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="space-y-6">
            <SellerLeadForm values={values} onChange={setValues} />
            <Separator />
            <AcquisitionEvaluationForm values={values} onChange={setValues} />
            <EstimatedCostsCard leadId={leadId} lead={lead} />
          </div>
          <div className="space-y-6">
            <AcquisitionSummaryCard lead={lead} />
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Workflow</CardTitle>
                <CardDescription>Approval unlocks conversion into inventory.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Current status</span>
                  <Badge variant={getSellerLeadStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Approved at</span>
                  <span className="font-medium text-foreground">
                    {lead.approvedToBuyAt ? format(new Date(lead.approvedToBuyAt), "MMM d, yyyy h:mm a") : "Not approved"}
                  </span>
                </div>
                <p className="rounded-lg border bg-muted/20 px-3 py-3 text-muted-foreground">
                  Move this lead to <span className="font-medium text-foreground">Approved to Buy</span> when the final buy decision is locked. Only then can it be converted into a vehicle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <SubmitButton type="submit" pending={mutation.isPending} pendingLabel="Saving changes">
            Save Changes
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  )
}

export function SellerLeadsScreen() {
  const router = useRouter()
  const authQuery = useAuthenticatedUserQuery()
  const createMutation = useCreateSellerLeadMutation()
  const updateMutation = useUpdateSellerLeadMutation()

  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<SellerLeadStatus | "all">("all")
  const [page, setPage] = React.useState(1)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewLead, setViewLead] = React.useState<SellerLead | null>(null)
  const [editLeadId, setEditLeadId] = React.useState<string | null>(null)
  const [createForm, setCreateForm] = React.useState<SellerLeadFormValues>(getEmptySellerLeadFormValues)

  const filters = React.useMemo<SellerLeadListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: activeFilter,
    }),
    [activeFilter, page, searchTerm],
  )
  const sellerLeadsQuery = useSellerLeadsQuery(filters)

  const currentUserId = authQuery.data?.user.id
  const leads = sellerLeadsQuery.data?.sellerLeads ?? []
  const total = sellerLeadsQuery.data?.total ?? 0
  const totalPages = sellerLeadsQuery.data?.totalPages ?? 1

  async function handleStatusChange(lead: SellerLead, nextStatus: SellerLeadStatus) {
    if (lead.status === nextStatus) return

    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        payload: {
          status: nextStatus,
        },
      })

      toast.success(`Seller lead moved to ${nextStatus}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update seller lead status"))
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(parseSellerLeadPayload(createForm, currentUserId ?? null), {
      onSuccess: () => {
        toast.success("Seller lead created")
        setCreateOpen(false)
        setCreateForm(getEmptySellerLeadFormValues())
      },
    })
  }

  return (
    <AuthenticatedAppShell title="Seller Leads">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Seller Leads</h2>
              <p className="text-sm text-muted-foreground">
                Track acquisition opportunities, inspect units, and approve only the leads that make financial sense.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add Seller Lead
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search seller, contact, or vehicle"
                  className="pl-9"
                />
              </div>
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  setActiveFilter(value as SellerLeadStatus | "all")
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[240px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seller Leads</SelectItem>
                  {SELLER_LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setActiveFilter("all")
                  setPage(1)
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Showing {leads.length} of {total} seller leads</p>
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {sellerLeadsQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading seller leads" />
              </div>
            ) : sellerLeadsQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert title="Unable to load seller leads" message={getApiErrorMessage(sellerLeadsQuery.error, "")} />
              </div>
            ) : leads.length ? (
              <Table className="min-w-[1380px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Seller</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Vehicle</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Asking</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Investment</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Expected Resale</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Margin</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Decision</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Approval</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Updated</TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/15">
                      <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{lead.sellerName}</p>
                          <p className="text-sm text-muted-foreground">{lead.contactNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{lead.vehicleBrand} {lead.vehicleModel}</p>
                          <p className="text-sm text-muted-foreground">{lead.vehicleYear ? `${lead.vehicleYear}${lead.vehicleVariant ? ` • ${lead.vehicleVariant}` : ""}` : lead.vehicleVariant || "No variant"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium tabular-nums">{formatVehicleMoney(lead.askingPrice)}</TableCell>
                      <TableCell className="px-4 py-3 font-medium tabular-nums">{formatVehicleMoney(lead.estimatedTotalInvestment)}</TableCell>
                      <TableCell className="px-4 py-3 font-medium tabular-nums">{formatVehicleMoney(lead.expectedResalePrice)}</TableCell>
                      <TableCell className="px-4 py-3 font-medium tabular-nums">{formatPercent(lead.estimatedProfitMargin)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant={getDecisionBadgeVariant(lead.decision)}>{lead.decision ?? "Pending"}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant={lead.approvedToBuyAt ? "secondary" : "outline"}>
                          {lead.approvedToBuyAt ? "Approved" : "Not approved"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant={getSellerLeadStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">{format(new Date(lead.updatedAt), "MMM d, yyyy")}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${lead.sellerName}`}>
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Lead actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewLead(lead)}>
                              <EyeIcon />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditLeadId(lead.id)}>
                              <PencilIcon />
                              Open evaluation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={lead.status !== "Approved to Buy"}
                              onClick={() => router.push(buildConvertVehicleHref(lead))}
                            >
                              <ShuffleIcon />
                              Convert to Vehicle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Quick status</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={lead.status}>
                              {SELLER_LEAD_STATUSES.map((status) => (
                                <DropdownMenuRadioItem
                                  key={status}
                                  value={status}
                                  disabled={updateMutation.isPending}
                                  onSelect={(event) => {
                                    event.preventDefault()
                                    void handleStatusChange(lead, status)
                                  }}
                                >
                                  {status}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState title="No seller leads yet" description="Add the first seller lead to start the acquisition workflow." />
              </div>
            )}
          </CardContent>
          {!sellerLeadsQuery.isPending && !sellerLeadsQuery.error && total > 0 ? (
            <ListPagination page={page} totalPages={totalPages} total={total} itemLabel="seller leads" onPageChange={setPage} />
          ) : null}
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add Seller Lead</SheetTitle>
              <SheetDescription>Capture a new acquisition inquiry and assign it to yourself by default.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-5">
                  <ApiErrorAlert title="Unable to create seller lead" message={getApiErrorMessage(createMutation.error, "")} />
                  <SellerLeadForm values={createForm} onChange={setCreateForm} />
                </div>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This lead will be assigned to <span className="font-medium text-foreground">{currentUserId ? "you" : "the active user"}</span>.
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating lead">
                    Create Seller Lead
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Dialog open={Boolean(viewLead)} onOpenChange={(open) => !open && setViewLead(null)}>
          <DialogContent className="max-w-3xl">
            {viewLead ? (
              <>
                <DialogHeader>
                  <DialogTitle>{viewLead.sellerName}</DialogTitle>
                  <DialogDescription>{getSellerLeadVehicleLabel(viewLead)}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-border/70 shadow-none">
                    <CardHeader className="border-b">
                      <CardTitle className="text-base">Lead Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6 text-sm">
                      <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Contact</span><span>{viewLead.contactNumber}</span></div>
                      <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Status</span><span>{viewLead.status}</span></div>
                      <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Assignee</span><span>{getAssigneeLabel(viewLead.assigneeUserId, currentUserId)}</span></div>
                      <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Decision</span><span>{viewLead.decision ?? "Pending"}</span></div>
                      <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Recommendation</span><span>{viewLead.recommendedAction ?? "—"}</span></div>
                    </CardContent>
                  </Card>
                  <AcquisitionSummaryCard lead={viewLead} />
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(editLeadId)} onOpenChange={(open) => !open && setEditLeadId(null)}>
          <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
            {editLeadId ? (
              <EditSellerLeadDialogForm
                leadId={editLeadId}
                mutation={updateMutation}
                onClose={() => setEditLeadId(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}
