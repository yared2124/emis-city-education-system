import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Transfers" };

export default function TransfersPage() {
  return (
    <ModulePlaceholder
      title="Transfers"
      description="Teacher transfer requests, review and approval workflow."
      backHref="/dashboard"
    />
  );
}
