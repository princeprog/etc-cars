import { VehiclePricingPage } from "@/components/vehicles/vehicle-pricing-page"

export default async function PricingVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <VehiclePricingPage vehicleId={id} />
}
