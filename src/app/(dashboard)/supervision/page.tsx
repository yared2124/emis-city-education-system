import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Supervision" };

export default function SupervisionPage() {
  return (
    <ModulePlaceholder
      title="Supervision"
      description="School supervision visits, inspections and findings."
      backHref="/dashboard"
    />
  );
}
