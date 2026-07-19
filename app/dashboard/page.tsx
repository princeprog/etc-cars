import { createPageMetadata } from "@/lib/metadata";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "Monitor dealership performance, assigned work, sales, inventory, and activity.",
});

export default function DashboardPage() {
  return <DashboardScreen />;
}
