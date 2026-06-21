import { VehicleCreatePage } from "@/components/vehicles/vehicle-create-page"

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <VehicleCreatePage searchParams={await searchParams} />
}
