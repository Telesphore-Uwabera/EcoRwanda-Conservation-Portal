import { UserRole } from "@/types/auth";

export const rolePermissions = {
  volunteer: [
    "submit_reports",
    "view_projects",
    "join_projects",
    "view_own_reports",
  ],
  researcher: [
    "publish_findings",
    "access_data_hub",
    "request_volunteers",
    "annotate_maps",
    "collaborate",
  ],
  ranger: [
    "verify_reports",
    "access_patrol_data",
    "integrate_smart_data",
    "prioritize_threats",
    "real_time_alerts",
  ],
  administrator: [
    "manage_users",
    "generate_analytics",
    "access_all_data",
    "system_settings",
    "user_verification",
  ],
};

export const hasPermission = (
  userRole: UserRole,
  permission: string,
): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    volunteer: "Volunteer",
    researcher: "Researcher",
    ranger: "Park Ranger",
    administrator: "Administrator",
  };
  return roleNames[role];
};

export const getRoleColor = (role: UserRole): string => {
  const roleColors = {
    volunteer: "bg-emerald-100 text-emerald-800",
    researcher: "bg-blue-100 text-blue-800",
    ranger: "bg-amber-100 text-amber-800",
    administrator: "bg-purple-100 text-purple-800",
  };
  return roleColors[role];
};

export const getDashboardRoute = (role: UserRole): string => {
  const routes = {
    volunteer: "/dashboard/volunteer",
    researcher: "/dashboard/researcher",
    ranger: "/dashboard/ranger",
    administrator: "/dashboard/admin",
  };
  return routes[role];
};
