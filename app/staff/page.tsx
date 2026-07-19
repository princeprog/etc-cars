import { createPageMetadata } from "@/lib/metadata";
import { StaffScreen } from "@/components/staff/staff-screen";

export const metadata = createPageMetadata({
  title: "Staff",
  description: "Manage staff accounts, access status, and team administration.",
});

export default function StaffPage() {
  return <StaffScreen />;
}
