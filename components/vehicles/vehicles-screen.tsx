"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon, SearchIcon, Settings2Icon } from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { getApiErrorMessage } from "@/types/api"
import type { Vehicle } from "@/types/vehicles"
import { VehicleDetailDialog } from "./vehicle-detail-dialog"
import {
  filterVehicles,
  getVehicleStatusCounts,
  VEHICLE_FILTERS,
  type VehicleFilterValue,
} from "./vehicles.helpers"
import {
  VEHICLE_QUALITY_FILTERS,
  type VehicleQualityFilterValue,
} from "./vehicle-quality.helpers"
import {
  DEFAULT_VISIBLE_VEHICLE_COLUMNS,
  VEHICLE_COLUMN_MANAGER_OPTIONS,
  type VisibleVehicleColumns,
  VehiclesTable,
} from "./vehicles-table"

const VEHICLE_COLUMNS_STORAGE_KEY = "etc-cars:vehicles:visible-columns"
const VEHICLES_PAGE_SIZE = 10

function getStoredVisibleColumns(): VisibleVehicleColumns {
  if (typeof window === "undefined") {
    return DEFAULT_VISIBLE_VEHICLE_COLUMNS
  }

  try {
    const rawValue = window.localStorage.getItem(VEHICLE_COLUMNS_STORAGE_KEY)

    if (!rawValue) {
      return DEFAULT_VISIBLE_VEHICLE_COLUMNS
    }

    const parsedValue = JSON.parse(rawValue) as Partial<VisibleVehicleColumns>

    return {
      stockNumber: parsedValue.stockNumber ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.stockNumber,
      year: parsedValue.year ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.year,
      status: parsedValue.status ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.status,
      quality: parsedValue.quality ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.quality,
      targetPrice: parsedValue.targetPrice ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.targetPrice,
      minimumPrice: parsedValue.minimumPrice ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.minimumPrice,
      mileage: parsedValue.mileage ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.mileage,
      photos: parsedValue.photos ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.photos,
      updated: parsedValue.updated ?? DEFAULT_VISIBLE_VEHICLE_COLUMNS.updated,
    }
  } catch {
    return DEFAULT_VISIBLE_VEHICLE_COLUMNS
  }
}

