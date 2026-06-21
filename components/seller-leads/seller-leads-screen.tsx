"use client"

import * as React from "react"
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
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useConvertSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-convert-seller-lead-mutation"
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import {
  SELLER_LEAD_STATUSES,
  type CreateSellerLeadPayload,
  type SellerLead,
  type SellerLeadStatus,
  type UpdateSellerLeadPayload,
} from "@/types/seller-leads"
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicles"
import { formatVehicleMoney } from "../vehicles/vehicles.helpers"

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

type ConvertSellerLeadFormValues = {
  stockNumber: string
  year: string
  variant: string
  purchasePrice: string
  targetSellingPrice: string
  minimumAcceptablePrice: string
  status: VehicleStatus
  photoUrls: string
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

function getEmptyConvertSellerLeadFormValues(lead?: SellerLead | null): ConvertSellerLeadFormValues {
  return {
    stockNumber: "",
    year: lead?.vehicleYear ? String(lead.vehicleYear) : "",
    variant: lead?.vehicleVariant ?? "",
    purchasePrice: lead?.askingPrice ?? "",
    targetSellingPrice: "",
    minimumAcceptablePrice: "",
    status: "Incoming",
    photoUrls: "",
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

function parsePhotoLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((fileUrl, index) => ({ fileUrl, sortOrder: index }))
}

function getSellerLeadVehicleLabel(lead: SellerLead) {
  return [lead.vehicleBrand, lead.vehicleModel, lead.vehicleYear ? String(lead.vehicleYear) : "", lead.vehicleVariant ?? ""]
    .filter(Boolean)
    .join(" • ")
}

function filterSellerLeads(leads: SellerLead[], searchTerm: string, status: SellerLeadStatus | "all") {
  const normalized = searchTerm.trim().toLowerCase()

  return leads.filter((lead) => {
    const matchesStatus = status === "all" ? true : lead.status === status
    const haystack = [
      lead.sellerName,
      lead.contactNumber,
      lead.vehicleBrand,
      lead.vehicleModel,
      lead.vehicleVariant ?? "",
      lead.vehicleYear ? String(lead.vehicleYear) : "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = normalized ? haystack.includes(normalized) : true
    return matchesStatus && matchesSearch
  })
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
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="sellerName">Seller name</FieldLabel>
        <Input id="sellerName" value={values.sellerName} onChange={(e) => updateField("sellerName", e.target.value)} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
        <Input id="contactNumber" value={values.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} required />
      </Field>
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
          <FieldLabel htmlFor="askingPrice">Asking price</FieldLabel>
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
        <Textarea id="sellerNotes" rows={4} value={values.notes} onChange={(e) => updateField("notes", e.target.value)} />
      </Field>
    </FieldGroup>
  )
}

export function SellerLeadsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const sellerLeadsQuery = useSellerLeadsQuery()
  const createMutation = useCreateSellerLeadMutation()
  const updateMutation = useUpdateSellerLeadMutation()
  const convertMutation = useConvertSellerLeadMutation()

  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<SellerLeadStatus | "all">("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewLead, setViewLead] = React.useState<SellerLead | null>(null)
  const [editLead, setEditLead] = React.useState<SellerLead | null>(null)
  const [convertLead, setConvertLead] = React.useState<SellerLead | null>(null)
  const [createForm, setCreateForm] = React.useState<SellerLeadFormValues>(getEmptySellerLeadFormValues)

  const currentUserId = authQuery.data?.user.id
  const leads = sellerLeadsQuery.data?.sellerLeads ?? []
  const filteredLeads = filterSellerLeads(leads, searchTerm, activeFilter)

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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search seller, contact, or vehicle"
                  className="pl-9"
                />
              </div>
              <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as SellerLeadStatus | "all")}>
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
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredLeads.length} of {leads.length} seller leads
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
            ) : filteredLeads.length ? (
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
                  {filteredLeads.map((lead) => (
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
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">{lead.status}</Badge>
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
                                <DropdownMenuItem onClick={() => setConvertLead(lead)}>
                                  <ShuffleIcon />
                                  Convert to Vehicle
                                </DropdownMenuItem>
                              </>
                            ) : null}
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
        </Card>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Seller Lead</DialogTitle>
              <DialogDescription>Capture a new acquisition inquiry and assign it to yourself by default.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <ApiErrorAlert title="Unable to create seller lead" message={getApiErrorMessage(createMutation.error, "")} />
              <SellerLeadForm values={createForm} onChange={setCreateForm} />
              <DialogFooter>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating lead">
                  Create Seller Lead
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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

        <Dialog open={Boolean(convertLead)} onOpenChange={(open) => !open && setConvertLead(null)}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            {convertLead ? (
              <ConvertSellerLeadDialogForm
                key={convertLead.id}
                lead={convertLead}
                mutation={convertMutation}
                onClose={() => setConvertLead(null)}
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

function ConvertSellerLeadDialogForm({
  lead,
  mutation,
  onClose,
}: {
  lead: SellerLead
  mutation: ReturnType<typeof useConvertSellerLeadMutation>
  onClose: () => void
}) {
  const [values, setValues] = React.useState<ConvertSellerLeadFormValues>(() => getEmptyConvertSellerLeadFormValues(lead))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await mutation.mutateAsync(
      {
        id: lead.id,
        payload: {
          stockNumber: values.stockNumber,
          year: values.year ? Number(values.year) : undefined,
          variant: values.variant || null,
          purchasePrice: values.purchasePrice || null,
          targetSellingPrice: values.targetSellingPrice || null,
          minimumAcceptablePrice: values.minimumAcceptablePrice || null,
          status: values.status,
          photos: parsePhotoLines(values.photoUrls),
        },
      },
      {
        onSuccess: () => {
          toast.success("Seller lead converted to inventory")
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Convert to Vehicle</DialogTitle>
        <DialogDescription>
          Create a vehicle record from {lead.sellerName}&apos;s lead using the existing conversion workflow.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert title="Unable to convert seller lead" message={getApiErrorMessage(mutation.error, "")} />
        <FieldGroup className="gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field><FieldLabel htmlFor="stockNumber">Stock number</FieldLabel><Input id="stockNumber" value={values.stockNumber} onChange={(e) => setValues((v) => ({ ...v, stockNumber: e.target.value }))} required /></Field>
            <Field><FieldLabel htmlFor="convertYear">Vehicle year</FieldLabel><Input id="convertYear" type="number" value={values.year} onChange={(e) => setValues((v) => ({ ...v, year: e.target.value }))} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field><FieldLabel htmlFor="variant">Variant</FieldLabel><Input id="variant" value={values.variant} onChange={(e) => setValues((v) => ({ ...v, variant: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="convertStatus">Vehicle status</FieldLabel><Select value={values.status} onValueChange={(value) => setValues((v) => ({ ...v, status: value as VehicleStatus }))}><SelectTrigger id="convertStatus"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_STATUSES.filter((status) => status !== "Sold").map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field><FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel><Input id="purchasePrice" value={values.purchasePrice} onChange={(e) => setValues((v) => ({ ...v, purchasePrice: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="targetSellingPrice">Target selling price</FieldLabel><Input id="targetSellingPrice" value={values.targetSellingPrice} onChange={(e) => setValues((v) => ({ ...v, targetSellingPrice: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="minimumAcceptablePrice">Minimum acceptable price</FieldLabel><Input id="minimumAcceptablePrice" value={values.minimumAcceptablePrice} onChange={(e) => setValues((v) => ({ ...v, minimumAcceptablePrice: e.target.value }))} /></Field>
          </div>
          <Field>
            <FieldLabel htmlFor="photoUrls">Photo URLs</FieldLabel>
            <Textarea id="photoUrls" rows={4} value={values.photoUrls} onChange={(e) => setValues((v) => ({ ...v, photoUrls: e.target.value }))} placeholder="One URL per line" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <SubmitButton type="submit" pending={mutation.isPending} pendingLabel="Converting lead">
            Convert to Vehicle
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  )
}
