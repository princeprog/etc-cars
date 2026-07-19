import { createPageMetadata } from "@/lib/metadata";
import { VehicleCreatePage } from "@/components/vehicles/vehicle-create-page";

export const metadata = createPageMetadata({
  title: "Add Vehicle",
  description: "Create a new vehicle record for dealership inventory.",
});

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <VehicleCreatePage searchParams={await searchParams} />;
}
