"use client"

import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Vehicle } from "@/types/vehicles"
import { getVehicleStatusBadgeVariant } from "./vehicles.helpers"

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

export function VehicleDetailDialog({
  open,
  onOpenChange,
  vehicle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
}) {
  if (!vehicle) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{vehicle.stockNumber} • {vehicle.brand} {vehicle.model}</DialogTitle>
            <Badge variant={getVehicleStatusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>
          </div>
          <DialogDescription>
            {vehicle.year}{vehicle.variant ? ` • ${vehicle.variant}` : ""} • Updated{" "}
            {formatDistanceToNow(new Date(vehicle.updatedAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Target price" value={vehicle.targetSellingPrice ?? "Not set"} />
            <DetailRow label="Purchase price" value={vehicle.purchasePrice ?? "Not set"} />
            <DetailRow label="Minimum price" value={vehicle.minimumAcceptablePrice ?? "Not set"} />
            <DetailRow label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "Not set"} />
            <DetailRow label="Color" value={vehicle.color ?? "Not set"} />
            <DetailRow label="Transmission" value={vehicle.transmission ?? "Not set"} />
            <DetailRow label="Fuel type" value={vehicle.fuelType ?? "Not set"} />
            <DetailRow label="Photos" value={`${vehicle.photos.length}`} />
            <DetailRow label="Seller lead" value={vehicle.sellerLeadId ?? "Direct inventory"} />
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remarks</p>
            <p className="text-sm text-foreground">{vehicle.remarks ?? "No remarks recorded."}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Photo URLs</p>
            {vehicle.photos.length ? (
              <div className="space-y-2">
                {vehicle.photos.map((photo, index) => (
                  <div key={`${photo.fileUrl}-${index}`} className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {photo.fileUrl}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No photos recorded.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
