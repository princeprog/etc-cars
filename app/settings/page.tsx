import { createPageMetadata } from "@/lib/metadata";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata = createPageMetadata({
  title: "Settings",
  description: "Manage workspace settings and dealership configuration.",
});

export default function SettingsPage() {
  return <SettingsScreen />;
}
