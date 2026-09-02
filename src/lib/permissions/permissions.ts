export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",

  SCHOOLS_READ: "schools.read",
  SCHOOLS_CREATE: "schools.create",
  SCHOOLS_UPDATE: "schools.update",
  SCHOOLS_ARCHIVE: "schools.archive",

  TEACHERS_READ: "teachers.read",
  TEACHERS_CREATE: "teachers.create",
  TEACHERS_UPDATE: "teachers.update",
  TEACHERS_ARCHIVE: "teachers.archive",

  STAFF_READ: "staff.read",
  STAFF_CREATE: "staff.create",
  STAFF_UPDATE: "staff.update",
  STAFF_ARCHIVE: "staff.archive",

  STUDENTS_READ: "students.read",
  STUDENTS_CREATE: "students.create",
  STUDENTS_UPDATE: "students.update",

  TRANSFERS_READ: "transfers.read",
  TRANSFERS_CREATE: "transfers.create",
  TRANSFERS_REVIEW: "transfers.review",
  TRANSFERS_APPROVE: "transfers.approve",
  TRANSFERS_REJECT: "transfers.reject",
  TRANSFERS_COMPLETE: "transfers.complete",

  HR_READ: "hr.read",
  HR_SALARY_READ: "hr.salary.read",

  SUPERVISION_READ: "supervision.read",
  SUPERVISION_CREATE: "supervision.create",
  SUPERVISION_MANAGE: "supervision.manage",

  REPORTS_READ: "reports.read",
  REPORTS_GENERATE: "reports.generate",

  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  PERMISSIONS_MANAGE: "permissions.manage",
  SCOPES_MANAGE: "scopes.manage",

  AUDIT_READ: "audit.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
