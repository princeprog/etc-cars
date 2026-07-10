"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeftIcon,
  CameraIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CarFrontIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  ClockIcon,
  DollarSignIcon,
  FileQuestionIcon,
  ImagePlusIcon,
  PencilIcon,
  PlusCircleIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  TagsIcon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { resolveApiAssetUrl } from "@/constants/api-config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useActivityHistoryQuery } from "@/hooks/queries/activity-history/use-activity-history-query"
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/types/api"
import type {
  Vehicle,
  VehiclePhoto,
  VehicleTrackedCost,
} from "@/types/vehicles"
import {
  GRADE_BADGE_CLASSES,
  GRADE_LABELS,
  getIssueCount,
} from "./vehicle-quality.helpers"
import {
  formatVehicleMoney,
  getVehicleStatusBadgeVariant,
  getVehicleStatusClassName,
} from "./vehicles.helpers"

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

function getTotalInvestment(vehicle: Vehicle) {
  const purchasePrice = parseMoney(vehicle.purchasePrice)
  const trackedCostsTotal = parseMoney(vehicle.trackedCostsTotal)

  if (purchasePrice === null || trackedCostsTotal === null) {
    return null
  }

  return purchasePrice + trackedCostsTotal
}

function formatVehicleTitle(vehicle: Vehicle) {
  return `${vehicle.year} ${vehicle.brand} ${vehicle.model}${
    vehicle.variant ? ` ${vehicle.variant}` : ""
  }`
}

function formatOptionalValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "N/A"
  }

  return String(value)
}

function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy")
}

function formatDateTime(value: string) {
  return format(new Date(value), "MMM d, yyyy h:mm a")
}

function formatCostCategory(cost: VehicleTrackedCost) {
  return cost.category.charAt(0).toUpperCase() + cost.category.slice(1)
}

function getActionLabel(actionType: string) {
  return actionType.split(".").at(-1)?.replaceAll("_", " ") ?? actionType
}

function VehicleDetailsPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-busy="true"
      aria-label="Loading vehicle details"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_450px]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.9fr)]">
          <Skeleton className="h-[440px] w-full rounded-xl" />
          <Skeleton className="h-[440px] w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function VehicleDetailsHeader({ vehicle }: { vehicle: Vehicle }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Vehicle Details
        </h2>
        <p className="text-sm text-muted-foreground">
          View complete vehicle information, costs, photos, and availability
          status.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/vehicles">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to Vehicles
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              More actions
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{vehicle.stockNumber}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={`/vehicles/${vehicle.id}/edit`}>
                  <PencilIcon />
                  Edit Vehicle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vehicles/${vehicle.id}/costs`}>
                  <ReceiptTextIcon />
                  Track Costs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vehicles/${vehicle.id}/pricing`}>
                  <TagsIcon />
                  Set Pricing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vehicles/${vehicle.id}/edit#vehicle-photos`}>
                  <ImagePlusIcon />
                  Upload Photo
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

