import { createPageMetadata } from "@/lib/metadata";
import { VehiclesScreen } from "@/components/vehicles/vehicles-screen";
import { parseVehicleStatusFilter } from "@/components/vehicles/vehicles.helpers";

export const metadata = createPageMetadata({
  title: "Vehicles",
  description:
    "Manage vehicle inventory, status, pricing, costs, and quality details.",
});

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialStatusFilter = parseVehicleStatusFilter(
    resolvedSearchParams.status,
  );

  return <VehiclesScreen initialStatusFilter={initialStatusFilter} />;
}
