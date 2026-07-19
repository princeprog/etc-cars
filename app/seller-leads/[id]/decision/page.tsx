import { createPageMetadata } from "@/lib/metadata";
import { SellerLeadDecisionPage } from "@/components/seller-leads/seller-lead-decision-page";

export const metadata = createPageMetadata({
  title: "Seller Lead Decision",
  description:
    "Record acquisition decisions, offers, and seller lead outcomes.",
});

export default async function SellerLeadDecisionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerLeadDecisionPage leadId={id} />;
}
