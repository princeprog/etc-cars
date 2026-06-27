import { SellerLeadEvaluationPage } from "@/components/seller-leads/seller-lead-evaluation-page"

export default async function SellerLeadEvaluationRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <SellerLeadEvaluationPage leadId={id} />
}
