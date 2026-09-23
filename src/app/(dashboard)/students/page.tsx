import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata = { title: "Students" };

export default function StudentsPage() {
  return (
    <ModulePlaceholder
      title="Students"
      description="Student registry and enrollment management."
      backHref="/dashboard"
    />
  );
}
