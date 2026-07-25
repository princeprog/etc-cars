import { FinancingSettingsScreen } from "@/components/financing/financing-settings-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Financing Settings",
  description: "Manage financing partners and requirement templates.",
})

export default function FinancingSettingsPage() {
  return <FinancingSettingsScreen />
}
