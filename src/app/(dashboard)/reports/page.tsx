import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="City, district and school-level performance reports."
      backHref="/dashboard"
    />
  );
}
