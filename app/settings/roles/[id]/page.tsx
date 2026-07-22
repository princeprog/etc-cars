import { RoleAccessDetailScreen } from "@/components/settings/role-access-detail-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Role Access",
  description: "Configure role details and access levels.",
})

export default async function RoleAccessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <RoleAccessDetailScreen roleId={id} />
}
