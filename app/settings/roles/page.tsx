import { RolesAccessScreen } from "@/components/settings/roles-access-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Roles & Access",
  description: "Manage team roles and configurable access levels.",
})

export default function RolesAccessPage() {
  return <RolesAccessScreen />
}