function VehicleOverviewCard({ vehicle }: { vehicle: Vehicle }) {
  const issueCount = getIssueCount(vehicle.qualityScore)
  const quality = vehicle.qualityScore
  const summaryBadges = [
    vehicle.variant,
    vehicle.fuelType,
    vehicle.transmission,
  ].filter(Boolean)

  return (
    <Card className="border-border/70 shadow-xs">
      <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.9fr)_304px] lg:items-center">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-7">
            <CarFrontIcon />
          </span>
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-semibold leading-tight">
                {formatVehicleTitle(vehicle)}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-md bg-background px-2 py-1 font-mono text-xs"
              >
                {vehicle.stockNumber}
              </Badge>
              <Badge
                variant={getVehicleStatusBadgeVariant(vehicle.status)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  getVehicleStatusClassName(vehicle.status),
                )}
              >
                {vehicle.status}
              </Badge>
              {summaryBadges.map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-medium"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-border/70 lg:border-l lg:pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-medium">Inventory readiness</p>
              <p className="text-xs text-muted-foreground">
                Score reflects cost data completeness, pricing, media,
                profitability, freshness, and status.
              </p>
            </div>
            {quality ? (
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  GRADE_BADGE_CLASSES[quality.grade],
                )}
              >
                {GRADE_LABELS[quality.grade]}
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
              <span className="text-3xl font-semibold tabular-nums">
                {quality?.score ?? "N/A"}
                {quality ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    /100
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-primary">
                {issueCount.total === 0
                  ? "No items to review"
                  : `${issueCount.total} item${
                      issueCount.total === 1 ? "" : "s"
                    } to review`}
              </span>
            </div>
            <Progress value={quality?.score ?? 0} />
          </div>
        </div>

        <div className="grid gap-2">
          <Button variant="outline" asChild>
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <PencilIcon data-icon="inline-start" />
              Edit Vehicle
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/vehicles/${vehicle.id}/costs`}>
              <DollarSignIcon data-icon="inline-start" />
              Track Costs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/vehicles/${vehicle.id}/pricing`}>
              <TagsIcon data-icon="inline-start" />
              Set Pricing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VehiclePhotosCard({ vehicle }: { vehicle: Vehicle }) {
  const sortedPhotos = React.useMemo(
    () =>
      [...vehicle.photos].sort(
        (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
      ),
    [vehicle.photos],
  )
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0)
  const activePhotoIndex = Math.min(selectedPhotoIndex, sortedPhotos.length - 1)
  const selectedPhoto = sortedPhotos[activePhotoIndex] ?? sortedPhotos[0]
  const visibleThumbnails = sortedPhotos.slice(0, 4)
  const remainingPhotos = Math.max(0, sortedPhotos.length - visibleThumbnails.length)

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Photos</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/vehicles/${vehicle.id}/edit#vehicle-photos`}>
              <UploadIcon data-icon="inline-start" />
              Upload Photo
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {selectedPhoto ? (
          <>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted">
              <Image
                src={resolveApiAssetUrl(selectedPhoto.fileUrl)}
                alt={`${vehicle.brand} ${vehicle.model} photo`}
                fill
                priority
                unoptimized
                sizes="(min-width: 1280px) 48vw, 100vw"
                className="object-cover"
              />
              <Badge className="absolute left-3 top-3 rounded-md">
                Primary
              </Badge>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {visibleThumbnails.map((photo, index) => (
                <PhotoThumbnail
                  key={`${photo.fileUrl}-${index}`}
                  photo={photo}
                  vehicle={vehicle}
                  selected={selectedPhoto.fileUrl === photo.fileUrl}
                  onClick={() => setSelectedPhotoIndex(index)}
                />
              ))}
              <Link
                href={`/vehicles/${vehicle.id}/edit#vehicle-photos`}
                className="flex aspect-square items-center justify-center rounded-lg border bg-muted/40 text-center text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                {remainingPhotos > 0 ? `+ ${remainingPhotos} more` : "Manage"}
              </Link>
            </div>
          </>
        ) : (
          <Empty className="min-h-[360px] border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CameraIcon />
              </EmptyMedia>
              <EmptyTitle>No vehicle photos yet</EmptyTitle>
              <EmptyDescription>
                Upload at least one photo before marking this vehicle
                Available.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild>
              <Link href={`/vehicles/${vehicle.id}/edit#vehicle-photos`}>
                <ImagePlusIcon data-icon="inline-start" />
                Upload Photo
              </Link>
            </Button>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

function PhotoThumbnail({
  photo,
  vehicle,
  selected,
  onClick,
}: {
  photo: VehiclePhoto
  vehicle: Vehicle
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border bg-muted transition",
        selected ? "border-primary ring-2 ring-primary/25" : "border-border/70",
      )}
      aria-label={`View ${vehicle.brand} ${vehicle.model} photo`}
    >
      <Image
        src={resolveApiAssetUrl(photo.fileUrl)}
        alt=""
        fill
        unoptimized
        sizes="112px"
        className="object-cover"
      />
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function VehicleInformationCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <DetailRow label="Brand" value={vehicle.brand} />
          <DetailRow label="Model" value={vehicle.model} />
          <DetailRow label="Year" value={vehicle.year} />
          <DetailRow label="Variant" value={formatOptionalValue(vehicle.variant)} />
          <DetailRow label="Color" value={formatOptionalValue(vehicle.color)} />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <DetailRow
            label="Mileage"
            value={
              vehicle.mileage
                ? `${vehicle.mileage.toLocaleString("en-PH")} mi`
                : "N/A"
            }
          />
          <DetailRow
            label="Transmission"
            value={formatOptionalValue(vehicle.transmission)}
          />
          <DetailRow label="Fuel Type" value={formatOptionalValue(vehicle.fuelType)} />
          <DetailRow label="Plate No." value="N/A" />
        </div>

        <Separator />

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">Remarks</span>
          <p className="leading-relaxed text-foreground">
            {vehicle.remarks || "No remarks recorded."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryValueRow({
  icon: Icon,
  label,
  value,
  emphasized = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: React.ReactNode
  emphasized?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-sm",
        emphasized ? "rounded-lg border bg-primary/5 px-3 py-3" : "",
      )}
    >
      <span
        className={cn(
          "flex min-w-0 items-center gap-3",
          emphasized ? "font-semibold text-primary" : "text-foreground",
        )}
      >
        <Icon className="shrink-0 text-muted-foreground" />
        {label}
      </span>
      <span
        className={cn(
          "text-right font-medium tabular-nums",
          emphasized ? "text-lg font-semibold text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function CommercialSummaryCard({ vehicle }: { vehicle: Vehicle }) {
  const totalInvestment = getTotalInvestment(vehicle)
  const pricingComplete = Boolean(
    vehicle.targetSellingPrice && vehicle.minimumAcceptablePrice,
  )

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader>
        <CardTitle>Commercial Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <SummaryValueRow
            icon={ShoppingCartIcon}
            label="Purchase Price"
            value={formatVehicleMoney(vehicle.purchasePrice)}
          />
          <SummaryValueRow
            icon={ClipboardListIcon}
            label="Total Tracked Costs"
            value={formatVehicleMoney(vehicle.trackedCostsTotal)}
          />
          <Separator />
          <SummaryValueRow
            icon={CircleDollarSignIcon}
            label="Total Investment"
            value={formatMoneyValue(totalInvestment)}
            emphasized
          />
          <SummaryValueRow
            icon={TagsIcon}
            label="Target Selling Price"
            value={formatVehicleMoney(vehicle.targetSellingPrice)}
          />
          <SummaryValueRow
            icon={DollarSignIcon}
            label="Minimum Acceptable Price"
            value={formatVehicleMoney(vehicle.minimumAcceptablePrice)}
          />
        </div>

        {pricingComplete ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <CheckCircle2Icon />
            <AlertTitle>Pricing is complete</AlertTitle>
            <AlertDescription className="text-emerald-700">
              Vehicle is ready to be marked as Available once all readiness
              checks pass.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <TriangleAlertIcon />
            <AlertTitle>Pricing needs review</AlertTitle>
            <AlertDescription className="text-amber-700">
              Set the target and minimum acceptable prices before making this
              vehicle Available.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function ReadinessItem({
  complete,
  label,
}: {
  complete: boolean
  label: string
}) {
  const Icon = complete ? CheckCircle2Icon : TriangleAlertIcon

  return (
    <li className="flex items-center gap-3 text-sm">
      <Icon
        className={cn(
          "shrink-0",
          complete ? "text-emerald-600" : "text-amber-600",
        )}
      />
      <span className="text-foreground">{label}</span>
    </li>
  )
}

function AvailabilityReadinessCard({ vehicle }: { vehicle: Vehicle }) {
  const checks = [
    {
      label: "Target selling price added",
      complete: Boolean(vehicle.targetSellingPrice),
    },
    {
      label: "Minimum acceptable price added",
      complete: Boolean(vehicle.minimumAcceptablePrice),
    },
    {
      label: "At least one photo uploaded",
      complete: vehicle.photos.length > 0,
    },
    {
      label: "Tracked costs reviewed",
      complete: vehicle.trackedCosts.length > 0,
    },
  ]
  const missingCount = checks.filter((check) => !check.complete).length

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Availability Readiness</CardTitle>
        {missingCount > 0 ? (
          <Badge
            variant="outline"
            className="rounded-full border-amber-200 bg-amber-50 text-amber-700"
          >
            {missingCount} item{missingCount === 1 ? "" : "s"} to review
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            Ready
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {checks.map((check) => (
            <ReadinessItem
              key={check.label}
              complete={check.complete}
              label={check.label}
            />
          ))}
        </ul>

        {missingCount > 0 ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <PlusCircleIcon />
            <AlertTitle>Missing requirements</AlertTitle>
            <AlertDescription className="text-amber-700">
              Please complete the items above to mark as Available.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <CheckCircle2Icon />
            <AlertTitle>Availability checks complete</AlertTitle>
            <AlertDescription className="text-emerald-700">
              This vehicle has the required pricing and media for availability.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function TrackedCostsPreviewCard({ vehicle }: { vehicle: Vehicle }) {
  const costs = [...vehicle.trackedCosts]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, 3)

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Tracked Costs</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/vehicles/${vehicle.id}/costs`}>View All Costs</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/vehicles/${vehicle.id}/costs`}>
              <PlusCircleIcon data-icon="inline-start" />
              Track Costs
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {costs.length ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Added By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost, index) => (
                  <TableRow key={cost.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {formatCostCategory(cost)}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatVehicleMoney(cost.amount)}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {cost.note}
                    </TableCell>
                    <TableCell>{formatDate(cost.createdAt)}</TableCell>
                    <TableCell>N/A</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Total Tracked Costs
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {formatVehicleMoney(vehicle.trackedCostsTotal)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptTextIcon />
              </EmptyMedia>
              <EmptyTitle>No tracked costs yet</EmptyTitle>
              <EmptyDescription>
                Add reconditioning, repair, transport, or document costs for
                this vehicle.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityTimestampsCard({ vehicle }: { vehicle: Vehicle }) {
  const activityQuery = useActivityHistoryQuery("vehicle", vehicle.id, 5)
  const events = activityQuery.data?.events ?? []
  const latestEvent = events[0]

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader>
        <CardTitle>Activity & Timestamps</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-sm">
          <SummaryValueRow
            icon={CalendarIcon}
            label="Created"
            value={formatDateTime(vehicle.createdAt)}
          />
          <SummaryValueRow
            icon={ClockIcon}
            label="Last Updated"
            value={formatDateTime(vehicle.updatedAt)}
          />
          <SummaryValueRow icon={UserIcon} label="Last Updated By" value="N/A" />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Recent Activity</p>
            <span className="text-xs text-primary">Latest updates</span>
          </div>

          {activityQuery.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : activityQuery.error ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load activity</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(activityQuery.error, "")}
              </AlertDescription>
            </Alert>
          ) : latestEvent ? (
            <div className="flex items-start justify-between gap-4 text-sm">
              <span className="flex min-w-0 items-start gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0">
                  <span className="block truncate">{latestEvent.summary}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {getActionLabel(latestEvent.actionType)}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-right text-xs text-muted-foreground">
                {formatDateTime(latestEvent.timestamp)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No activity has been recorded for this vehicle yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
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
            <VehicleDetailsHeader vehicle={vehicle} />
            <VehicleOverviewCard vehicle={vehicle} />

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_450px]">
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.9fr)]">
                <VehiclePhotosCard vehicle={vehicle} />
                <VehicleInformationCard vehicle={vehicle} />
              </div>

              <div className="flex flex-col gap-5">
                <CommercialSummaryCard vehicle={vehicle} />
                <AvailabilityReadinessCard vehicle={vehicle} />
              </div>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_450px]">
              <TrackedCostsPreviewCard vehicle={vehicle} />
              <ActivityTimestampsCard vehicle={vehicle} />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
