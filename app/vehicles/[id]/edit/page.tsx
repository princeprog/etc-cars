import { createPageMetadata } from "@/lib/metadata";
import { VehicleEditPage } from "@/components/vehicles/vehicle-edit-page";

export const metadata = createPageMetadata({
  title: "Edit Vehicle",
  description:
    "Update vehicle details, pricing, status, and catalog information.",
});

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VehicleEditPage vehicleId={id} />;
}
