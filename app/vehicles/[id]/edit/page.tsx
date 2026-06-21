import { VehicleEditPage } from "@/components/vehicles/vehicle-edit-page"

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <VehicleEditPage vehicleId={id} />
}
