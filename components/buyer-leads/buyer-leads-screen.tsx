"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import {
  AlertTriangleIcon,
  CalendarPlusIcon,
  CarFrontIcon,
  Clock3Icon,
  EyeIcon,
  Link2OffIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { useCreateBuyerLeadMutation } from "@/hooks/mutations/buyer-leads/use-create-buyer-lead-mutation"
import {
  useLinkBuyerLeadVehicleMutation,
  useUnlinkBuyerLeadVehicleMutation,
} from "@/hooks/mutations/buyer-leads/use-link-buyer-lead-vehicle-mutation"
import { useUpdateBuyerLeadMutation } from "@/hooks/mutations/buyer-leads/use-update-buyer-lead-mutation"
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { getApiErrorMessage } from "@/types/api"
import {
  BUYER_LEAD_STATUSES,
  type BuyerLead,
  type BuyerLeadListFilters,
  type BuyerLeadStatus,
  type CreateBuyerLeadPayload,
  type UpdateBuyerLeadPayload,
} from "@/types/buyer-leads"
import type { Vehicle } from "@/types/vehicles"
import { formatVehicleMoney } from "../vehicles/vehicles.helpers"
import { ActivityHistoryPanel } from "../activity-history/activity-history-panel"

type BuyerLeadFormValues = {
  buyerName: string
  contactNumber: string
  email: string
  facebookName: string
  inquirySource: string
  desiredBudget: string
  notes: string
  status: BuyerLeadStatus
}

type BuyerLeadNextActionCta = {
  label: string
  helper: string
  action: "edit" | "vehicles" | "view" | "follow-up" | "sale"
}

function getEmptyBuyerLeadFormValues(): BuyerLeadFormValues {
  return {
    buyerName: "",
    contactNumber: "",
    email: "",
    facebookName: "",
    inquirySource: "",
    desiredBudget: "",
    notes: "",
    status: "New Inquiry",
  }
}

function getBuyerLeadFormValues(lead: BuyerLead): BuyerLeadFormValues {
  return {
    buyerName: lead.buyerName,
    contactNumber: lead.contactNumber,
    email: lead.email ?? "",
    facebookName: lead.facebookName ?? "",
    inquirySource: lead.inquirySource ?? "",
    desiredBudget: lead.desiredBudget ?? "",
    notes: lead.notes ?? "",
    status: lead.status,
  }
}

function parseBuyerLeadPayload(
  values: BuyerLeadFormValues,
  assigneeUserId: string | null,
): CreateBuyerLeadPayload {
  return {
    buyerName: values.buyerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    desiredBudget: values.desiredBudget || null,
    notes: values.notes || null,
    status: values.status,
    assigneeUserId,
  }
}

function parseUpdateBuyerLeadPayload(
  values: BuyerLeadFormValues,
): UpdateBuyerLeadPayload {
  return {
    buyerName: values.buyerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    desiredBudget: values.desiredBudget || null,
    notes: values.notes || null,
    status: values.status,
  }
}

function getBuyerLeadStatusBadgeVariant(
  status: BuyerLeadStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Won":
      return "secondary"
    case "Lost":
      return "destructive"
    default:
      return "outline"
  }
}

function getBuyerLeadStatusClassName(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
    case "Interested":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    case "Reserved":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
    case "Won":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "Lost":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    default:
      return ""
  }
}

function getBuyerLeadStatusTextClassName(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "text-sky-700 dark:text-sky-300"
    case "Contacted":
      return "text-slate-700 dark:text-slate-300"
    case "Interested":
      return "text-indigo-700 dark:text-indigo-300"
    case "Negotiating":
      return "text-amber-700 dark:text-amber-300"
    case "Reserved":
      return "text-orange-700 dark:text-orange-300"
    case "Won":
      return "text-emerald-700 dark:text-emerald-300"
    case "Lost":
      return "text-rose-700 dark:text-rose-300"
    default:
      return ""
  }
}

function getAssigneeLabel(
  assigneeUserId: string | null,
  currentUserId?: string,
) {
  if (!assigneeUserId) {
    return "Unassigned"
  }

  if (assigneeUserId === currentUserId) {
    return "You"
  }

  return "Assigned"
}

