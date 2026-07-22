import { RolesAccessScreen } from "@/components/settings/roles-access-screen";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "New Role",
  description: "Create a role for the workspace.",
});

export default function NewRolePage() {
  return <RolesAccessScreen createRoleDialogOpen />;
}
