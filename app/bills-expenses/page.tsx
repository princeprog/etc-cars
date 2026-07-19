import { createPageMetadata } from "@/lib/metadata";
import { BillsExpensesScreen } from "@/components/expenses/bills-expenses-screen";

export const metadata = createPageMetadata({
  title: "Bills & Expenses",
  description:
    "Track dealership bills, expenses, recurring rules, and payment status.",
});

export default function BillsExpensesPage() {
  return <BillsExpensesScreen />;
}