function getBuyerLeadPreviewLabel(values: BuyerLeadFormValues) {
  return {
    buyer: values.buyerName || "Not set",
    contact: values.contactNumber || "No contact number yet",
    channel: values.inquirySource || "Source not set",
  }
}

function getBuyerLeadStage(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "Intake"
    case "Contacted":
      return "First Contact"
    case "Interested":
      return "Qualified Demand"
    case "Negotiating":
      return "Active Deal"
    case "Reserved":
      return "Reserved Unit"
    case "Won":
      return "Closed Won"
    case "Lost":
      return "Closed Lost"
    default:
      return "Pipeline"
  }
}

function getBuyerLeadNextAction(lead: BuyerLead) {
  if (lead.pipeline?.nextAction) {
    return lead.pipeline.nextAction.label
  }

  if (lead.status === "Won" || lead.status === "Lost") {
    return "No immediate action"
  }

  if (lead.status === "New Inquiry") {
    return "Make first contact"
  }

  if (lead.status === "Contacted") {
    return "Qualify budget and preferences"
  }

  if (lead.vehicles.length === 0) {
    return "Link matching vehicles"
  }

  if (lead.status === "Interested") {
    return "Present best vehicle options"
  }

  if (lead.status === "Negotiating") {
    return "Confirm terms and reserve unit"
  }

  if (lead.status === "Reserved") {
    return "Finalize sale workflow"
  }

  return "Review lead status"
}

function getBuyerLeadNextActionCta(lead: BuyerLead): BuyerLeadNextActionCta {
  if (lead.pipeline?.nextAction) {
    if (lead.pipeline.nextAction.target === "vehicle_link") {
      return {
        label: "Match Vehicles",
        helper: lead.pipeline.nextAction.description,
        action: "vehicles" as const,
      }
    }

    if (lead.pipeline.nextAction.target === "follow_up") {
      return {
        label: "Schedule Follow-Up",
        helper: "Create a dated task so the next contact is clear.",
        action: "follow-up" as const,
      }
    }

    if (lead.pipeline.nextAction.target === "lead_edit") {
      return {
        label: "Update Lead",
        helper: lead.pipeline.nextAction.description,
        action: "edit" as const,
      }
    }

    if (lead.pipeline.nextAction.target === "sale_finalization") {
      return {
        label: "Finalize Sale",
        helper: lead.pipeline.nextAction.description,
        action: "sale" as const,
      }
    }

    return {
      label: "Open Lead",
      helper: lead.pipeline.nextAction.description,
      action: "view" as const,
    }
  }

  if (lead.status === "Won" || lead.status === "Lost") {
    return {
      label: "View Details",
      helper: "Review the completed lead record.",
      action: "view" as const,
    }
  }

  if (lead.status === "New Inquiry" || lead.status === "Contacted") {
    return {
      label: "Update Lead",
      helper: "Capture contact progress and buyer details.",
      action: "edit" as const,
    }
  }

  if (lead.vehicles.length === 0) {
    return {
      label: "Match Vehicles",
      helper: "Link candidate units for this buyer.",
      action: "vehicles" as const,
    }
  }

  if (lead.status === "Reserved") {
    return {
      label: "Finalize Workflow",
      helper: "Review the record before closing the sale.",
      action: "view" as const,
    }
  }

  return {
    label: "Open Lead",
    helper: "Review status, notes, and linked units.",
    action: "view" as const,
  }
}

function BuyerLeadNextActionIcon({
  action,
}: {
  action: BuyerLeadNextActionCta["action"]
}) {
  if (action === "follow-up") return <CalendarPlusIcon />
  if (action === "vehicles") return <CarFrontIcon />
  if (action === "edit") return <PencilIcon />
  if (action === "sale") return <ReceiptTextIcon />
  return <EyeIcon />
}

function getDefaultFollowUpDueAt() {
  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + 1)
  dueAt.setHours(9, 0, 0, 0)
  return dueAt
}

function getDefaultBuyerFollowUpNote(lead: BuyerLead) {
  return `Follow up with ${lead.buyerName} about their buyer lead.`
}

