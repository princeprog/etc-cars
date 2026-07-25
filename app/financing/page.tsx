import { FinancingScreen } from "@/components/financing/financing-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Financing",
  description: "Manage buyer vehicle financing applications.",
})

export default function FinancingPage() {
  return <FinancingScreen />
}
