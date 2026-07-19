import { createPageMetadata } from "@/lib/metadata";
import { SellerLeadEvaluationPage } from "@/components/seller-leads/seller-lead-evaluation-page";

export const metadata = createPageMetadata({
  title: "Seller Lead Evaluation",
  description:
    "Evaluate seller lead details, vehicle information, and acquisition context.",
});

export default async function SellerLeadEvaluationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerLeadEvaluationPage leadId={id} />;
}
