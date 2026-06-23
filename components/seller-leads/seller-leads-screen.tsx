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
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import {
  SELLER_LEAD_STATUSES,
  type CreateSellerLeadPayload,
  type SellerLead,
  type SellerLeadListFilters,
  type SellerLeadStatus,
  type UpdateSellerLeadPayload,
} from "@/types/seller-leads"
import { formatVehicleMoney } from "../vehicles/vehicles.helpers"
import { ActivityHistoryPanel } from "../activity-history/activity-history-panel"

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
  }
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
  }
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

  if (lead.vehicleYear) {
    params.set("vehicleYear", String(lead.vehicleYear))
  }

  if (lead.vehicleVariant) {
    params.set("vehicleVariant", lead.vehicleVariant)
  }

  if (lead.askingPrice) {
    params.set("askingPrice", lead.askingPrice)
  }

  if (lead.region) {
    params.set("region", lead.region)
  }

  if (lead.notes) {
    params.set("notes", lead.notes)
  }

  return `/vehicles/new?${params.toString()}`
}

function getSellerLeadStatusBadgeVariant(status: SellerLeadStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Purchased":
      return "secondary"
    case "Rejected":
      return "destructive"
    default:
      return "outline"
  }
}

function getSellerLeadStatusClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
    case "Inspection Scheduled":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    case "Purchased":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "Rejected":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    default:
      return ""
  }
}

function getSellerLeadStatusTextClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "text-sky-700 dark:text-sky-300"
    case "Contacted":
      return "text-slate-700 dark:text-slate-300"
    case "Inspection Scheduled":
      return "text-indigo-700 dark:text-indigo-300"
    case "Negotiating":
      return "text-amber-700 dark:text-amber-300"
    case "Purchased":
      return "text-emerald-700 dark:text-emerald-300"
    case "Rejected":
      return "text-rose-700 dark:text-rose-300"
    default:
      return ""
  }
}

function getAssigneeLabel(assigneeUserId: string | null, currentUserId?: string) {
  if (!assigneeUserId) {
    return "Unassigned"
  }

  if (assigneeUserId === currentUserId) {
    return "You"
  }

  return "Assigned"
}

