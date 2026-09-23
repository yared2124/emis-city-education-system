import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Staff" };

export default function StaffPage() {
  return (
    <ModulePlaceholder
      title="Staff"
      description="Administrative and support staff directory."
      backHref="/dashboard"
    />
  );
}
