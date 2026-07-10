"use client"

import Link from "next/link"
import { ArrowLeftIcon, CarFrontIcon, FileQuestionIcon } from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query"
import { getApiErrorMessage } from "@/types/api"

function VehicleDetailsPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-busy="true"
      aria-label="Loading vehicle details"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_450px]">
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function VehicleDetailsPage({ vehicleId }: { vehicleId: string }) {
  const vehicleQuery = useVehicleQuery(vehicleId)
  const vehicle = vehicleQuery.data?.vehicle

  return (
    <AuthenticatedAppShell
      title="Vehicle Details"
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: "Vehicle Details" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {vehicleQuery.isPending ? (
          <VehicleDetailsPageSkeleton />
        ) : vehicleQuery.error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load vehicle details</AlertTitle>
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
                The vehicle record could not be loaded.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Vehicle Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  View complete vehicle information, costs, photos, and
                  availability status.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/vehicles">
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back to Vehicles
                </Link>
              </Button>
            </section>

            <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-xs">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-primary">
                  <CarFrontIcon />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold">
                    {vehicle.year} {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.stockNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
