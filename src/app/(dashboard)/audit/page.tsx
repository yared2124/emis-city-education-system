import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Audit log" };

export default function AuditPage() {
  return (
    <ModulePlaceholder
      title="Audit log"
      description="Full trail of audited actions across the system."
      backHref="/dashboard"
    />
  );
}
