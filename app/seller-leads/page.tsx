import { createPageMetadata } from "@/lib/metadata";
import { SellerLeadsScreen } from "@/components/seller-leads/seller-leads-screen";

export const metadata = createPageMetadata({
  title: "Seller Leads",
  description:
    "Manage seller acquisition inquiries, inspection status, and lead outcomes.",
});

export default function SellerLeadsPage() {
  return <SellerLeadsScreen />;
}
