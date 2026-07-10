import { VehicleTrackedCostsPage } from "@/components/vehicles/vehicle-tracked-costs-page"

export default async function VehicleCostsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <VehicleTrackedCostsPage vehicleId={id} />
}
