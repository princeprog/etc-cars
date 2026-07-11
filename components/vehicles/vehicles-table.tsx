"use client"

import * as React from "react"
import Image from "next/image"
import { format, formatDistanceToNow } from "date-fns"
import {
  CircleDollarSignIcon,
  EyeIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TagsIcon,
} from "lucide-react"
import { toast } from "sonner"

import { resolveApiAssetUrl } from "@/constants/api-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUpdateVehicleMutation } from "@/hooks/mutations/vehicles/use-update-vehicle-mutation"
import { getApiErrorMessage } from "@/types/api"
import { VEHICLE_STATUSES, type Vehicle, type VehicleStatus } from "@/types/vehicles"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatVehicleMoney,
  getVehicleStatusBadgeVariant,
  getVehicleStatusClassName,
} from "./vehicles.helpers"
import { VehicleQualityBadge } from "./vehicle-quality-badge"

export type VisibleVehicleColumns = {
  stockNumber: boolean
  year: boolean
  status: boolean
  quality: boolean
  targetPrice: boolean
  minimumPrice: boolean
  mileage: boolean
  photos: boolean
  updated: boolean
}

export const DEFAULT_VISIBLE_VEHICLE_COLUMNS: VisibleVehicleColumns = {
  stockNumber: true,
  year: true,
  status: true,
  quality: true,
  targetPrice: true,
  minimumPrice: true,
  mileage: true,
  photos: true,
  updated: true,
}

export type VehicleColumnOption = {
  id: string
  label: string
  description: string
  toggleable: boolean
  key: keyof VisibleVehicleColumns
}

export const VEHICLE_COLUMN_OPTIONS: VehicleColumnOption[] = [
  {
    id: "stock-number",
    key: "stockNumber",
    label: "Stock No.",
    description: "Internal inventory stock identifier.",
    toggleable: true,
  },
  {
    id: "year",
    key: "year",
    label: "Year",
    description: "Model year of the vehicle record.",
    toggleable: true,
  },
  {
    id: "status",
    key: "status",
    label: "Status",
    description: "Operational availability and sale readiness.",
    toggleable: true,
  },
  {
    id: "quality",
    key: "quality",
    label: "Quality",
    description: "Inventory readiness score and grade.",
    toggleable: true,
  },
  {
    id: "target-price",
    key: "targetPrice",
    label: "Target Price",
    description: "Expected selling amount for the unit.",
    toggleable: true,
  },
  {
    id: "minimum-price",
    key: "minimumPrice",
    label: "Min Price",
    description: "Lowest acceptable approved selling amount.",
    toggleable: true,
  },
  {
    id: "mileage",
    key: "mileage",
    label: "Mileage",
    description: "Latest odometer reading stored for the vehicle.",
    toggleable: true,
  },
  {
    id: "photos",
    key: "photos",
    label: "Photos",
    description: "Stored photo count for inventory presentation.",
    toggleable: true,
  },
  {
    id: "updated",
    key: "updated",
    label: "Updated",
    description: "Most recent record activity timestamp.",
    toggleable: true,
  },
]

export const VEHICLE_COLUMN_MANAGER_OPTIONS = [
  {
    id: "vehicle",
    label: "Vehicle",
    description: "Primary make, model, and variant display.",
    key: undefined,
    alwaysVisible: true,
  },
  ...VEHICLE_COLUMN_OPTIONS.map((column) => ({
    id: column.id,
    label: column.label,
    description: column.description,
    key: column.key,
    alwaysVisible: false,
  })),
  {
    id: "actions",
    label: "Actions",
    description: "Row-level actions for view, edit, costs, and pricing.",
    key: undefined,
    alwaysVisible: true,
  },
] as const

