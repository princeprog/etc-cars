"use client"

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicles"
import type { VehicleFormValues } from "./vehicles.helpers"

export function VehicleForm({
  values,
  onChange,
  includeSoldStatus = false,
}: {
  values: VehicleFormValues
  onChange: (values: VehicleFormValues) => void
  includeSoldStatus?: boolean
}) {
  const availableStatuses = includeSoldStatus
    ? VEHICLE_STATUSES
    : VEHICLE_STATUSES.filter((status) => status !== "Sold")

  function updateField<K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) {
    onChange({ ...values, [key]: value })
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
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="stockNumber">Stock number</FieldLabel>
            <Input
              id="stockNumber"
              value={values.stockNumber}
              onChange={(e) => updateField("stockNumber", e.target.value)}
              placeholder="ETC-2026-001"
              required
            />
          </Field>
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
            <Input id="transmission" value={values.transmission} onChange={(e) => updateField("transmission", e.target.value)} placeholder="Automatic" />
          </Field>
          <Field>
            <FieldLabel htmlFor="fuelType">Fuel type</FieldLabel>
            <Input id="fuelType" value={values.fuelType} onChange={(e) => updateField("fuelType", e.target.value)} placeholder="Diesel" />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Commercial Details</h3>
          <p className="text-sm text-muted-foreground">
            These values drive margin review and determine whether the unit is ready to move into saleable inventory.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel>
            <Input id="purchasePrice" value={values.purchasePrice} onChange={(e) => updateField("purchasePrice", e.target.value)} placeholder="850000" />
          </Field>
          <Field>
            <FieldLabel htmlFor="targetSellingPrice">Target selling price</FieldLabel>
            <Input id="targetSellingPrice" value={values.targetSellingPrice} onChange={(e) => updateField("targetSellingPrice", e.target.value)} placeholder="925000" />
          </Field>
          <Field>
            <FieldLabel htmlFor="minimumAcceptablePrice">Minimum acceptable price</FieldLabel>
            <Input
              id="minimumAcceptablePrice"
              value={values.minimumAcceptablePrice}
              onChange={(e) => updateField("minimumAcceptablePrice", e.target.value)}
              placeholder="900000"
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Media and Notes</h3>
          <p className="text-sm text-muted-foreground">
            Include photo URLs and any intake notes that will help the next staff member continue the workflow.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="photoUrls">Photo URLs</FieldLabel>
          <Textarea
            id="photoUrls"
            value={values.photoUrls}
            onChange={(e) => updateField("photoUrls", e.target.value)}
            rows={4}
            placeholder="One URL per line"
          />
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
