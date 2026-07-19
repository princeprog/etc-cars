import { createPageMetadata } from "@/lib/metadata";
import { VehiclePricingPage } from "@/components/vehicles/vehicle-pricing-page";

export const metadata = createPageMetadata({
  title: "Vehicle Pricing",
  description: "Review vehicle pricing guidance, margins, and sale readiness.",
});

export default async function PricingVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VehiclePricingPage vehicleId={id} />;
}
