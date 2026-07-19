import { createPageMetadata } from "@/lib/metadata";
import { ActivityHistoryScreen } from "@/components/activity-history/activity-history-screen";

export const metadata = createPageMetadata({
  title: "Activity History",
  description:
    "Review dealership activity logs, workflow changes, and user actions.",
});

export default function ActivityHistoryPage() {
  return <ActivityHistoryScreen />;
}
