import type { ComponentType, SVGProps } from "react";

import {
  AuditIcon,
  DashboardIcon,
  ReportsIcon,
  SchoolIcon,
  SettingsIcon,
  StaffIcon,
  StudentsIcon,
  SupervisionIcon,
  TeacherIcon,
  TransferIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  permission?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: DashboardIcon,
        permission: "dashboard.read",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Schools",
        href: "/schools",
        icon: SchoolIcon,
        permission: "schools.read",
      },
      {
        label: "Teachers",
        href: "/teachers",
        icon: TeacherIcon,
        permission: "teachers.read",
      },
      {
        label: "Staff",
        href: "/staff",
        icon: StaffIcon,
        permission: "staff.read",
      },
      {
        label: "Students",
        href: "/students",
        icon: StudentsIcon,
        permission: "students.read",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Transfers",
        href: "/transfers",
        icon: TransferIcon,
        permission: "transfers.read",
      },
      {
        label: "Supervision",
        href: "/supervision",
        icon: SupervisionIcon,
        permission: "supervision.read",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: ReportsIcon,
        permission: "reports.read",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
      },
      {
        label: "Audit log",
        href: "/audit",
        icon: AuditIcon,
        permission: "audit.read",
      },
    ],
  },
];
