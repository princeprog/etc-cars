import { createPageMetadata } from "@/lib/metadata";
import { VehicleTrackedCostsPage } from "@/components/vehicles/vehicle-tracked-costs-page";

export const metadata = createPageMetadata({
  title: "Vehicle Costs",
  description:
    "Track acquisition, repair, and reconditioning costs for a vehicle.",
});

export default async function VehicleCostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VehicleTrackedCostsPage vehicleId={id} />;
}
