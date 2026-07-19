import { createPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = createPageMetadata({
  title: "Home",
  description: "Open the dealership workspace dashboard.",
});

export default function Page() {
  redirect("/dashboard");
}
