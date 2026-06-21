"use client"

import * as React from "react"
import Image from "next/image"
import { format, formatDistanceToNow, isSameMonth } from "date-fns"
import {
  BadgeDollarSignIcon,
  BarChart3Icon,
  DollarSignIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { resolveApiAssetUrl } from "@/constants/api-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useLinkBuyerLeadVehicleMutation } from "@/hooks/mutations/buyer-leads/use-link-buyer-lead-vehicle-mutation"
import { useCreateSaleMutation } from "@/hooks/mutations/sales/use-create-sale-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useSalesQuery } from "@/hooks/queries/sales/use-sales-query"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { getApiErrorMessage } from "@/types/api"
import type { BuyerLead } from "@/types/buyer-leads"
import type { SaleWithDetails } from "@/types/sales"

type SalesFilterStatus = "all" | "finalized" | "commission_locked" | "needs_review"
type SalesFilterAgent = "all" | "mine"
type SalesFilterRange = "all" | "this_month" | "last_30_days"

type SaleFormValues = {
  buyerLeadId: string
  vehicleId: string
  saleDate: string
  finalSaleAmount: string
  agentName: string
  commissionOverrideAmount: string
  commissionOverrideReason: string
  buyerClosingNote: string
}

function getEmptySaleFormValues(defaultAgentName = ""): SaleFormValues {
  return {
    buyerLeadId: "",
    vehicleId: "",
    saleDate: "",
    finalSaleAmount: "",
    agentName: defaultAgentName,
    commissionOverrideAmount: "",
    commissionOverrideReason: "",
    buyerClosingNote: "",
  }
}

function formatMoney(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return `PHP ${value}`
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

function getSaleStatus(sale: SaleWithDetails): Exclude<SalesFilterStatus, "all"> {
  if (!sale.commissionLocked) {
    return "needs_review"
  }

  if (sale.commission.overrideAmount) {
    return "commission_locked"
  }

  return "finalized"
}

function getSaleStatusLabel(status: Exclude<SalesFilterStatus, "all">) {
  switch (status) {
    case "finalized":
      return "Finalized"
    case "commission_locked":
      return "Commission Locked"
    case "needs_review":
      return "Needs Review"
    default:
      return status
  }
}

function getSaleStatusClassName(status: Exclude<SalesFilterStatus, "all">) {
  switch (status) {
    case "finalized":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "commission_locked":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
    case "needs_review":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    default:
      return ""
  }
}

function filterSales(
  sales: SaleWithDetails[],
  searchTerm: string,
  statusFilter: SalesFilterStatus,
  agentFilter: SalesFilterAgent,
  rangeFilter: SalesFilterRange,
  currentUserName?: string,
) {
  const now = new Date()
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return sales.filter((sale) => {
    const status = getSaleStatus(sale)
    const haystack = [
      sale.saleNumber,
      sale.id,
      sale.vehicle.stockNumber,
      sale.vehicle.brand,
      sale.vehicle.model,
      sale.agentName ?? "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = normalizedSearch ? haystack.includes(normalizedSearch) : true
    const matchesStatus = statusFilter === "all" ? true : status === statusFilter
    const matchesAgent =
      agentFilter === "all"
        ? true
        : (sale.agentName ?? "").trim().toLowerCase() === (currentUserName ?? "").trim().toLowerCase()

    const saleDate = new Date(sale.saleDate)
    const matchesRange =
      rangeFilter === "all"
        ? true
        : rangeFilter === "this_month"
          ? isSameMonth(saleDate, now)
          : saleDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

    return matchesSearch && matchesStatus && matchesAgent && matchesRange
  })
}

function SalesForm({
  values,
  onChange,
  buyerLeadOptions,
  vehicleOptions,
  selectedBuyerLead,
  availableVehicles,
  inlineLinkVehicleId,
  onInlineLinkVehicleIdChange,
  onLinkVehicle,
  linkVehiclePending,
  linkVehicleError,
  currentUserName,
}: {
  values: SaleFormValues
  onChange: (values: SaleFormValues) => void
  buyerLeadOptions: { id: string; label: string }[]
  vehicleOptions: { id: string; label: string }[]
  selectedBuyerLead?: BuyerLead
  availableVehicles: { id: string; label: string }[]
  inlineLinkVehicleId: string
  onInlineLinkVehicleIdChange: (value: string) => void
  onLinkVehicle: () => void
  linkVehiclePending: boolean
  linkVehicleError?: unknown
  currentUserName?: string
}) {
  const inlineVehicleSelectTriggerRef = React.useRef<HTMLButtonElement | null>(null)

  function updateField<K extends keyof SaleFormValues>(key: K, value: SaleFormValues[K]) {
    if (key === "buyerLeadId") {
      onChange({ ...values, buyerLeadId: value as string, vehicleId: "" })
      return
    }

    onChange({ ...values, [key]: value })
  }

  const hasSelectedBuyerLead = Boolean(values.buyerLeadId)
  const hasLinkedVehicles = Boolean(selectedBuyerLead?.vehicles.length)

  React.useEffect(() => {
    if (!hasSelectedBuyerLead || hasLinkedVehicles) {
      return
    }

    const timer = window.setTimeout(() => {
      inlineVehicleSelectTriggerRef.current?.focus()
    }, 120)

    return () => window.clearTimeout(timer)
  }, [hasLinkedVehicles, hasSelectedBuyerLead])

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Deal Details</h3>
          <p className="text-sm text-muted-foreground">
            Finalize a sale using a buyer lead that is already linked to a vehicle.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="saleBuyerLeadId">Buyer lead</FieldLabel>
            <Select value={values.buyerLeadId} onValueChange={(value) => updateField("buyerLeadId", value)}>
              <SelectTrigger id="saleBuyerLeadId">
                <SelectValue placeholder="Select buyer lead" />
              </SelectTrigger>
              <SelectContent>
                {buyerLeadOptions.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="saleVehicleId">Linked vehicle</FieldLabel>
            <Select value={values.vehicleId} onValueChange={(value) => updateField("vehicleId", value)}>
              <SelectTrigger id="saleVehicleId" disabled={!hasSelectedBuyerLead || !hasLinkedVehicles}>
                <SelectValue
                  placeholder={
                    !hasSelectedBuyerLead
                      ? "Select buyer lead first"
                      : hasLinkedVehicles
                        ? "Select linked vehicle"
                        : "Link a vehicle below first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {hasSelectedBuyerLead && !hasLinkedVehicles ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Link a vehicle to continue</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBuyerLead?.buyerName ?? "This buyer"} has no linked vehicle yet. Link one available unit here and continue finalizing the sale without leaving this screen.
                </p>
              </div>
              <ApiErrorAlert
                title="Unable to link vehicle"
                message={getApiErrorMessage(linkVehicleError, "")}
              />
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <Select value={inlineLinkVehicleId} onValueChange={onInlineLinkVehicleIdChange}>
                  <SelectTrigger ref={inlineVehicleSelectTriggerRef}>
                    <SelectValue placeholder="Select an available vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SubmitButton
                  type="button"
                  pending={linkVehiclePending}
                  pendingLabel="Linking vehicle"
                  disabled={!inlineLinkVehicleId || availableVehicles.length === 0}
                  onClick={onLinkVehicle}
                >
                  Link Vehicle
                </SubmitButton>
              </div>
              {!availableVehicles.length ? (
                <p className="text-sm text-muted-foreground">
                  No available vehicles can be linked right now.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="saleDate">Sale date</FieldLabel>
            <Input id="saleDate" type="datetime-local" value={values.saleDate} onChange={(e) => updateField("saleDate", e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="finalSaleAmount">Final sale amount</FieldLabel>
            <Input id="finalSaleAmount" value={values.finalSaleAmount} onChange={(e) => updateField("finalSaleAmount", e.target.value)} placeholder="1250000" required />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Commission & Closing</h3>
          <p className="text-sm text-muted-foreground">
            Record the sales agent and any override details required for final commission locking.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="agentName">Agent name</FieldLabel>
            <Input id="agentName" value={values.agentName} placeholder={currentUserName ?? "Assigned agent"} onChange={(e) => updateField("agentName", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="commissionOverrideAmount">Commission override amount</FieldLabel>
            <Input id="commissionOverrideAmount" value={values.commissionOverrideAmount} onChange={(e) => updateField("commissionOverrideAmount", e.target.value)} placeholder="1500" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="commissionOverrideReason">Commission override reason</FieldLabel>
          <Input id="commissionOverrideReason" value={values.commissionOverrideReason} onChange={(e) => updateField("commissionOverrideReason", e.target.value)} placeholder="Used only when override amount is entered" />
        </Field>
        <Field>
          <FieldLabel htmlFor="buyerClosingNote">Buyer closing note</FieldLabel>
          <Textarea id="buyerClosingNote" rows={5} value={values.buyerClosingNote} onChange={(e) => updateField("buyerClosingNote", e.target.value)} placeholder="Buyer completed down payment and confirmed release schedule for unit pickup." />
        </Field>
      </section>
    </FieldGroup>
  )
}

export function SalesScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const buyerLeadsQuery = useBuyerLeadsQuery()
  const salesQuery = useSalesQuery()
  const availableVehiclesQuery = useVehiclesQuery({ status: "Available" })
  const createMutation = useCreateSaleMutation()
  const linkVehicleMutation = useLinkBuyerLeadVehicleMutation()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<SalesFilterStatus>("all")
  const [agentFilter, setAgentFilter] = React.useState<SalesFilterAgent>("all")
  const [rangeFilter, setRangeFilter] = React.useState<SalesFilterRange>("all")
  const [form, setForm] = React.useState<SaleFormValues>(() => getEmptySaleFormValues())
  const [inlineLinkVehicleId, setInlineLinkVehicleId] = React.useState("")

  const currentUserName = authQuery.data?.user.fullName ?? ""
  const buyerLeads = buyerLeadsQuery.data?.buyerLeads ?? []
  const sales = salesQuery.data?.sales ?? []

  const selectedBuyerLead = buyerLeads.find((lead) => lead.id === form.buyerLeadId)
  const filteredSales = filterSales(sales, searchTerm, statusFilter, agentFilter, rangeFilter, currentUserName)

  const totalSales = sales.length
  const revenueTotal = sales.reduce((sum, sale) => sum + Number(sale.finalSaleAmount || 0), 0)
  const grossProfitTotal = sales.reduce((sum, sale) => sum + Number(sale.grossProfitAmount || 0), 0)
  const commissionTotal = sales.reduce((sum, sale) => sum + Number(sale.commission.finalAmount || 0), 0)

  const buyerLeadOptions = buyerLeads.map((lead) => ({
    id: lead.id,
    label: `${lead.buyerName} • ${lead.status}`,
  }))

  const vehicleOptions =
    selectedBuyerLead?.vehicles.map((vehicle) => ({
      id: vehicle.id,
      label: `${vehicle.stockNumber} • ${vehicle.brand} ${vehicle.model}`,
    })) ?? []

  const inlineAvailableVehicleOptions =
    availableVehiclesQuery.data?.vehicles
      .filter((vehicle) => !selectedBuyerLead?.vehicles.some((linkedVehicle) => linkedVehicle.id === vehicle.id))
      .map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.stockNumber} • ${vehicle.brand} ${vehicle.model}`,
      })) ?? []

  React.useEffect(() => {
    setInlineLinkVehicleId("")
  }, [form.buyerLeadId])

  React.useEffect(() => {
    if (!selectedBuyerLead) {
      return
    }

    if (selectedBuyerLead.vehicles.length === 1) {
      const onlyLinkedVehicleId = selectedBuyerLead.vehicles[0]?.id

      if (onlyLinkedVehicleId && form.vehicleId !== onlyLinkedVehicleId) {
        setForm((current) => ({
          ...current,
          vehicleId: onlyLinkedVehicleId,
        }))
      }

      return
    }

    if (
      form.vehicleId &&
      !selectedBuyerLead.vehicles.some((vehicle) => vehicle.id === form.vehicleId)
    ) {
      setForm((current) => ({
        ...current,
        vehicleId: "",
      }))
    }
  }, [form.vehicleId, selectedBuyerLead])

  async function handleInlineLinkVehicle() {
    if (!selectedBuyerLead || !inlineLinkVehicleId) {
      return
    }

    await linkVehicleMutation.mutateAsync(
      { id: selectedBuyerLead.id, vehicleId: inlineLinkVehicleId },
      {
        onSuccess: () => {
          setForm((current) => ({
            ...current,
            vehicleId: inlineLinkVehicleId,
          }))
          setInlineLinkVehicleId("")
          toast.success("Vehicle linked to buyer lead")
        },
      },
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(
      {
        buyerLeadId: form.buyerLeadId,
        vehicleId: form.vehicleId,
        saleDate: new Date(form.saleDate).toISOString(),
        finalSaleAmount: form.finalSaleAmount,
        agentName: form.agentName || currentUserName || null,
        commissionOverrideAmount: form.commissionOverrideAmount || null,
        commissionOverrideReason: form.commissionOverrideReason || null,
        buyerClosingNote: form.buyerClosingNote || null,
      },
      {
        onSuccess: () => {
          toast.success("Sale finalized")
          setCreateOpen(false)
          setForm(getEmptySaleFormValues())
          setInlineLinkVehicleId("")
        },
      },
    )
  }

  const summaryCards = [
    {
      title: "Total Sales",
      value: totalSales.toString(),
      caption: "Closed deals",
      icon: ReceiptTextIcon,
      iconWrapClassName: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
    },
    {
      title: "Revenue",
      value: formatMoney(String(revenueTotal)),
      caption: "Booked revenue",
      icon: DollarSignIcon,
      iconWrapClassName: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    },
    {
      title: "Gross Profit",
      value: formatMoney(String(grossProfitTotal)),
      caption: "Closed deals",
      icon: BarChart3Icon,
      iconWrapClassName: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    },
    {
      title: "Commission Payouts",
      value: formatMoney(String(commissionTotal)),
      caption: "Locked commissions",
      icon: BadgeDollarSignIcon,
      iconWrapClassName: "bg-orange-50 text-orange-600 dark:bg-orange-950/40",
    },
  ]

  return (
    <AuthenticatedAppShell title="Sales">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
              <p className="text-sm text-muted-foreground">
                Track finalized deals, review deal value, and monitor commission outcomes across the sales pipeline.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Finalize Sale
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search sales, buyer, vehicle, or ID..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SalesFilterStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="finalized">Finalized</SelectItem>
                <SelectItem value="commission_locked">Commission Locked</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={(value) => setAgentFilter(value as SalesFilterAgent)}>
              <SelectTrigger>
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="mine">My Sales</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rangeFilter} onValueChange={(value) => setRangeFilter(value as SalesFilterRange)}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setAgentFilter("all")
                setRangeFilter("all")
              }}
            >
              <RotateCcwIcon />
              Reset
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <Card key={card.title} className="border-border/70 py-0 shadow-xs">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{card.title}</p>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.caption}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {salesQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading sales" />
              </div>
            ) : salesQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert title="Unable to load sales" message={getApiErrorMessage(salesQuery.error, "")} />
              </div>
            ) : filteredSales.length ? (
              <Table className="w-full border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Sale</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Vehicle</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Buyer</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Sale Date</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Final Amount</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Gross Profit</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Commission</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const status = getSaleStatus(sale)
                    const previewPhoto = sale.vehicle.photos[0]

                    return (
                      <TableRow key={sale.id} className="hover:bg-muted/15">
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{sale.saleNumber}</p>
                            <p className="text-xs text-muted-foreground">{sale.agentName ?? "Unassigned agent"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="flex items-start gap-3">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                              {previewPhoto ? (
                                <Image
                                  src={resolveApiAssetUrl(previewPhoto.fileUrl)}
                                  alt={`${sale.vehicle.stockNumber} preview`}
                                  fill
                                  unoptimized
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{sale.vehicle.stockNumber}</p>
                              <p className="text-sm text-foreground">{sale.vehicle.brand} {sale.vehicle.model}</p>
                              <p className="text-xs text-muted-foreground">
                                {sale.vehicle.year}
                                {sale.vehicle.variant ? ` • ${sale.vehicle.variant}` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{buyerLeads.find((lead) => lead.id === sale.buyerLeadId)?.buyerName ?? "Buyer not found"}</p>
                            <p className="text-xs text-muted-foreground">{buyerLeads.find((lead) => lead.id === sale.buyerLeadId)?.contactNumber ?? "No contact available"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{format(new Date(sale.saleDate), "MMM d, yyyy")}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(sale.saleDate), "h:mm a")}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-foreground">
                          {formatMoney(sale.finalSaleAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                          {formatMoney(sale.grossProfitAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{formatMoney(sale.commission.finalAmount)}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(sale.updatedAt), { addSuffix: true })}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSaleStatusClassName(status)}`}>
                            {getSaleStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for sale ${sale.id}`}>
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Sale actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(sale.saleNumber)
                                  toast.success("Sale number copied")
                                }}
                              >
                                Copy Sale Number
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(sale.vehicle.stockNumber)
                                  toast.success("Vehicle stock number copied")
                                }}
                              >
                                Copy Vehicle Stock
                              </DropdownMenuItem>
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
                <EmptyState title="No sales yet" description="Finalize the first sale to validate the full inventory-to-dashboard workflow." />
              </div>
            )}
          </CardContent>
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Finalize Sale</SheetTitle>
              <SheetDescription>
                Close a deal, lock commission data, and move the linked vehicle into sold inventory.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.45fr)_280px]">
                <div className="min-h-0 overflow-y-auto px-6 py-6">
                  <div className="space-y-5">
                    <ApiErrorAlert title="Unable to finalize sale" message={getApiErrorMessage(createMutation.error, "")} />
                    <SalesForm
                      values={form}
                      onChange={setForm}
                      buyerLeadOptions={buyerLeadOptions}
                      vehicleOptions={vehicleOptions}
                      selectedBuyerLead={selectedBuyerLead}
                      availableVehicles={inlineAvailableVehicleOptions}
                      inlineLinkVehicleId={inlineLinkVehicleId}
                      onInlineLinkVehicleIdChange={setInlineLinkVehicleId}
                      onLinkVehicle={handleInlineLinkVehicle}
                      linkVehiclePending={linkVehicleMutation.isPending}
                      linkVehicleError={linkVehicleMutation.error}
                      currentUserName={currentUserName}
                    />
                  </div>
                </div>
                <aside className="border-t bg-muted/15 px-6 py-6 lg:border-t-0 lg:border-l">
                  <div className="space-y-4">
                    <Card className="border-border/70 py-0 shadow-none">
                      <CardHeader className="border-b py-4">
                        <CardTitle className="text-base">Sale Summary</CardTitle>
                        <CardDescription>Live preview of the finalized sale record you&apos;re creating.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buyer Lead</p>
                          <p className="text-sm font-medium text-foreground">
                            {buyerLeadOptions.find((lead) => lead.id === form.buyerLeadId)?.label ?? "No buyer lead selected"}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehicle</p>
                          <p className="text-sm font-medium text-foreground">
                            {vehicleOptions.find((vehicle) => vehicle.id === form.vehicleId)?.label ?? "No vehicle selected"}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Final Amount</p>
                          <p className="text-sm font-medium text-foreground">{formatMoney(form.finalSaleAmount)}</p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent</p>
                          <p className="text-sm font-medium text-foreground">{form.agentName || currentUserName || "Not set"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </aside>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Dashboard metrics and inventory status update immediately after finalization.
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Finalizing sale">
                    Finalize Sale
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </AuthenticatedAppShell>
  )
}
