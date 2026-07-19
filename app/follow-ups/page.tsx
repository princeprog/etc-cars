import { createPageMetadata } from "@/lib/metadata";
import { FollowUpsScreen } from "@/components/follow-ups/follow-ups-screen";

export const metadata = createPageMetadata({
  title: "Follow-Ups",
  description:
    "Manage due, overdue, upcoming, and completed lead follow-up tasks.",
});

export default function FollowUpsPage() {
  return <FollowUpsScreen />;
}
