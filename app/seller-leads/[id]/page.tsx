import { SellerLeadEvaluationPage } from "@/components/seller-leads/seller-leads-screen"

export default async function SellerLeadEvaluationRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <SellerLeadEvaluationPage leadId={id} />
}
