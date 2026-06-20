"use client"

import * as React from "react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateVehicleMutation } from "@/hooks/mutations/vehicles/use-create-vehicle-mutation"
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query"
import { getApiErrorMessage } from "@/types/api"
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicles"

function parsePhotoLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((fileUrl, index) => ({ fileUrl, sortOrder: index }))
}

export function VehiclesScreen() {
  const vehiclesQuery = useVehiclesQuery()
  const createMutation = useCreateVehicleMutation()
  const [form, setForm] = React.useState({
    stockNumber: "",
    brand: "",
    model: "",
    year: "",
    variant: "",
    color: "",
    transmission: "",
    fuelType: "",
    mileage: "",
    purchasePrice: "",
    targetSellingPrice: "",
    minimumAcceptablePrice: "",
    status: "Incoming" as VehicleStatus,
    photoUrls: "",
    remarks: "",
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createMutation.mutateAsync(
      {
        stockNumber: form.stockNumber,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        variant: form.variant || null,
        color: form.color || null,
        transmission: form.transmission || null,
        fuelType: form.fuelType || null,
        mileage: form.mileage ? Number(form.mileage) : null,
        purchasePrice: form.purchasePrice || null,
        targetSellingPrice: form.targetSellingPrice || null,
        minimumAcceptablePrice: form.minimumAcceptablePrice || null,
        status: form.status,
        photos: parsePhotoLines(form.photoUrls),
        remarks: form.remarks || null,
      },
      {
        onSuccess: () => {
          toast.success("Vehicle created")
          setForm({
            stockNumber: "",
            brand: "",
            model: "",
            year: "",
            variant: "",
            color: "",
            transmission: "",
            fuelType: "",
            mileage: "",
            purchasePrice: "",
            targetSellingPrice: "",
            minimumAcceptablePrice: "",
            status: "Incoming",
            photoUrls: "",
            remarks: "",
          })
        },
      },
    )
  }

  return (
    <AuthenticatedAppShell title="Vehicles">
      <div className="grid flex-1 gap-6 p-4 md:p-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create Vehicle</CardTitle>
            <CardDescription>Enter direct inventory and include photo URLs when preparing Available stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <ApiErrorAlert title="Unable to create vehicle" message={getApiErrorMessage(createMutation.error, "")} />
                <Field><FieldLabel htmlFor="stockNumber">Stock number</FieldLabel><Input id="stockNumber" value={form.stockNumber} onChange={(e) => setForm((v) => ({ ...v, stockNumber: e.target.value }))} required /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field><FieldLabel htmlFor="brand">Brand</FieldLabel><Input id="brand" value={form.brand} onChange={(e) => setForm((v) => ({ ...v, brand: e.target.value }))} required /></Field>
                  <Field><FieldLabel htmlFor="model">Model</FieldLabel><Input id="model" value={form.model} onChange={(e) => setForm((v) => ({ ...v, model: e.target.value }))} required /></Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field><FieldLabel htmlFor="year">Year</FieldLabel><Input id="year" type="number" value={form.year} onChange={(e) => setForm((v) => ({ ...v, year: e.target.value }))} required /></Field>
                  <Field><FieldLabel htmlFor="status">Status</FieldLabel><Select value={form.status} onValueChange={(value) => setForm((v) => ({ ...v, status: value as VehicleStatus }))}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_STATUSES.filter((status) => status !== "Sold").map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field><FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel><Input id="purchasePrice" value={form.purchasePrice} onChange={(e) => setForm((v) => ({ ...v, purchasePrice: e.target.value }))} /></Field>
                  <Field><FieldLabel htmlFor="targetSellingPrice">Target selling price</FieldLabel><Input id="targetSellingPrice" value={form.targetSellingPrice} onChange={(e) => setForm((v) => ({ ...v, targetSellingPrice: e.target.value }))} /></Field>
                </div>
                <Field><FieldLabel htmlFor="minimumAcceptablePrice">Minimum acceptable price</FieldLabel><Input id="minimumAcceptablePrice" value={form.minimumAcceptablePrice} onChange={(e) => setForm((v) => ({ ...v, minimumAcceptablePrice: e.target.value }))} /></Field>
                <Field><FieldLabel htmlFor="photoUrls">Photo URLs</FieldLabel><Textarea id="photoUrls" value={form.photoUrls} onChange={(e) => setForm((v) => ({ ...v, photoUrls: e.target.value }))} rows={3} placeholder="One URL per line" /></Field>
                <Field><FieldLabel htmlFor="remarks">Remarks</FieldLabel><Textarea id="remarks" value={form.remarks} onChange={(e) => setForm((v) => ({ ...v, remarks: e.target.value }))} rows={3} /></Field>
                <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating vehicle" className="w-full">Create vehicle</SubmitButton>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Live inventory records created through the current ETC API workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehiclesQuery.isPending ? (
              <ModuleLoadingState label="Loading vehicles" />
            ) : vehiclesQuery.data?.vehicles.length ? (
              vehiclesQuery.data.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">{vehicle.stockNumber} • {vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.year}{vehicle.variant ? ` • ${vehicle.variant}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-muted px-2 py-1">{vehicle.status}</span>
                      {vehicle.targetSellingPrice ? <span className="rounded-md bg-muted px-2 py-1">Target {vehicle.targetSellingPrice}</span> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Photos: {vehicle.photos.length} • Purchase: {vehicle.purchasePrice ?? "N/A"} • Minimum: {vehicle.minimumAcceptablePrice ?? "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No vehicles yet" description="Create the first inventory record to start matching and sales workflows." />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
