import { ExpenseDetailScreen } from "@/components/expenses/expense-detail-screen"

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ExpenseDetailScreen expenseId={id} />
}
