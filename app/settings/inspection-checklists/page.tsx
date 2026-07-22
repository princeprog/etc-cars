import { InspectionChecklistsScreen } from "@/components/settings/inspection-checklists-screen";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Inspection Checklist",
  description: "Customize the dealership vehicle inspection checklist.",
});

export default function InspectionChecklistsPage() {
  return <InspectionChecklistsScreen />;
}
