"use client"

import * as React from "react"
import { toast } from "@/components/ui/sileo"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCreateVehicleMutation } from "@/hooks/mutations/vehicles/use-create-vehicle-mutation"
import { getApiErrorMessage } from "@/types/api"
import { PlusIcon } from "lucide-react"
import { buildCreateVehiclePayload, getEmptyVehicleFormValues } from "./vehicles.helpers"
import { VehicleForm } from "./vehicle-form"

export function VehicleCreateDialog() {
  const createMutation = useCreateVehicleMutation()
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState(getEmptyVehicleFormValues)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(buildCreateVehiclePayload(values), {
      onSuccess: () => {
        toast.success("Vehicle created")
        setValues(getEmptyVehicleFormValues())
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="gap-3 border-b px-6 pt-6 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-lg">Create Vehicle</DialogTitle>
            <DialogDescription>
              Add a new inventory record with the commercial details, media, and specifications needed for operational handoff.
            </DialogDescription>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            Vehicles can only move to <span className="font-semibold">Available</span> after target price, minimum price, and at least one photo are present.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex max-h-[calc(90vh-88px)] flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <ApiErrorAlert title="Unable to create vehicle" message={getApiErrorMessage(createMutation.error, "")} />
              <VehicleForm values={values} onChange={setValues} />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4 sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Save as <span className="font-medium text-foreground">{values.status}</span> inventory record
            </p>
            <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating vehicle">
              Create vehicle
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
