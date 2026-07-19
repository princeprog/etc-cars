import { createPageMetadata } from "@/lib/metadata";
import { ExpenseCategoriesScreen } from "@/components/settings/expense-categories-screen";

export const metadata = createPageMetadata({
  title: "Expense Categories",
  description:
    "Configure expense categories used for bills and monthly reporting.",
});

export default function ExpenseCategoriesPage() {
  return <ExpenseCategoriesScreen />;
}
