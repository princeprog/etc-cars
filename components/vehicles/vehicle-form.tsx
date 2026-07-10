"use client"

import * as React from "react"
import Image from "next/image"
import { ImagePlusIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react"

import { resolveApiAssetUrl } from "@/constants/api-config"
import { useUploadVehiclePhotoMutation } from "@/hooks/mutations/vehicles/use-upload-vehicle-photo-mutation"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/types/api"
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicles"
import type { VehicleFormValues } from "./vehicles.helpers"

const TRANSMISSION_OPTIONS = [
  "Automatic",
  "Manual",
  "CVT",
  "Semi-Automatic",
  "Dual-Clutch",
]

const FUEL_TYPE_OPTIONS = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Plug-in Hybrid",
  "Electric",
  "LPG",
]

export function VehicleForm({
  values,
  onChange,
  includeSoldStatus = false,
  showStockNumberField = true,
}: {
  values: VehicleFormValues
  onChange: (values: VehicleFormValues) => void
  includeSoldStatus?: boolean
  showStockNumberField?: boolean
}) {
  const availableStatuses = includeSoldStatus
    ? VEHICLE_STATUSES
    : VEHICLE_STATUSES.filter((status) => status !== "Sold")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const uploadMutation = useUploadVehiclePhotoMutation()

  function updateField<K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (!files.length) {
      return
    }

    const uploadedPhotos = []

    for (const file of files) {
      const response = await uploadMutation.mutateAsync(file)
      uploadedPhotos.push({ fileUrl: response.file.path })
    }

    updateField("photos", [...values.photos, ...uploadedPhotos])
    event.target.value = ""
  }

  function removePhoto(indexToRemove: number) {
    updateField(
      "photos",
      values.photos.filter((_, index) => index !== indexToRemove),
    )
  }

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Vehicle Identity</h3>
          <p className="text-sm text-muted-foreground">
            Capture the core inventory details used to identify the unit across intake, listing, and sales.
          </p>
        </div>
        <div className={`grid gap-4 ${showStockNumberField ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {showStockNumberField ? (
            <Field>
              <FieldLabel htmlFor="stockNumber">Stock number</FieldLabel>
              <Input id="stockNumber" value={values.stockNumber ?? ""} readOnly disabled />
              <FieldDescription>Generated automatically when the vehicle record is created.</FieldDescription>
            </Field>
          ) : null}
          <Field>
            <FieldLabel htmlFor="status">Inventory status</FieldLabel>
            <Select value={values.status} onValueChange={(value) => updateField("status", value as VehicleStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Use <span className="font-medium text-foreground">Available</span> only when pricing and photos are already complete.
            </FieldDescription>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="brand">Brand</FieldLabel>
            <Input id="brand" value={values.brand} onChange={(e) => updateField("brand", e.target.value)} placeholder="Toyota" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="model">Model</FieldLabel>
            <Input id="model" value={values.model} onChange={(e) => updateField("model", e.target.value)} placeholder="Fortuner" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input id="year" type="number" value={values.year} onChange={(e) => updateField("year", e.target.value)} placeholder="2024" required />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="variant">Variant</FieldLabel>
            <Input id="variant" value={values.variant} onChange={(e) => updateField("variant", e.target.value)} placeholder="2.8 LTD 4x4 AT" />
          </Field>
          <Field>
            <FieldLabel htmlFor="mileage">Mileage</FieldLabel>
            <Input id="mileage" type="number" value={values.mileage} onChange={(e) => updateField("mileage", e.target.value)} placeholder="12500" />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
          <p className="text-sm text-muted-foreground">
            Add the basic specs staff will need when evaluating, merchandising, and presenting the vehicle.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="color">Color</FieldLabel>
            <Input id="color" value={values.color} onChange={(e) => updateField("color", e.target.value)} placeholder="Black" />
          </Field>
          <Field>
            <FieldLabel htmlFor="transmission">Transmission</FieldLabel>
            <Select value={values.transmission || undefined} onValueChange={(value) => updateField("transmission", value)}>
              <SelectTrigger id="transmission">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fuelType">Fuel type</FieldLabel>
            <Select value={values.fuelType || undefined} onValueChange={(value) => updateField("fuelType", value)}>
              <SelectTrigger id="fuelType">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Acquisition Details</h3>
          <p className="text-sm text-muted-foreground">
            Capture the vehicle acquisition cost here. Sale pricing can be set later after tracked costs are complete.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel>
            <Input id="purchasePrice" value={values.purchasePrice} onChange={(e) => updateField("purchasePrice", e.target.value)} placeholder="850000" />
          </Field>
        </div>
      </section>

      <Separator />

      <section id="vehicle-photos" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Media and Notes</h3>
          <p className="text-sm text-muted-foreground">
            Upload local vehicle photos and add any intake notes that will help the next staff member continue the workflow.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="vehiclePhotos">Vehicle photos</FieldLabel>
          <div className="space-y-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Upload JPG, PNG, or WEBP images</p>
                <p className="text-xs text-muted-foreground">Maximum file size is 5MB per photo. Files are stored locally for now.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="vehiclePhotos"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <ImagePlusIcon />
                  )}
                  Upload photos
                </Button>
              </div>
            </div>
            {uploadMutation.error ? (
              <p className="text-sm text-destructive">{getApiErrorMessage(uploadMutation.error, "Photo upload failed")}</p>
            ) : null}
            {values.photos.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {values.photos.map((photo, index) => (
                  <div key={`${photo.fileUrl}-${index}`} className="overflow-hidden rounded-xl border bg-background">
                    <div className="relative aspect-[4/3] bg-muted">
                      <Image
                        src={resolveApiAssetUrl(photo.fileUrl)}
                        alt={`Vehicle upload ${index + 1}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">Photo {index + 1}</p>
                        <p className="truncate text-xs text-muted-foreground">{photo.fileUrl}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removePhoto(index)}
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/70 bg-background/80 px-4 py-6 text-center text-sm text-muted-foreground">
                No photos uploaded yet.
              </div>
            )}
          </div>
          <FieldDescription>
            At least one photo is required before a vehicle can move to <span className="font-medium text-foreground">Available</span>.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="remarks">Remarks</FieldLabel>
          <Textarea
            id="remarks"
            value={values.remarks}
            onChange={(e) => updateField("remarks", e.target.value)}
            rows={4}
            placeholder="Inspection notes, accessories, pending issues, or intake context"
          />
        </Field>
      </section>
    </FieldGroup>
  )
}
