import { SellerLeadInspectionPage } from "@/components/seller-leads/seller-lead-evaluation-page";

export default async function SellerLeadInspectionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerLeadInspectionPage leadId={id} />;
}
