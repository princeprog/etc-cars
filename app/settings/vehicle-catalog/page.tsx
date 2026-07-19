import { createPageMetadata } from "@/lib/metadata";
import { VehicleCatalogScreen } from "@/components/settings/vehicle-catalog-screen";

export const metadata = createPageMetadata({
  title: "Vehicle Catalog",
  description:
    "Manage vehicle brands, models, and variants used across inventory.",
});

export default function VehicleCatalogPage() {
  return <VehicleCatalogScreen />;
}
