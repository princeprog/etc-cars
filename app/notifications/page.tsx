import { createPageMetadata } from "@/lib/metadata";
import { NotificationsScreen } from "@/components/notifications/notifications-screen";

export const metadata = createPageMetadata({
  title: "Notifications",
  description: "Review dealership alerts, unread messages, and system updates.",
});

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
