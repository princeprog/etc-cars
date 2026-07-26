"use client"

import * as React from "react"
import Link from "next/link"
import {
  BanknoteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFinancingMutations } from "@/hooks/mutations/financing/use-financing-mutations"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import {
  useFinancingApplicationsQuery,
} from "@/hooks/queries/financing/use-financing-queries"
import { useUsersQuery } from "@/hooks/queries/auth/use-users-query"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { can } from "@/lib/permissions"
import { getApiErrorMessage } from "@/types/api"
import type {
  FinancingApplication,
  FinancingApplicationStatus,
} from "@/types/financing"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const APPLICATION_STATUSES: Array<"all" | FinancingApplicationStatus> = [
  "all",
  "draft",
  "collecting_requirements",
  "under_review",
  "needs_revision",
  "approved",
  "loan_released",
  "vehicle_released",
  "rejected",
  "cancelled",
]

export function FinancingScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const user = authQuery.data?.user
  const mutations = useFinancingMutations()
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [createOpen, setCreateOpen] = React.useState(false)
  const applicationsQuery = useFinancingApplicationsQuery({
    page,
    pageSize,
    search,
    status,
  })
  const buyerLeadsQuery = useBuyerLeadsQuery({ page: 1, pageSize: 100 })
  const vehiclesQuery = useVehiclesQuery()
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100, status: "active" })
  const financingRepresentatives = React.useMemo(
    () =>
      (usersQuery.data?.users ?? []).filter(
        (staff) => staff.roleName === "Financing Representative",
      ),
    [usersQuery.data?.users],
  )

  const applications = applicationsQuery.data?.applications ?? []
  const total = applicationsQuery.data?.total ?? 0
  const totalPages = applicationsQuery.data?.totalPages ?? 1

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await mutations.createApplication.mutateAsync(
      {
        buyerLeadId: String(form.get("buyerLeadId") ?? ""),
        vehicleId: String(form.get("vehicleId") ?? ""),
        representativeUserId: String(form.get("representativeUserId") ?? ""),
        assignedStaffUserId: user?.id,
        requestedAmount: String(form.get("requestedAmount") ?? "") || null,
        downPayment: String(form.get("downPayment") ?? "") || null,
        termMonths: Number(form.get("termMonths") || 0) || null,
      },
      {
        onSuccess: () => {
          toast.success("Financing application created")
          setCreateOpen(false)
        },
      },
    )
  }

  if (applicationsQuery.isPending) {
    return (
      <AuthenticatedAppShell title="Financing">
        <ModuleLoadingState label="Loading financing applications..." />
      </AuthenticatedAppShell>
    )
  }

  return (
    <AuthenticatedAppShell title="Financing">
      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Financing Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              Track buyer requirements, review progress, and release-ready loans.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/settings/financing">Settings</Link>
            </Button>
            {can(user, "financing.create") ? (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon />
                New Application
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
              <div className="relative md:max-w-sm md:flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search buyer, vehicle, application..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="md:w-56">
                  <FilterIcon className="size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {formatStatus(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ApiErrorAlert
              title="Unable to load financing applications"
              message={getApiErrorMessage(applicationsQuery.error, "")}
            />

            {applications.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <FinancingApplicationRow
                        key={application.id}
                        application={application}
                      />
                    ))}
                  </TableBody>
                </Table>
                <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    Showing {applications.length} of {total}
                  </p>
                  <div className="flex items-center gap-3">
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[76px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPage((current) => current - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No financing applications"
                  description="Create an application once a buyer chooses financing for a vehicle."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Financing Application</DialogTitle>
              <DialogDescription>
                Link one buyer lead, one vehicle, and an assigned financing
                representative.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <ApiErrorAlert
                title="Unable to create financing application"
                message={getApiErrorMessage(
                  mutations.createApplication.error,
                  "",
                )}
              />
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Buyer lead</FieldLabel>
                  <Select name="buyerLeadId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(buyerLeadsQuery.data?.buyerLeads ?? []).map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.buyerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Vehicle</FieldLabel>
                  <Select name="vehicleId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {(vehiclesQuery.data?.vehicles ?? []).map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.stockNumber} - {vehicle.year}{" "}
                          {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Representative</FieldLabel>
                  <Select name="representativeUserId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select representative" />
                    </SelectTrigger>
                    <SelectContent>
                      {financingRepresentatives.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Requested amount</FieldLabel>
                  <Input name="requestedAmount" placeholder="850000.00" />
                </Field>
                <Field>
                  <FieldLabel>Down payment</FieldLabel>
                  <Input name="downPayment" placeholder="150000.00" />
                </Field>
                <Field>
                  <FieldLabel>Term months</FieldLabel>
                  <Input name="termMonths" type="number" min={1} />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutations.createApplication.isPending}>
                  Create Application
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}

function FinancingApplicationRow({
  application,
}: {
  application: FinancingApplication
}) {
  const progress = application.requirementProgress
  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/financing/${application.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {application.applicationNumber}
        </Link>
      </TableCell>
      <TableCell>{application.buyer.name}</TableCell>
      <TableCell>{application.vehicle.stockNumber}</TableCell>
      <TableCell>
        {progress.accepted}/{progress.total} accepted
      </TableCell>
      <TableCell>
        <Badge variant="outline">{formatStatus(application.status)}</Badge>
      </TableCell>
    </TableRow>
  )
}

export function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function CopyUploadLinkButton({ token }: { token: string }) {
  async function copy() {
    const url = `${window.location.origin}/financing/upload/${token}`
    await navigator.clipboard.writeText(url)
    toast.success("Secure upload link copied")
  }

  return (
    <Button type="button" onClick={copy}>
      <CopyIcon />
      Copy Link
    </Button>
  )
}

export function FinancingIconBadge() {
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-md border bg-muted">
      <BanknoteIcon className="size-4" />
    </span>
  )
}
