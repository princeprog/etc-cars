import { createPageMetadata } from "@/lib/metadata";
import { SellerLeadInspectionPage } from "@/components/seller-leads/seller-lead-inspection-page";

export const metadata = createPageMetadata({
  title: "Vehicle Inspection",
  description:
    "Capture checklist ratings, repair estimates, and inspection readiness.",
});

export default async function SellerLeadInspectionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerLeadInspectionPage leadId={id} />;
}
