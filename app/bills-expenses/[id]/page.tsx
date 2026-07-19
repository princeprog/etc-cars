import { createPageMetadata } from "@/lib/metadata";
import { ExpenseDetailScreen } from "@/components/expenses/expense-detail-screen";

export const metadata = createPageMetadata({
  title: "Expense Details",
  description:
    "Review expense details, payment history, and supporting context.",
});

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ExpenseDetailScreen expenseId={id} />;
}
