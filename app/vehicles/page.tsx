import { createPageMetadata } from "@/lib/metadata";
import { VehiclesScreen } from "@/components/vehicles/vehicles-screen";

export const metadata = createPageMetadata({
  title: "Vehicles",
  description:
    "Manage vehicle inventory, status, pricing, costs, and quality details.",
});

export default function VehiclesPage() {
  return <VehiclesScreen />;
}
