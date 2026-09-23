import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Settings"
      description="Users, roles, permissions and scope administration."
      backHref="/dashboard"
    />
  );
}
