import { FinancingSettingsScreen } from "@/components/financing/financing-settings-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Financing Settings",
  description: "Manage buyer financing upload requirements.",
})

export default function FinancingSettingsPage() {
  return <FinancingSettingsScreen />
}
