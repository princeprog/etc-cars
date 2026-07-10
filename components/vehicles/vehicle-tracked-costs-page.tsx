"use client"

import Link from "next/link"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query"
import { getApiErrorMessage } from "@/types/api"
import { VehicleTrackedCostsCard } from "./vehicle-tracked-costs-card"
import {
  formatVehicleMoney,
  getVehicleStatusBadgeVariant,
  getVehicleStatusClassName,
} from "./vehicles.helpers"

export function VehicleTrackedCostsPage({ vehicleId }: { vehicleId: string }) {
  const vehicleQuery = useVehicleQuery(vehicleId)
  const vehicle = vehicleQuery.data?.vehicle

  return (
    <AuthenticatedAppShell
      title="Track Costs"
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: "Track Costs" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Track Costs
            </h2>
            <p className="text-sm text-muted-foreground">
              Add and review vehicle-specific expenses that affect
              profitability.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/vehicles">Back to Vehicles</Link>
          </Button>
        </section>

        {vehicleQuery.isPending ? (
          <ModuleLoadingState label="Loading vehicle costs" />
        ) : vehicleQuery.error ? (
          <ApiErrorAlert
            title="Unable to load vehicle costs"
            message={getApiErrorMessage(vehicleQuery.error, "")}
          />
        ) : !vehicle ? (
          <EmptyState
            title="Vehicle not found"
            description="The vehicle record could not be loaded for cost tracking."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <VehicleTrackedCostsCard vehicle={vehicle} />

            <div className="space-y-4">
              <Card className="border-border/70 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base">Vehicle Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-md border-border/70 bg-background px-1.5 py-0 font-mono text-[10px] tracking-wide text-muted-foreground"
                      >
                        {vehicle.stockNumber}
                      </Badge>
                      <Badge
                        variant={getVehicleStatusBadgeVariant(vehicle.status)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getVehicleStatusClassName(vehicle.status)}`}
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.variant || "No variant"}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Purchase price
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatVehicleMoney(vehicle.purchasePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Target price
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatVehicleMoney(vehicle.targetSellingPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                      <span className="font-medium text-foreground">
                        Tracked total
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatVehicleMoney(vehicle.trackedCostsTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
