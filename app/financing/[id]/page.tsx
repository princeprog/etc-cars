import { FinancingDetailScreen } from "@/components/financing/financing-detail-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Financing Application",
  description: "Review financing requirements and release workflow.",
})

export default async function FinancingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FinancingDetailScreen id={id} />
}
