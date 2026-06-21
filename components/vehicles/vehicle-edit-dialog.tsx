"use client"

import * as React from "react"
import { toast } from "sonner"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateVehicleMutation } from "@/hooks/mutations/vehicles/use-update-vehicle-mutation"
import { getApiErrorMessage } from "@/types/api"
import type { Vehicle } from "@/types/vehicles"
import { buildUpdateVehiclePayload, getVehicleFormValues, type VehicleFormValues } from "./vehicles.helpers"
import { VehicleForm } from "./vehicle-form"

function VehicleEditDialogForm({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle
  onClose: () => void
}) {
  const updateMutation = useUpdateVehicleMutation()
  const [values, setValues] = React.useState<VehicleFormValues>(() => getVehicleFormValues(vehicle))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await updateMutation.mutateAsync(
      {
        id: vehicle.id,
        payload: buildUpdateVehiclePayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Vehicle updated")
          onClose()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ApiErrorAlert title="Unable to update vehicle" message={getApiErrorMessage(updateMutation.error, "")} />
      <VehicleForm values={values} onChange={setValues} />
      <DialogFooter>
        <SubmitButton type="submit" pending={updateMutation.isPending} pendingLabel="Saving changes">
          Save changes
        </SubmitButton>
      </DialogFooter>
    </form>
  )
}

export function VehicleEditDialog({
  open,
  onOpenChange,
  vehicle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>Update operational details without using the sales-only Sold transition.</DialogDescription>
        </DialogHeader>
        {vehicle ? (
          <VehicleEditDialogForm
            key={vehicle.id}
            vehicle={vehicle}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
