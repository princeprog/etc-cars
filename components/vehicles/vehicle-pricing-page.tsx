"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CarFrontIcon,
  DollarSignIcon,
  FileQuestionIcon,
  ReceiptTextIcon,
  SaveIcon,
  TagsIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateVehicleMutation } from "@/hooks/mutations/vehicles/use-update-vehicle-mutation"
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query"
import { getApiErrorMessage } from "@/types/api"
import type { Vehicle } from "@/types/vehicles"
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

function getTotalInvestment(vehicle: Vehicle) {
  const purchasePrice = parseMoney(vehicle.purchasePrice)
  const trackedCostsTotal = parseMoney(vehicle.trackedCostsTotal)

  if (purchasePrice === null || trackedCostsTotal === null) {
    return null
  }

  return purchasePrice + trackedCostsTotal
}

function getSuggestedSellingPrice(totalInvestment: number | null, margin: number) {
  if (totalInvestment === null || margin >= 1) {
    return null
  }

  return totalInvestment / (1 - margin)
}

function VehiclePricingPageSkeleton() {
  return (
    <div
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]"
      aria-busy="true"
      aria-label="Loading vehicle pricing"
    >
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-28 w-full rounded-md" />
        </CardContent>
      </Card>
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

function VehicleInvestmentSummary({ vehicle }: { vehicle: Vehicle }) {
  const totalInvestment = getTotalInvestment(vehicle)

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="text-muted-foreground [&_svg]:size-5">
            <CarFrontIcon />
          </span>
          Investment Summary
        </CardTitle>
        <CardDescription>
          Review landed cost before setting sale pricing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Stock Number</span>
            <Badge
              variant="outline"
              className="h-8 w-fit rounded-md bg-primary px-3 font-mono text-sm text-primary-foreground"
            >
              {vehicle.stockNumber}
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Vehicle</span>
            <p className="text-lg font-semibold text-foreground">
              {vehicle.year} {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-muted-foreground">
              {vehicle.variant || "No variant"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Status</span>
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
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Total Investment
            </span>
            <span className="text-2xl font-semibold tabular-nums text-primary">
              {formatMoneyValue(totalInvestment)}
            </span>
            <span className="text-xs text-muted-foreground">
              Purchase price plus all tracked vehicle costs.
            </span>
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
                Suggested sale prices based on margin over total investment.
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
                    getSuggestedSellingPrice(totalInvestment, margin),
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VehiclePricingForm({ vehicle }: { vehicle: Vehicle }) {
  const updateMutation = useUpdateVehicleMutation()
  const [targetSellingPrice, setTargetSellingPrice] = React.useState(
    vehicle.targetSellingPrice ?? "",
  )
  const [minimumAcceptablePrice, setMinimumAcceptablePrice] = React.useState(
    vehicle.minimumAcceptablePrice ?? "",
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await updateMutation.mutateAsync(
      {
        id: vehicle.id,
        payload: {
          targetSellingPrice,
          minimumAcceptablePrice,
        },
      },
      {
        onSuccess: () => {
          toast.success("Vehicle pricing updated")
        },
      },
    )
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <TagsIcon />
          Set Sale Pricing
        </CardTitle>
        <CardDescription>
          Set the target and floor prices after reviewing the unit&apos;s total
          investment.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-5">
          <ApiErrorAlert
            title="Unable to update pricing"
            message={getApiErrorMessage(updateMutation.error, "")}
          />

          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="targetSellingPrice">
                Target selling price
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>PHP</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="targetSellingPrice"
                  inputMode="decimal"
                  required
                  value={targetSellingPrice}
                  onChange={(event) => setTargetSellingPrice(event.target.value)}
                  placeholder="925000"
                />
              </InputGroup>
              <FieldDescription>
                The intended listing or asking price for the vehicle.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="minimumAcceptablePrice">
                Minimum acceptable price
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>PHP</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="minimumAcceptablePrice"
                  inputMode="decimal"
                  required
                  value={minimumAcceptablePrice}
                  onChange={(event) =>
                    setMinimumAcceptablePrice(event.target.value)
                  }
                  placeholder="900000"
                />
              </InputGroup>
              <FieldDescription>
                The lowest approved negotiation floor for sales staff.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/20 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/vehicles">Back to Vehicles</Link>
          </Button>
          <SubmitButton
            type="submit"
            pending={updateMutation.isPending}
            pendingLabel="Saving pricing"
          >
            <SaveIcon data-icon="inline-start" />
            Save Pricing
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}

export function VehiclePricingPage({ vehicleId }: { vehicleId: string }) {
  const vehicleQuery = useVehicleQuery(vehicleId)
  const vehicle = vehicleQuery.data?.vehicle

  return (
    <AuthenticatedAppShell
      title="Set Pricing"
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: "Set Pricing" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-5 border-b border-border/70 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-foreground [&_svg]:size-8">
              <TagsIcon />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Set Pricing
              </h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Review total investment, then set the target and minimum
                acceptable selling prices.
              </p>
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
          <VehiclePricingPageSkeleton />
        ) : vehicleQuery.error ? (
          <ApiErrorAlert
            title="Unable to load vehicle pricing"
            message={getApiErrorMessage(vehicleQuery.error, "")}
          />
        ) : !vehicle ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestionIcon />
              </EmptyMedia>
              <EmptyTitle>Vehicle not found</EmptyTitle>
              <EmptyDescription>
                The vehicle record could not be loaded for pricing.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
            <VehiclePricingForm vehicle={vehicle} />
            <div className="flex flex-col gap-4">
              <VehicleInvestmentSummary vehicle={vehicle} />
              <Alert className="items-center">
                <TagsIcon />
                <AlertDescription>
                  Track costs first when possible so pricing reflects the full
                  landed cost of the vehicle.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