function isBuyerLeadStale(lead: BuyerLead) {
  if (typeof lead.pipeline?.isStale === "boolean") {
    return lead.pipeline.isStale
  }

  const activityAt = lead.latestActivityAt ?? lead.updatedAt
  const ageMs = Date.now() - new Date(activityAt).getTime()
  const staleDays = lead.status === "New Inquiry" ? 2 : 5
  return (
    ageMs > staleDays * 24 * 60 * 60 * 1000 &&
    lead.status !== "Won" &&
    lead.status !== "Lost"
  )
}

function getBuyerLeadBlocker(lead: BuyerLead) {
  if (lead.pipeline?.blockers.length) {
    return lead.pipeline.blockers[0]?.description ?? null
  }

  if (lead.status === "New Inquiry") {
    return "The inquiry has not been contacted yet."
  }

  if (
    lead.vehicles.length === 0 &&
    lead.status !== "Lost" &&
    lead.status !== "Won"
  ) {
    return "No candidate vehicle is linked yet."
  }

  if (lead.status === "Reserved") {
    return "The reserved unit still needs to be finalized into a sale."
  }

  return null
}

function getBuyerLeadWarning(lead: BuyerLead) {
  if (lead.pipeline?.warnings.length) {
    return lead.pipeline.warnings[0]?.description ?? null
  }

  if (isBuyerLeadStale(lead)) {
    return "This lead has gone stale and needs attention before it drops further."
  }

  if (lead.status === "Negotiating") {
    return "Negotiation is active. Keep follow-ups tight so the buyer does not cool off."
  }

  return null
}

function BuyerLeadForm({
  values,
  onChange,
}: {
  values: BuyerLeadFormValues
  onChange: (values: BuyerLeadFormValues) => void
}) {
  function updateField<K extends keyof BuyerLeadFormValues>(
    key: K,
    value: BuyerLeadFormValues[K],
  ) {
    onChange({ ...values, [key]: value })
  }

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Buyer Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture the core contact information for the buyer inquiry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="buyerName">Buyer name</FieldLabel>
            <Input
              id="buyerName"
              value={values.buyerName}
              onChange={(e) => updateField("buyerName", e.target.value)}
              placeholder="Maria Santos"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="buyerContactNumber">Contact number</FieldLabel>
            <Input
              id="buyerContactNumber"
              value={values.contactNumber}
              onChange={(e) => updateField("contactNumber", e.target.value)}
              placeholder="0917 987 6543"
              required
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="buyerEmail">Email</FieldLabel>
            <Input
              id="buyerEmail"
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="buyer@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="buyerFacebookName">Facebook name</FieldLabel>
            <Input
              id="buyerFacebookName"
              value={values.facebookName}
              onChange={(e) => updateField("facebookName", e.target.value)}
              placeholder="Maria Santos FB"
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Buyer Intent
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture buying context so the team can match this lead with the
            right inventory.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="buyerInquirySource">Inquiry source</FieldLabel>
            <Input
              id="buyerInquirySource"
              value={values.inquirySource}
              onChange={(e) => updateField("inquirySource", e.target.value)}
              placeholder="Facebook Page"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="desiredBudget">Desired budget</FieldLabel>
            <Input
              id="desiredBudget"
              value={values.desiredBudget}
              onChange={(e) => updateField("desiredBudget", e.target.value)}
              placeholder="850000"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="buyerStatus">Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(value) =>
              updateField("status", value as BuyerLeadStatus)
            }
          >
            <SelectTrigger id="buyerStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUYER_LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="buyerNotes">Notes</FieldLabel>
          <Textarea
            id="buyerNotes"
            rows={5}
            value={values.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Buyer prefers an automatic SUV, open to financing, and wants units available for viewing this week."
          />
        </Field>
      </section>
    </FieldGroup>
  )
}

