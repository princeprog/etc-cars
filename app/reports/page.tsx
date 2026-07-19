import { createPageMetadata } from "@/lib/metadata";
import { ReportsScreen } from "@/components/reports/reports-screen";

export const metadata = createPageMetadata({
  title: "Reports",
  description:
    "Analyze dealership sales, inventory, lead, expense, and profitability reports.",
});

export default function ReportsPage() {
  return <ReportsScreen />;
}
