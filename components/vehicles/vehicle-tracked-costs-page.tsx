"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CarFrontIcon,
  DollarSignIcon,
  FileQuestionIcon,
  ReceiptTextIcon,
  TagsIcon,
  TrendingUpIcon,
} from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useVehicleTrackedCostsQuery } from "@/hooks/queries/vehicles/use-vehicle-tracked-costs-query"
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query"
import { getApiErrorMessage } from "@/types/api"
import type { Vehicle } from "@/types/vehicles"
import { VehicleTrackedCostsCard } from "./vehicle-tracked-costs-card"
import {
  formatVehicleMoney,
  getVehicleStatusBadgeVariant,
  getVehicleStatusClassName,
} from "./vehicles.helpers"

const PRICING_MARGIN_TIERS = [0.1, 0.15, 0.2] as const

function parseMoney(value?: string | null) {
  if (!value) {
    return null
  }

  const numericValue = Number(value)

  return Number.isFinite(numericValue) ? numericValue : null
}

function getVehicleInvestment(vehicle: Vehicle) {
  const purchasePrice = parseMoney(vehicle.purchasePrice)
  const trackedCostsTotal = parseMoney(vehicle.trackedCostsTotal)

  if (purchasePrice === null || trackedCostsTotal === null) {
    return {
      totalInvestment: null,
    }
  }

  return {
    totalInvestment: purchasePrice + trackedCostsTotal,
  }
}

function formatMoneyValue(value: number | null) {
  if (value === null) {
    return "N/A"
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatMarginLabel(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value)
}

function getSuggestedSellingPrice(totalInvestment: number | null, margin: number) {
  if (totalInvestment === null || margin >= 1) {
    return null
  }

  return totalInvestment / (1 - margin)
}

function VehicleTrackedCostsPageSkeleton() {
  return (
    <div
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]"
      aria-label="Loading vehicle costs"
      aria-busy="true"
    >
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-md" />
          ))}
          <Separator />
          <Skeleton className="h-36 w-full rounded-md" />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-28 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

export function VehicleTrackedCostsPage({ vehicleId }: { vehicleId: string }) {
  const [costPage, setCostPage] = React.useState(1)
  const [costPageSize, setCostPageSize] = React.useState(10)
  const vehicleQuery = useVehicleQuery(vehicleId)
  const trackedCostsQuery = useVehicleTrackedCostsQuery(vehicleId, {
    page: costPage,
    pageSize: costPageSize,
  })
  const vehicle = vehicleQuery.data?.vehicle
  const trackedCostsData = trackedCostsQuery.data
  const investment = vehicle ? getVehicleInvestment(vehicle) : null

  function handleCostPageSizeChange(pageSize: number) {
    setCostPageSize(pageSize)
    setCostPage(1)
  }

  return (
    <AuthenticatedAppShell
      title="Track Costs"
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: "Track Costs" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-5 border-b border-border/70 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-foreground [&_svg]:size-8">
                <ReceiptTextIcon />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Track Costs
                </h2>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Record and manage all vehicle-specific expenses to maintain
                  accurate profitability.
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link href="/vehicles">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to Vehicles
            </Link>
          </Button>
        </section>

        {vehicleQuery.isPending ? (
          <VehicleTrackedCostsPageSkeleton />
        ) : vehicleQuery.error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load vehicle costs</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(vehicleQuery.error, "")}
            </AlertDescription>
          </Alert>
        ) : !vehicle ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestionIcon />
              </EmptyMedia>
              <EmptyTitle>Vehicle not found</EmptyTitle>
              <EmptyDescription>
                The vehicle record could not be loaded for cost tracking.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
            <VehicleTrackedCostsCard
              vehicle={vehicle}
              trackedCosts={trackedCostsData?.trackedCosts ?? []}
              error={trackedCostsQuery.error}
              pagination={{
                page: trackedCostsData?.page ?? costPage,
                pageSize: trackedCostsData?.pageSize ?? costPageSize,
                total: trackedCostsData?.total ?? 0,
                totalPages: trackedCostsData?.totalPages ?? 1,
                isLoading: trackedCostsQuery.isPending,
                onPageChange: setCostPage,
                onPageSizeChange: handleCostPageSizeChange,
              }}
            />

            <div className="flex flex-col gap-4">
              <Card className="border-border/70 shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span className="text-muted-foreground [&_svg]:size-5">
                      <CarFrontIcon />
                    </span>
                    Investment Summary
                  </CardTitle>
                  <CardDescription>
                    Know the full landed cost before setting a target selling
                    price.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Stock Number
                      </span>
                      <Badge
                        variant="outline"
                        className="h-8 w-fit rounded-md bg-primary px-3 font-mono text-sm text-primary-foreground"
                      >
                        {vehicle.stockNumber}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Vehicle
                      </span>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.year} {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.variant || "No variant"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={getVehicleStatusBadgeVariant(vehicle.status)}
                        className={`h-8 w-fit rounded-md px-3 text-sm font-medium ${getVehicleStatusClassName(vehicle.status)}`}
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-4 text-sm">
                    <div className="flex items-center justify-between gap-3 max-sm:items-start">
                      <span className="flex items-center gap-3 text-muted-foreground">
                        <DollarSignIcon />
                        Purchase Price
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatVehicleMoney(vehicle.purchasePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 max-sm:items-start">
                      <span className="flex items-center gap-3 text-muted-foreground">
                        <ReceiptTextIcon />
                        Total Tracked Costs
                      </span>
                      <span className="font-semibold tabular-nums text-destructive">
                        {formatVehicleMoney(vehicle.trackedCostsTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Total Investment
                        </span>
                        <span className="text-2xl font-semibold tabular-nums text-primary">
                          {formatMoneyValue(investment?.totalInvestment ?? null)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Purchase price plus all tracked vehicle costs.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-lg border border-border/70 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">
                        <TagsIcon />
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                          Pricing Guidance
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Suggested selling prices from total investment and
                          target margin.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3">
                      {PRICING_MARGIN_TIERS.map((margin) => (
                        <div
                          key={margin}
                          className="flex items-center justify-between gap-3 text-sm max-sm:items-start"
                        >
                          <Badge variant="secondary">
                            {formatMarginLabel(margin)} margin
                          </Badge>
                          <span className="font-medium tabular-nums text-foreground">
                            {formatMoneyValue(
                              getSuggestedSellingPrice(
                                investment?.totalInvestment ?? null,
                                margin,
                              ),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="items-center">
                <TrendingUpIcon />
                <AlertDescription>
                  Track costs first, then set a target selling price with a
                  clear view of the unit&apos;s total investment.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
