import { SellerLeadDecisionPage } from "@/components/seller-leads/seller-lead-evaluation-page";

export default async function SellerLeadDecisionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerLeadDecisionPage leadId={id} />;
}
