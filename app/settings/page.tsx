import { createPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = createPageMetadata({
  title: "Settings",
  description: "Manage workspace settings and dealership configuration.",
});

export default function SettingsPage() {
  redirect("/settings/vehicle-catalog");
}