export function VehiclesScreen() {
  const router = useRouter()
  const vehiclesQuery = useVehiclesQuery()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<VehicleFilterValue>("all")
  const [qualityFilter, setQualityFilter] = React.useState<VehicleQualityFilterValue>("all")
  const [page, setPage] = React.useState(1)
  const [viewVehicle, setViewVehicle] = React.useState<Vehicle | null>(null)
  const [visibleColumns, setVisibleColumns] = React.useState<VisibleVehicleColumns>(getStoredVisibleColumns)
  const [columnSearchTerm, setColumnSearchTerm] = React.useState("")

  const vehicles = vehiclesQuery.data?.vehicles ?? []
  const counts = getVehicleStatusCounts(vehicles)
  const filteredVehicles = filterVehicles(vehicles, searchTerm, activeFilter).filter((vehicle) =>
    qualityFilter === "all" ? true : vehicle.qualityScore?.grade === qualityFilter,
  )
  const totalFilteredVehicles = filteredVehicles.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredVehicles / VEHICLES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedVehicles = React.useMemo(() => {
    const start = (currentPage - 1) * VEHICLES_PAGE_SIZE
    return filteredVehicles.slice(start, start + VEHICLES_PAGE_SIZE)
  }, [currentPage, filteredVehicles])
  const filteredColumnOptions = VEHICLE_COLUMN_MANAGER_OPTIONS.filter((column) =>
    column.label.toLowerCase().includes(columnSearchTerm.trim().toLowerCase()),
  )

  function toggleColumn(column: keyof VisibleVehicleColumns, checked: boolean) {
    setVisibleColumns((current) => ({
      ...current,
      [column]: checked,
    }))
  }

  function restoreColumns() {
    setVisibleColumns(DEFAULT_VISIBLE_VEHICLE_COLUMNS)
    setColumnSearchTerm("")
  }

  React.useEffect(() => {
    window.localStorage.setItem(
      VEHICLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    )
  }, [visibleColumns])

  return (
    <AuthenticatedAppShell title="Vehicles">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Vehicles</h2>
              <p className="text-sm text-muted-foreground">
                Manage inventory, review operational readiness, and update vehicle details from one table-first workspace.
              </p>
            </div>
            <Button asChild>
              <Link href="/vehicles/new">Add Vehicle</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {VEHICLE_FILTERS.map((filter) => {
              const count =
                filter.value === "all" ? counts.all : counts[filter.value]

              return (
                <div
                  key={filter.value}
                  className={[
                    "rounded-xl border border-border/70 bg-card px-4 py-3 text-left shadow-xs",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium tracking-normal text-muted-foreground">
                        {filter.label}
                      </p>
                      <p className="text-2xl font-semibold leading-none text-foreground">
                        {count}
                      </p>
                    </div>
                    <span
                      className={[
                        "mt-0.5 inline-flex h-2.5 w-2.5 rounded-full",
                        "bg-border",
                      ].join(" ")}
                    />
                  </div>
                </div>
              )
            })}
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
                  placeholder="Search stock no., make, model, or variant"
                  className="pl-9"
                />
              </div>
              <Select value={activeFilter} onValueChange={(value) => {
                setActiveFilter(value as VehicleFilterValue)
                setPage(1)
              }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={qualityFilter} onValueChange={(value) => {
                setQualityFilter(value as VehicleQualityFilterValue)
                setPage(1)
              }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by quality" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_QUALITY_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setActiveFilter("all")
                  setQualityFilter("all")
                  setPage(1)
                }}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedVehicles.length} of {totalFilteredVehicles} filtered vehicles
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Configure vehicle table columns">
                    <Settings2Icon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[320px] gap-3 rounded-2xl p-0">
                  <PopoverHeader className="flex-row items-center justify-between gap-3 border-b px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <PopoverTitle className="text-base">Manage Columns</PopoverTitle>
                        <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-border/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {VEHICLE_COLUMN_MANAGER_OPTIONS.length}
                        </span>
                      </div>
                      <PopoverDescription className="text-xs">
                        Control which fields stay visible in the vehicles table.
                      </PopoverDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto px-0 text-sm font-medium text-primary hover:bg-transparent hover:text-primary/80"
                      onClick={restoreColumns}
                    >
                      Restore
                    </Button>
                  </PopoverHeader>
                  <div className="px-4 pt-1 pb-4">
                    <div className="relative mb-3">
                      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={columnSearchTerm}
                        onChange={(event) => setColumnSearchTerm(event.target.value)}
                        placeholder="Search columns"
                        className="h-10 rounded-xl pl-9"
                      />
                    </div>
                    <div className="max-h-[360px] overflow-y-auto rounded-xl border border-border/70 bg-background">
                      {filteredColumnOptions.length ? (
                        filteredColumnOptions.map((column, index) => {
                          const isVisible = column.alwaysVisible
                            ? true
                            : visibleColumns[column.key]

                          return (
                            <button
                              key={column.id}
                              type="button"
                              disabled={column.alwaysVisible}
                              onClick={() => {
                                if (!column.alwaysVisible) {
                                  toggleColumn(column.key, !visibleColumns[column.key])
                                }
                              }}
                              className={[
                                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm",
                                index !== filteredColumnOptions.length - 1 ? "border-b border-border/70" : "",
                                column.alwaysVisible
                                  ? "cursor-default bg-background"
                                  : "transition hover:bg-muted/30",
                              ].join(" ")}
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">{column.label}</p>
                              </div>
                              <span className="shrink-0 text-muted-foreground">
                                {isVisible ? (
                                  <EyeIcon className="size-4" />
                                ) : (
                                  <EyeOffIcon className="size-4" />
                                )}
                              </span>
                            </button>
                          )
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No columns match that search.
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {vehiclesQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading vehicles" />
              </div>
            ) : vehiclesQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert title="Unable to load vehicles" message={getApiErrorMessage(vehiclesQuery.error, "")} />
              </div>
            ) : paginatedVehicles.length ? (
              <VehiclesTable
                vehicles={paginatedVehicles}
                visibleColumns={visibleColumns}
                onView={setViewVehicle}
                onEdit={(vehicle) => router.push(`/vehicles/${vehicle.id}/edit`)}
              />
            ) : (
              <div className="p-6">
                <EmptyState
                  title={vehicles.length ? "No vehicles match this view" : "No vehicles yet"}
                  description={
                    vehicles.length
                      ? "Try another status filter or broaden your search."
                      : "Create the first inventory record to populate the table."
                  }
                />
              </div>
            )}
          </CardContent>
          {!vehiclesQuery.isPending && !vehiclesQuery.error && totalFilteredVehicles > 0 ? (
            <ListPagination
              page={currentPage}
              totalPages={totalPages}
              total={totalFilteredVehicles}
              itemLabel="vehicles"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <VehicleDetailDialog open={Boolean(viewVehicle)} onOpenChange={(open) => !open && setViewVehicle(null)} vehicle={viewVehicle} />
      </div>
    </AuthenticatedAppShell>
  )
}
