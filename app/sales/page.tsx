import { createPageMetadata } from "@/lib/metadata";
import { SalesScreen } from "@/components/sales/sales-screen";

export const metadata = createPageMetadata({
  title: "Sales",
  description:
    "Finalize deals, manage sale drafts, and review closed vehicle sales.",
});

export default function SalesPage() {
  return <SalesScreen />;
}