function getSellerLeadPreviewLabel(values: SellerLeadFormValues) {
  const vehicle = [values.vehicleBrand, values.vehicleModel].filter(Boolean).join(" ")
  const variant = [values.vehicleYear, values.vehicleVariant].filter(Boolean).join(" • ")

  return {
    vehicle: vehicle || "Vehicle not set",
    variant: variant || "No year or variant yet",
  }
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
            <Input id="sellerName" value={values.sellerName} onChange={(e) => updateField("sellerName", e.target.value)} placeholder="Juan Dela Cruz" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
            <Input id="contactNumber" value={values.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} placeholder="0917 123 4567" required />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" value={values.email} onChange={(e) => updateField("email", e.target.value)} placeholder="seller@example.com" />
          </Field>
          <Field>
            <FieldLabel htmlFor="facebookName">Facebook name</FieldLabel>
            <Input id="facebookName" value={values.facebookName} onChange={(e) => updateField("facebookName", e.target.value)} placeholder="Juan Dela Cruz FB" />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Vehicle Details</h3>
          <p className="text-sm text-muted-foreground">
            Record the vehicle being offered so the intake can move cleanly into inventory review.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vehicleBrand">Vehicle brand</FieldLabel>
            <Input id="vehicleBrand" value={values.vehicleBrand} onChange={(e) => updateField("vehicleBrand", e.target.value)} placeholder="Toyota" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="vehicleModel">Vehicle model</FieldLabel>
            <Input id="vehicleModel" value={values.vehicleModel} onChange={(e) => updateField("vehicleModel", e.target.value)} placeholder="Vios" required />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="vehicleYear">Year</FieldLabel>
            <Input id="vehicleYear" type="number" value={values.vehicleYear} onChange={(e) => updateField("vehicleYear", e.target.value)} placeholder="2020" />
          </Field>
          <Field>
            <FieldLabel htmlFor="vehicleVariant">Variant</FieldLabel>
            <Input id="vehicleVariant" value={values.vehicleVariant} onChange={(e) => updateField("vehicleVariant", e.target.value)} placeholder="1.3 E CVT" />
          </Field>
          <Field>
            <FieldLabel htmlFor="askingPrice">Asking price</FieldLabel>
            <Input id="askingPrice" value={values.askingPrice} onChange={(e) => updateField("askingPrice", e.target.value)} placeholder="450000" />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Lead Context</h3>
          <p className="text-sm text-muted-foreground">
            Capture queue context, source details, and any notes the team should see immediately.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inquirySource">Inquiry source</FieldLabel>
            <Input id="inquirySource" value={values.inquirySource} onChange={(e) => updateField("inquirySource", e.target.value)} placeholder="Facebook Marketplace" />
          </Field>
          <Field>
            <FieldLabel htmlFor="region">Region</FieldLabel>
            <Input id="region" value={values.region} onChange={(e) => updateField("region", e.target.value)} placeholder="Cebu" />
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
          <Textarea id="sellerNotes" rows={5} value={values.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Seller says unit has complete papers and minor scratches on the rear bumper." />
        </Field>
      </section>
    </FieldGroup>
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
  const [editLead, setEditLead] = React.useState<SellerLead | null>(null)
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
  const createPreview = getSellerLeadPreviewLabel(createForm)

  async function handleStatusChange(lead: SellerLead, nextStatus: SellerLeadStatus) {
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
                Track acquisition opportunities, review seller information, and convert qualified leads into inventory.
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
              <Select value={activeFilter} onValueChange={(value) => {
                setActiveFilter(value as SellerLeadStatus | "all")
                setPage(1)
              }}>
                <SelectTrigger className="w-full md:w-[220px]">
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
            <p className="text-sm text-muted-foreground">
              Showing {leads.length} of {total} seller leads
            </p>
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
              <Table className="min-w-[1080px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Seller</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Contact</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Vehicle</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Asking Price</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Assignee</TableHead>
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
                          <p className="text-sm text-muted-foreground">{lead.email ?? lead.facebookName ?? "No secondary contact"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-foreground">{lead.contactNumber}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{lead.vehicleBrand} {lead.vehicleModel}</p>
                          <p className="text-sm text-muted-foreground">{lead.vehicleYear ? `${lead.vehicleYear}${lead.vehicleVariant ? ` • ${lead.vehicleVariant}` : ""}` : lead.vehicleVariant || "No variant"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">{formatVehicleMoney(lead.askingPrice)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant={getSellerLeadStatusBadgeVariant(lead.status)}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSellerLeadStatusClassName(lead.status)}`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-foreground">{getAssigneeLabel(lead.assigneeUserId, currentUserId)}</TableCell>
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Lead actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewLead(lead)}>
                              <EyeIcon />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditLead(lead)}>
                              <PencilIcon />
                              Edit
                            </DropdownMenuItem>
                            {lead.status !== "Purchased" && lead.status !== "Rejected" ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(buildConvertVehicleHref(lead))}>
                                  <ShuffleIcon />
                                  Convert to Vehicle
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update status</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={lead.status}>
                              {SELLER_LEAD_STATUSES.map((status) => (
                                <DropdownMenuRadioItem
                                  key={status}
                                  value={status}
                                  className={`font-medium ${getSellerLeadStatusTextClassName(status)}`}
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
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="seller leads"
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
              <SheetTitle className="text-lg">Add Seller Lead</SheetTitle>
              <SheetDescription>
                Capture a new acquisition inquiry and assign it to yourself by default.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.45fr)_280px]">
                <div className="min-h-0 overflow-y-auto px-6 py-6">
                  <div className="space-y-5">
                    <ApiErrorAlert title="Unable to create seller lead" message={getApiErrorMessage(createMutation.error, "")} />
                    <SellerLeadForm values={createForm} onChange={setCreateForm} />
                  </div>
                </div>
                <aside className="border-t bg-muted/15 px-6 py-6 lg:border-t-0 lg:border-l">
                  <div className="space-y-4">
                    <Card className="border-border/70 py-0 shadow-none">
                      <CardHeader className="border-b py-4">
                        <CardTitle className="text-base">Lead Summary</CardTitle>
                        <CardDescription>Live preview of the intake details you&apos;re capturing.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seller</p>
                          <p className="text-sm font-medium text-foreground">{createForm.sellerName || "Not set"}</p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehicle</p>
                          <p className="text-sm font-medium text-foreground">{createPreview.vehicle}</p>
                          <p className="text-sm text-muted-foreground">{createPreview.variant}</p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asking Price</p>
                          <p className="text-sm font-medium text-foreground">{formatVehicleMoney(createForm.askingPrice)}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                          <Badge
                            variant={getSellerLeadStatusBadgeVariant(createForm.status)}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSellerLeadStatusClassName(createForm.status)}`}
                          >
                            {createForm.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                      Use this drawer for quick intake. Conversion into inventory still happens later from the seller lead row action.
                    </div>
                  </div>
                </aside>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This lead will be assigned to <span className="font-medium text-foreground">you</span>.
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
          <DialogContent className="max-w-xl">
            {viewLead ? (
              <>
                <DialogHeader>
                  <DialogTitle>{viewLead.sellerName}</DialogTitle>
                  <DialogDescription>{getSellerLeadVehicleLabel(viewLead)}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</p><p className="text-sm text-foreground">{viewLead.contactNumber}</p></div>
                    <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p><p className="text-sm text-foreground">{viewLead.status}</p></div>
                    <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asking Price</p><p className="text-sm text-foreground">{formatVehicleMoney(viewLead.askingPrice)}</p></div>
                    <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assignee</p><p className="text-sm text-foreground">{getAssigneeLabel(viewLead.assigneeUserId, currentUserId)}</p></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="text-sm text-foreground">{viewLead.notes ?? "No notes recorded."}</p>
                  </div>
                  <ActivityHistoryPanel entityType="seller_lead" entityId={viewLead.id} />
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(editLead)} onOpenChange={(open) => !open && setEditLead(null)}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            {editLead ? (
              <EditSellerLeadDialogForm
                key={editLead.id}
                lead={editLead}
                mutation={updateMutation}
                currentUserId={currentUserId ?? null}
                onClose={() => setEditLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}

function EditSellerLeadDialogForm({
  lead,
  mutation,
  onClose,
}: {
  lead: SellerLead
  mutation: ReturnType<typeof useUpdateSellerLeadMutation>
  currentUserId: string | null
  onClose: () => void
}) {
  const [values, setValues] = React.useState<SellerLeadFormValues>(() => getSellerLeadFormValues(lead))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await mutation.mutateAsync(
      {
        id: lead.id,
        payload: parseUpdateSellerLeadPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Seller lead updated")
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Seller Lead</DialogTitle>
        <DialogDescription>Update seller details, vehicle context, and queue status.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert title="Unable to update seller lead" message={getApiErrorMessage(mutation.error, "")} />
        <SellerLeadForm values={values} onChange={setValues} />
        <DialogFooter>
          <SubmitButton type="submit" pending={mutation.isPending} pendingLabel="Saving changes">
            Save Changes
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  )
}
