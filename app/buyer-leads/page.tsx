import { createPageMetadata } from "@/lib/metadata";
import { BuyerLeadsScreen } from "@/components/buyer-leads/buyer-leads-screen";

export const metadata = createPageMetadata({
  title: "Buyer Leads",
  description:
    "Manage buyer inquiries, budgets, statuses, and demand follow-ups.",
});

export default function BuyerLeadsPage() {
  return <BuyerLeadsScreen />;
}