export function VehiclesTable({
  vehicles,
  visibleColumns,
  onView,
  onEdit,
  onTrackCost,
  onSetPricing,
}: {
  vehicles: Vehicle[]
  visibleColumns: VisibleVehicleColumns
  onView: (vehicle: Vehicle) => void
  onEdit: (vehicle: Vehicle) => void
  onTrackCost: (vehicle: Vehicle) => void
  onSetPricing: (vehicle: Vehicle) => void
}) {
  const updateVehicleMutation = useUpdateVehicleMutation()
  const [selectedVehicleIds, setSelectedVehicleIds] = React.useState<string[]>([])

  const allSelected = vehicles.length > 0 && selectedVehicleIds.length === vehicles.length
  const someSelected = selectedVehicleIds.length > 0 && selectedVehicleIds.length < vehicles.length

  function toggleAllRows(checked: boolean) {
    setSelectedVehicleIds(checked ? vehicles.map((vehicle) => vehicle.id) : [])
  }

  function toggleRow(vehicleId: string, checked: boolean) {
    setSelectedVehicleIds((current) =>
      checked
        ? [...current, vehicleId]
        : current.filter((id) => id !== vehicleId),
    )
  }

  async function handleStatusChange(vehicle: Vehicle, nextStatus: VehicleStatus) {
    if (vehicle.status === nextStatus || nextStatus === "Sold") {
      return
    }

    if (
      nextStatus === "Available" &&
      (!vehicle.targetSellingPrice ||
        !vehicle.minimumAcceptablePrice ||
        !vehicle.photos.length)
    ) {
      toast.error(
        "Set pricing and add at least one vehicle photo before moving this unit to Available.",
      )
      return
    }

    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicle.id,
        payload: {
          status: nextStatus,
        },
      })

      toast.success(`Vehicle moved to ${nextStatus}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update vehicle status"))
    }
  }

  return (
    <Table className="min-w-[1120px] border-collapse">
      <TableHeader className="bg-muted/30">
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-10 w-8 px-3" />
          <TableHead className="h-10 w-10 px-3">
            <Checkbox
              checked={allSelected || (someSelected ? "indeterminate" : false)}
              onCheckedChange={(checked) => toggleAllRows(Boolean(checked))}
              aria-label="Select all vehicles"
            />
          </TableHead>
          {visibleColumns.stockNumber ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Stock No.</TableHead>
          ) : null}
          <TableHead className="h-10 min-w-[260px] px-4 text-xs font-semibold text-foreground/80">Vehicle</TableHead>
          {visibleColumns.year ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Year</TableHead>
          ) : null}
          {visibleColumns.status ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Status</TableHead>
          ) : null}
          {visibleColumns.quality ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Quality</TableHead>
          ) : null}
          {visibleColumns.targetPrice ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Target Price</TableHead>
          ) : null}
          {visibleColumns.minimumPrice ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Min Price</TableHead>
          ) : null}
          {visibleColumns.mileage ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Mileage</TableHead>
          ) : null}
          {visibleColumns.photos ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Photos</TableHead>
          ) : null}
          {visibleColumns.updated ? (
            <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">Updated</TableHead>
          ) : null}
          <TableHead className="h-10 w-12 px-4 text-right text-xs font-semibold text-foreground/80">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id} className="hover:bg-muted/15 data-[state=selected]:bg-muted/20">
            <TableCell className="px-3 py-3 text-muted-foreground">
              <GripVerticalIcon className="size-4 opacity-55" />
            </TableCell>
            <TableCell className="px-3 py-3">
              <Checkbox
                checked={selectedVehicleIds.includes(vehicle.id)}
                onCheckedChange={(checked) => toggleRow(vehicle.id, Boolean(checked))}
                aria-label={`Select ${vehicle.stockNumber}`}
              />
            </TableCell>
            {visibleColumns.stockNumber ? (
              <TableCell className="px-4 py-3">
                <Badge
                  variant="outline"
                  className="rounded-md border-border/70 bg-background px-1.5 py-0 font-mono text-[10px] tracking-wide text-muted-foreground"
                >
                  {vehicle.stockNumber}
                </Badge>
              </TableCell>
            ) : null}
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                  <Image
                    src={
                      vehicle.photos[0]
                        ? resolveApiAssetUrl(vehicle.photos[0].fileUrl)
                        : "/default-vehicle-image.png"
                    }
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    unoptimized
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.variant || "No variant"}
                  </p>
                </div>
              </div>
            </TableCell>
            {visibleColumns.year ? (
              <TableCell className="px-4 py-3 font-medium text-foreground">
                {vehicle.year}
              </TableCell>
            ) : null}
            {visibleColumns.status ? (
              <TableCell className="px-4 py-3">
                <Badge
                  variant={getVehicleStatusBadgeVariant(vehicle.status)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getVehicleStatusClassName(vehicle.status)}`}
                >
                  {vehicle.status}
                </Badge>
              </TableCell>
            ) : null}
            {visibleColumns.quality ? (
              <TableCell className="px-4 py-3">
                <VehicleQualityBadge quality={vehicle.qualityScore} />
              </TableCell>
            ) : null}
            {visibleColumns.targetPrice ? (
              <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">
                {formatVehicleMoney(vehicle.targetSellingPrice)}
              </TableCell>
            ) : null}
            {visibleColumns.minimumPrice ? (
              <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">
                {formatVehicleMoney(vehicle.minimumAcceptablePrice)}
              </TableCell>
            ) : null}
            {visibleColumns.mileage ? (
              <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">
                {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "N/A"}
              </TableCell>
            ) : null}
            {visibleColumns.photos ? (
              <TableCell className="px-4 py-3">
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {vehicle.photos.length} photo{vehicle.photos.length === 1 ? "" : "s"}
                </Badge>
              </TableCell>
            ) : null}
            {visibleColumns.updated ? (
              <TableCell className="px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {formatDistanceToNow(new Date(vehicle.updatedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(vehicle.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
              </TableCell>
            ) : null}
            <TableCell className="px-4 py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${vehicle.stockNumber}`}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Vehicle actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView(vehicle)}>
                    <EyeIcon />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                    <PencilIcon />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTrackCost(vehicle)}>
                    <CircleDollarSignIcon />
                    Track Cost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetPricing(vehicle)}>
                    <TagsIcon />
                    Set Pricing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Update status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={vehicle.status}>
                    {VEHICLE_STATUSES.map((status) => {
                      const disabled =
                        status === "Sold" ||
                        updateVehicleMutation.isPending

                      return (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          disabled={disabled}
                          onSelect={(event) => {
                            event.preventDefault()
                            void handleStatusChange(vehicle, status)
                          }}
                        >
                          {status}
                        </DropdownMenuRadioItem>
                      )
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