export function BuyerLeadsScreen() {
  const router = useRouter()
  const authQuery = useAuthenticatedUserQuery()
  const vehiclesQuery = useVehiclesQuery({ status: "Available" })
  const createMutation = useCreateBuyerLeadMutation()
  const updateMutation = useUpdateBuyerLeadMutation()
  const createFollowUpMutation = useCreateFollowUpMutation()
  const linkMutation = useLinkBuyerLeadVehicleMutation()
  const unlinkMutation = useUnlinkBuyerLeadVehicleMutation()

  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<
    BuyerLeadStatus | "all"
  >("all")
  const [page, setPage] = React.useState(1)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewLead, setViewLead] = React.useState<BuyerLead | null>(null)
  const [editLead, setEditLead] = React.useState<BuyerLead | null>(null)
  const [followUpLead, setFollowUpLead] = React.useState<BuyerLead | null>(null)
  const [manageVehiclesLead, setManageVehiclesLead] =
    React.useState<BuyerLead | null>(null)
  const [createForm, setCreateForm] = React.useState<BuyerLeadFormValues>(
    getEmptyBuyerLeadFormValues,
  )

  const filters = React.useMemo<BuyerLeadListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: activeFilter,
    }),
    [activeFilter, page, searchTerm],
  )
  const buyerLeadsQuery = useBuyerLeadsQuery(filters)

  const currentUserId = authQuery.data?.user.id
  const leads = buyerLeadsQuery.data?.buyerLeads ?? []
  const total = buyerLeadsQuery.data?.total ?? 0
  const totalPages = buyerLeadsQuery.data?.totalPages ?? 1
  const availableVehicles = vehiclesQuery.data?.vehicles ?? []
  const createPreview = getBuyerLeadPreviewLabel(createForm)

  function handleNextActionClick(lead: BuyerLead) {
    const cta = getBuyerLeadNextActionCta(lead)

    if (cta.action === "edit") {
      setEditLead(lead)
      return
    }

    if (cta.action === "follow-up") {
      setFollowUpLead(lead)
      return
    }

    if (cta.action === "vehicles") {
      setManageVehiclesLead(lead)
      return
    }

    if (cta.action === "sale") {
      router.push(
        `/sales?action=finalize-sale&buyerLeadId=${encodeURIComponent(lead.id)}`,
      )
      return
    }

    setViewLead(lead)
  }

  async function handleStatusChange(
    lead: BuyerLead,
    nextStatus: BuyerLeadStatus,
  ) {
    if (lead.status === nextStatus) {
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        payload: {
          status: nextStatus,
        },
      })

      toast.success(`Buyer lead moved to ${nextStatus}`)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update buyer lead status"),
      )
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(
      parseBuyerLeadPayload(createForm, currentUserId ?? null),
      {
        onSuccess: () => {
          toast.success("Buyer lead created")
          setCreateOpen(false)
          setCreateForm(getEmptyBuyerLeadFormValues())
        },
      },
    )
  }

  return (
    <AuthenticatedAppShell title="Buyer Leads">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Buyer Leads
              </h2>
              <p className="text-sm text-muted-foreground">
                Track buyer demand, review matching context, and manage
                candidate vehicles from one table-first workspace.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add Buyer Lead
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
                  placeholder="Search buyer, contact, or budget"
                  className="pl-9"
                />
              </div>
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  setActiveFilter(value as BuyerLeadStatus | "all")
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyer Leads</SelectItem>
                  {BUYER_LEAD_STATUSES.map((status) => (
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
            <p className="text-sm text-muted-foreground">
              Showing {leads.length} of {total} buyer leads
            </p>
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {buyerLeadsQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading buyer leads" />
              </div>
            ) : buyerLeadsQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert
                  title="Unable to load buyer leads"
                  message={getApiErrorMessage(buyerLeadsQuery.error, "")}
                />
              </div>
            ) : leads.length ? (
              <Table className="min-w-[1040px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Buyer
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Contact
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Budget
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Stage
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Next Action
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Linked Vehicles
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Assignee
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Updated
                    </TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const cta = getBuyerLeadNextActionCta(lead)

                    return (
                      <TableRow
                        key={lead.id}
                        className={
                          isBuyerLeadStale(lead)
                            ? "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                            : "hover:bg-muted/15"
                        }
                      >
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {lead.buyerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.email ??
                                lead.facebookName ??
                                "No secondary contact"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {lead.contactNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">
                          {formatVehicleMoney(lead.desiredBudget)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant={getBuyerLeadStatusBadgeVariant(
                              lead.status,
                            )}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getBuyerLeadStatusClassName(lead.status)}`}
                          >
                            {lead.pipeline?.stageLabel ??
                              getBuyerLeadStage(lead.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {getBuyerLeadNextAction(lead)}
                            </p>
                            <Button
                              type="button"
                              variant={
                                cta.action === "follow-up"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="mt-1"
                              onClick={() => handleNextActionClick(lead)}
                            >
                              <BuyerLeadNextActionIcon action={cta.action} />
                              {cta.label}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              {cta.helper}
                            </p>
                            {getBuyerLeadWarning(lead) ? (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Needs follow-up
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {lead.vehicles.length} vehicle
                            {lead.vehicles.length === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {getAssigneeLabel(lead.assigneeUserId, currentUserId)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {formatDistanceToNow(new Date(lead.updatedAt), {
                                addSuffix: true,
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${lead.buyerName}`}
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                Lead actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setViewLead(lead)}
                              >
                                <EyeIcon />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditLead(lead)}
                              >
                                <PencilIcon />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setFollowUpLead(lead)}
                              >
                                <CalendarPlusIcon />
                                Schedule Follow-Up
                              </DropdownMenuItem>
                              {cta.action === "sale" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/sales?action=finalize-sale&buyerLeadId=${encodeURIComponent(lead.id)}`,
                                    )
                                  }
                                >
                                  <ReceiptTextIcon />
                                  Finalize Sale
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setManageVehiclesLead(lead)}
                              >
                                <CarFrontIcon />
                                Manage Vehicles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>
                                Update status
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup value={lead.status}>
                                {BUYER_LEAD_STATUSES.map((status) => (
                                  <DropdownMenuRadioItem
                                    key={status}
                                    value={status}
                                    className={`font-medium ${getBuyerLeadStatusTextClassName(status)}`}
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
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No buyer leads yet"
                  description="Add the first buyer lead to start matching demand with inventory."
                />
              </div>
            )}
          </CardContent>
          {!buyerLeadsQuery.isPending && !buyerLeadsQuery.error && total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="buyer leads"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add Buyer Lead</SheetTitle>
              <SheetDescription>
                Capture a new buyer inquiry and assign it to yourself by
                default.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleCreateSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.45fr)_280px]">
                <div className="min-h-0 overflow-y-auto px-6 py-6">
                  <div className="space-y-5">
                    <ApiErrorAlert
                      title="Unable to create buyer lead"
                      message={getApiErrorMessage(createMutation.error, "")}
                    />
                    <BuyerLeadForm
                      values={createForm}
                      onChange={setCreateForm}
                    />
                  </div>
                </div>
                <aside className="border-t bg-muted/15 px-6 py-6 lg:border-t-0 lg:border-l">
                  <div className="space-y-4">
                    <Card className="border-border/70 py-0 shadow-none">
                      <CardHeader className="border-b py-4">
                        <CardTitle className="text-base">
                          Lead Summary
                        </CardTitle>
                        <CardDescription>
                          Live preview of the demand details you&apos;re
                          capturing.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Buyer
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {createPreview.buyer}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Contact
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {createPreview.contact}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Inquiry Source
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {createPreview.channel}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Desired Budget
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {formatVehicleMoney(createForm.desiredBudget)}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant={getBuyerLeadStatusBadgeVariant(
                              createForm.status,
                            )}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getBuyerLeadStatusClassName(createForm.status)}`}
                          >
                            {createForm.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                      Use this drawer for quick demand intake. Vehicle matching
                      can be done later from the buyer lead row action.
                    </div>
                  </div>
                </aside>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This lead will be assigned to{" "}
                  <span className="font-medium text-foreground">you</span>.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    type="submit"
                    pending={createMutation.isPending}
                    pendingLabel="Creating buyer lead"
                  >
                    Create Buyer Lead
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Dialog
          open={Boolean(viewLead)}
          onOpenChange={(open) => !open && setViewLead(null)}
        >
          <DialogContent className="max-w-xl">
            {viewLead ? (
              <>
                <DialogHeader>
                  <DialogTitle>{viewLead.buyerName}</DialogTitle>
                  <DialogDescription>
                    {viewLead.contactNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Desired Budget
                      </p>
                      <p className="text-sm text-foreground">
                        {formatVehicleMoney(viewLead.desiredBudget)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Stage
                      </p>
                      <p className="text-sm text-foreground">
                        {viewLead.pipeline?.stageLabel ??
                          getBuyerLeadStage(viewLead.status)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Assignee
                      </p>
                      <p className="text-sm text-foreground">
                        {getAssigneeLabel(
                          viewLead.assigneeUserId,
                          currentUserId,
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Linked Vehicles
                      </p>
                      <p className="text-sm text-foreground">
                        {viewLead.vehicles.length}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Alert>
                      <Clock3Icon className="size-4" />
                      <AlertTitle>Next action</AlertTitle>
                      <AlertDescription>
                        {getBuyerLeadNextAction(viewLead)}
                      </AlertDescription>
                    </Alert>
                    {getBuyerLeadBlocker(viewLead) ? (
                      <Alert variant="destructive">
                        <AlertTriangleIcon className="size-4" />
                        <AlertTitle>Blocker</AlertTitle>
                        <AlertDescription>
                          {getBuyerLeadBlocker(viewLead)}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                    {getBuyerLeadWarning(viewLead) ? (
                      <Alert>
                        <AlertTriangleIcon className="size-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                          {getBuyerLeadWarning(viewLead)}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Linked Vehicle Matches
                    </p>
                    {viewLead.vehicles.length ? (
                      <div className="space-y-2">
                        {viewLead.vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-foreground"
                          >
                            {vehicle.stockNumber} • {vehicle.brand}{" "}
                            {vehicle.model} • {vehicle.status}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No vehicles linked.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm text-foreground">
                      {viewLead.notes ?? "No notes recorded."}
                    </p>
                  </div>
                  <ActivityHistoryPanel
                    entityType="buyer_lead"
                    entityId={viewLead.id}
                  />
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(editLead)}
          onOpenChange={(open) => !open && setEditLead(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            {editLead ? (
              <EditBuyerLeadDialogForm
                key={editLead.id}
                lead={editLead}
                mutation={updateMutation}
                onClose={() => setEditLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(followUpLead)}
          onOpenChange={(open) => !open && setFollowUpLead(null)}
        >
          <DialogContent className="max-w-xl">
            {followUpLead ? (
              <ScheduleBuyerFollowUpDialogForm
                key={followUpLead.id}
                lead={followUpLead}
                currentUserId={currentUserId}
                mutation={createFollowUpMutation}
                onClose={() => setFollowUpLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(manageVehiclesLead)}
          onOpenChange={(open) => !open && setManageVehiclesLead(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            {manageVehiclesLead ? (
              <ManageBuyerLeadVehiclesDialog
                key={manageVehiclesLead.id}
                lead={manageVehiclesLead}
                availableVehicles={availableVehicles}
                linkMutation={linkMutation}
                unlinkMutation={unlinkMutation}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}

function EditBuyerLeadDialogForm({
  lead,
  mutation,
  onClose,
}: {
  lead: BuyerLead
  mutation: ReturnType<typeof useUpdateBuyerLeadMutation>
  onClose: () => void
}) {
  const [values, setValues] = React.useState<BuyerLeadFormValues>(() =>
    getBuyerLeadFormValues(lead),
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await mutation.mutateAsync(
      {
        id: lead.id,
        payload: parseUpdateBuyerLeadPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Buyer lead updated")
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Buyer Lead</DialogTitle>
        <DialogDescription>
          Update buyer details, demand context, and pipeline status.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert
          title="Unable to update buyer lead"
          message={getApiErrorMessage(mutation.error, "")}
        />
        <BuyerLeadForm values={values} onChange={setValues} />
        <DialogFooter>
          <SubmitButton
            type="submit"
            pending={mutation.isPending}
            pendingLabel="Saving changes"
          >
            Save Changes
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  )
}

function ScheduleBuyerFollowUpDialogForm({
  lead,
  currentUserId,
  mutation,
  onClose,
}: {
  lead: BuyerLead
  currentUserId?: string
  mutation: ReturnType<typeof useCreateFollowUpMutation>
  onClose: () => void
}) {
  const assigneeUserId = currentUserId ?? lead.assigneeUserId ?? ""
  const [dueAt, setDueAt] = React.useState<Date | undefined>(() =>
    getDefaultFollowUpDueAt(),
  )
  const [note, setNote] = React.useState(() =>
    getDefaultBuyerFollowUpNote(lead),
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!assigneeUserId || !dueAt || !note.trim()) {
      return
    }

    await mutation.mutateAsync(
      {
        leadType: "buyer",
        buyerLeadId: lead.id,
        assigneeUserId,
        dueAt: dueAt.toISOString(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Follow-up scheduled")
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule Follow-Up</DialogTitle>
        <DialogDescription>
          Create the next contact task for {lead.buyerName}.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ApiErrorAlert
          title="Unable to schedule follow-up"
          message={getApiErrorMessage(mutation.error, "")}
        />
        <div className="rounded-md border bg-muted/20 px-3 py-3 text-sm">
          <p className="font-medium text-foreground">{lead.buyerName}</p>
          <p className="text-muted-foreground">{lead.contactNumber}</p>
        </div>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="buyerFollowUpDueAt">Due at</FieldLabel>
            <DateTimePicker
              id="buyerFollowUpDueAt"
              value={dueAt}
              onChange={setDueAt}
              minDate={new Date()}
              placeholder="Select due date and time"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="buyerFollowUpNote">Follow-up note</FieldLabel>
            <Textarea
              id="buyerFollowUpNote"
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
            pendingLabel="Scheduling follow-up"
            disabled={!assigneeUserId || !dueAt || !note.trim()}
          >
            <CalendarPlusIcon />
            Schedule Follow-Up
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  )
}

function ManageBuyerLeadVehiclesDialog({
  lead,
  availableVehicles,
  linkMutation,
  unlinkMutation,
}: {
  lead: BuyerLead
  availableVehicles: Vehicle[]
  linkMutation: ReturnType<typeof useLinkBuyerLeadVehicleMutation>
  unlinkMutation: ReturnType<typeof useUnlinkBuyerLeadVehicleMutation>
}) {
  const [selectedVehicleId, setSelectedVehicleId] = React.useState("")

  const candidateVehicles = availableVehicles.filter(
    (vehicle) => !lead.vehicles.some((linked) => linked.id === vehicle.id),
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manage Linked Vehicles</DialogTitle>
        <DialogDescription>
          Link candidate inventory or remove matches for {lead.buyerName}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <ApiErrorAlert
          title="Buyer lead action failed"
          message={getApiErrorMessage(
            linkMutation.error ?? unlinkMutation.error,
            "",
          )}
        />
        <div className="space-y-3">
          <p className="text-sm font-medium">Linked vehicles</p>
          {lead.vehicles.length ? (
            lead.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm"
              >
                <span className="text-foreground">
                  {vehicle.stockNumber} • {vehicle.brand} {vehicle.model} •{" "}
                  {vehicle.status}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    unlinkMutation.mutate(
                      { id: lead.id, vehicleId: vehicle.id },
                      { onSuccess: () => toast.success("Vehicle unlinked") },
                    )
                  }
                >
                  <Link2OffIcon />
                  Unlink
                </Button>
              </div>
            ))
          ) : (
            <EmptyState
              title="No vehicles linked"
              description="Link at least one vehicle before finalizing a sale."
            />
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Select
            value={selectedVehicleId}
            onValueChange={setSelectedVehicleId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a vehicle to link" />
            </SelectTrigger>
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
            disabled={!selectedVehicleId}
            onClick={() => {
              if (!selectedVehicleId) return

              linkMutation.mutate(
                { id: lead.id, vehicleId: selectedVehicleId },
                {
                  onSuccess: () => {
                    toast.success("Vehicle linked to buyer lead")
                    setSelectedVehicleId("")
                  },
                },
              )
            }}
          >
            Link Vehicle
          </SubmitButton>
        </div>
      </div>
    </>
  )
}
