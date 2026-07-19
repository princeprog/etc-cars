import { createPageMetadata } from "@/lib/metadata";
import { VehicleDetailsPage } from "@/components/vehicles/vehicle-details-page";

export const metadata = createPageMetadata({
  title: "Vehicle Details",
  description:
    "Review vehicle information, quality signals, photos, and inventory state.",
});

export default async function VehicleDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VehicleDetailsPage vehicleId={id} />;
}
