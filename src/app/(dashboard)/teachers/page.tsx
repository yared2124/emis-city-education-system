import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Teachers" };

export default function TeachersPage() {
  return (
    <ModulePlaceholder
      title="Teachers"
      description="Teacher registry, qualifications and school assignments."
      backHref="/dashboard"
    />
  );
}
