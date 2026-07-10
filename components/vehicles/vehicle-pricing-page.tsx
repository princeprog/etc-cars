"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ChartNoAxesColumnIncreasingIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  FileQuestionIcon,
  ImagePlusIcon,
  InfoIcon,
  SaveIcon,
  ShoppingCartIcon,
  TagsIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  Field,
  FieldDescription,
  FieldError,
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
      className="grid gap-5 xl:grid-cols-[480px_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="Loading vehicle pricing"
    >
      <div className="flex flex-col gap-5">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center gap-4 px-7 pt-7">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="flex flex-col gap-8 px-7 pb-7 pt-6">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </CardContent>
        </Card>
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-6 w-52" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Skeleton className="h-36 w-full rounded-md" />
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-52 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

function VehicleInvestmentSummary({ vehicle }: { vehicle: Vehicle }) {
  const totalInvestment = getTotalInvestment(vehicle)

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="flex flex-row items-center gap-4 px-7 pt-7">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-primary [&_svg]:size-6">
          <ChartNoAxesColumnIncreasingIcon />
        </span>
        <CardTitle className="text-xl">Investment Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-7 pb-7">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
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
              <p className="text-xl font-semibold text-foreground">
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                {[vehicle.brand, vehicle.model, vehicle.variant, vehicle.transmission]
                  .filter(Boolean)
                  .join("  •  ")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-start">
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
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <span className="flex items-center gap-4 text-foreground">
              <ShoppingCartIcon className="text-muted-foreground" />
              Purchase Price
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {formatVehicleMoney(vehicle.purchasePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <span className="flex items-center gap-4 text-foreground">
              <ClipboardListIcon className="text-muted-foreground" />
              Total Tracked Costs
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {formatVehicleMoney(vehicle.trackedCostsTotal)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 max-sm:flex-col max-sm:items-start">
            <span className="flex items-center gap-4 font-semibold text-primary">
              <CircleDollarSignIcon />
              Total Investment
            </span>
            <span className="text-xl font-semibold tabular-nums text-primary">
              {formatMoneyValue(totalInvestment)}
            </span>
          </div>
        </div>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">
              Pricing Guidance (Suggested Targets)
            </CardTitle>
            <CardDescription>
              Based on total investment and recommended profit margins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              {PRICING_MARGIN_TIERS.map((margin) => (
                <div
                  key={margin}
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-border/70 p-4 text-center"
                >
                  <span className="text-sm font-semibold text-primary">
                    {formatMarginLabel(margin)} Margin
                  </span>
                  <span className="text-xl font-semibold tabular-nums text-foreground">
                    {formatMoneyValue(
                      getSuggestedSellingPrice(totalInvestment, margin),
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Suggested Target
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <InfoIcon />
              <span>
                These are suggested targets only. Adjust based on market
                conditions.
              </span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

function VehiclePricingForm({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const updateMutation = useUpdateVehicleMutation()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [targetSellingPrice, setTargetSellingPrice] = React.useState(
    vehicle.targetSellingPrice ?? "",
  )
  const [minimumAcceptablePrice, setMinimumAcceptablePrice] = React.useState(
    vehicle.minimumAcceptablePrice ?? "",
  )
  const totalInvestment = getTotalInvestment(vehicle)
  const targetPriceValue = parseMoney(targetSellingPrice)
  const minimumPriceValue = parseMoney(minimumAcceptablePrice)
  const minimumExceedsTarget =
    targetPriceValue !== null &&
    minimumPriceValue !== null &&
    minimumPriceValue > targetPriceValue
  const belowInvestmentPrices = [
    targetPriceValue !== null &&
    totalInvestment !== null &&
    targetPriceValue < totalInvestment
      ? "target selling price"
      : null,
    minimumPriceValue !== null &&
    totalInvestment !== null &&
    minimumPriceValue < totalInvestment
      ? "minimum acceptable price"
      : null,
  ].filter(Boolean)
  const hasBelowInvestmentWarning = belowInvestmentPrices.length > 0

  function handleTargetSellingPriceChange(value: string) {
    setTargetSellingPrice(value)

    const nextTargetPriceValue = parseMoney(value)
    const currentMinimumPriceValue = parseMoney(minimumAcceptablePrice)

    if (
      nextTargetPriceValue !== null &&
      currentMinimumPriceValue !== null &&
      currentMinimumPriceValue > nextTargetPriceValue
    ) {
      setMinimumAcceptablePrice(value)
    }
  }

  function handleMinimumAcceptablePriceChange(value: string) {
    const nextMinimumPriceValue = parseMoney(value)

    if (
      targetPriceValue !== null &&
      nextMinimumPriceValue !== null &&
      nextMinimumPriceValue > targetPriceValue
    ) {
      setMinimumAcceptablePrice(targetSellingPrice)
      return
    }

    setMinimumAcceptablePrice(value)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (minimumExceedsTarget) {
      toast.error("Minimum acceptable price cannot exceed target selling price")
      return
    }

    setConfirmOpen(true)
  }

  async function handleConfirmPricing() {
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
          if (vehicle.photos.length === 0) {
            toast.success(
              "Pricing saved. Add a vehicle photo before marking it Available.",
              {
                action: {
                  label: "Upload Photo",
                  onClick: () =>
                    router.push(`/vehicles/${vehicle.id}/edit#vehicle-photos`),
                },
              },
            )
          } else {
            toast.success("Vehicle pricing updated")
          }
          setConfirmOpen(false)
        },
      },
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center gap-4 px-7 pt-7">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-primary [&_svg]:size-6">
              <TagsIcon />
            </span>
            <CardTitle className="text-xl">Set Sale Pricing</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-8 px-7 pb-7 pt-6">
              <ApiErrorAlert
                title="Unable to update pricing"
                message={getApiErrorMessage(updateMutation.error, "")}
              />

              <FieldGroup className="gap-7">
                <Field>
                  <FieldLabel
                    htmlFor="targetSellingPrice"
                    className="text-lg font-semibold text-foreground"
                  >
                    Target Selling Price
                  </FieldLabel>
                  <InputGroup className="h-14">
                    <InputGroupAddon className="min-w-12 border-r bg-muted/30">
                      <InputGroupText>₱</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="targetSellingPrice"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      required
                      value={targetSellingPrice}
                      onChange={(event) =>
                        handleTargetSellingPriceChange(event.target.value)
                      }
                      placeholder="925000"
                      className="text-lg"
                    />
                  </InputGroup>
                  <FieldDescription>
                    This is your ideal selling price to achieve your desired
                    margin.
                  </FieldDescription>
                </Field>

              <Separator />

                <Field data-invalid={minimumExceedsTarget}>
                  <FieldLabel
                    htmlFor="minimumAcceptablePrice"
                    className="text-lg font-semibold text-foreground"
                  >
                    Minimum Acceptable Price
                  </FieldLabel>
                  <InputGroup className="h-14">
                    <InputGroupAddon className="min-w-12 border-r bg-muted/30">
                      <InputGroupText>₱</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="minimumAcceptablePrice"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max={targetPriceValue ?? undefined}
                      step="0.01"
                      required
                      aria-invalid={minimumExceedsTarget}
                      value={minimumAcceptablePrice}
                      onChange={(event) =>
                        handleMinimumAcceptablePriceChange(event.target.value)
                      }
                      placeholder="900000"
                      className="text-lg"
                    />
                  </InputGroup>
                  <FieldDescription>
                    The lowest price you are willing to accept for this vehicle.
                  </FieldDescription>
                  {minimumExceedsTarget ? (
                    <FieldError>
                      Minimum acceptable price cannot exceed target selling
                      price.
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>

              <SubmitButton
                type="submit"
                className="h-14 w-full"
                pending={updateMutation.isPending}
                pendingLabel="Saving pricing"
              >
                <SaveIcon data-icon="inline-start" />
                Save Pricing
              </SubmitButton>
            </CardContent>
          </form>
        </Card>

        <Alert className="items-center border-primary/20 bg-primary/5 text-primary">
          <InfoIcon />
          <AlertDescription>
            Track costs first when possible so pricing reflects the full landed
            cost of the vehicle.
          </AlertDescription>
        </Alert>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              {hasBelowInvestmentWarning ? <TriangleAlertIcon /> : <TagsIcon />}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {hasBelowInvestmentWarning
                ? "Pricing is below total investment"
                : "Confirm pricing update"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will save the target selling price and minimum acceptable
              price for {vehicle.stockNumber}. Sales staff may use these values
              for listing and negotiation guidance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {hasBelowInvestmentWarning ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Review before saving</AlertTitle>
              <AlertDescription>
                The {belowInvestmentPrices.join(" and ")} is less than the
                total investment of {formatMoneyValue(totalInvestment)}. Saving
                this pricing may put the vehicle below cost.
              </AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                void handleConfirmPricing()
              }}
            >
              {hasBelowInvestmentWarning ? "Save Anyway" : "Confirm Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-primary [&_svg]:size-8">
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
          <div className="flex flex-col gap-5">
            {vehicle.photos.length === 0 ? (
              <Alert className="border-primary/20 bg-primary/5 text-primary">
                <ImagePlusIcon />
                <AlertTitle>Vehicle photo required for Available status</AlertTitle>
                <AlertDescription>
                  This vehicle needs at least one photo before it can be marked
                  Available.
                </AlertDescription>
                <AlertAction>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/vehicles/${vehicle.id}/edit#vehicle-photos`}>
                      <ImagePlusIcon data-icon="inline-start" />
                      Upload Photo
                    </Link>
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            <div className="grid gap-5 xl:grid-cols-[480px_minmax(0,1fr)]">
              <VehiclePricingForm vehicle={vehicle} />
              <VehicleInvestmentSummary vehicle={vehicle} />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
