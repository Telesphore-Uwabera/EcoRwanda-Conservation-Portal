import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConnectionStatus } from "@/components/common/OfflineIndicator";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDisplayName, getRoleColor } from "@/lib/auth";
import { useOfflineStatus } from "@/lib/offline";
import { cn } from "@/lib/utils";
import {
  Mountain,
  Leaf,
  LayoutDashboard,
  FileText,
  MapPin,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  Camera,
  TreePine,
  Binoculars,
  Database,
  UserCheck,
  AlertTriangle,
  Map,
  Bell,
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  // Volunteer Navigation
  {
    label: "Volunteer Dashboard",
    href: "/dashboard/volunteer",
    icon: LayoutDashboard,
    roles: ["volunteer"],
  },
  {
    label: "Submit Report",
    href: "/volunteer/submit-report",
    icon: Camera,
    roles: ["volunteer"],
  },
  {
    label: "My Reports",
    href: "/volunteer/my-reports",
    icon: FileText,
    roles: ["volunteer"],
  },
  {
    label: "Conservation Projects",
    href: "/volunteer/projects",
    icon: TreePine,
    roles: ["volunteer"],
  },

  // Researcher Navigation
  {
    label: "Research Dashboard",
    href: "/dashboard/researcher",
    icon: LayoutDashboard,
    roles: ["researcher"],
  },
  {
    label: "Publish Findings",
    href: "/researcher/publish",
    icon: BookOpen,
    roles: ["researcher"],
  },
  {
    label: "Data Hub",
    href: "/researcher/data-hub",
    icon: Database,
    roles: ["researcher"],
  },
  {
    label: "Request Volunteers",
    href: "/researcher/request-volunteers",
    icon: Users,
    roles: ["researcher"],
  },

  // Ranger Navigation
  {
    label: "Ranger Dashboard",
    href: "/dashboard/ranger",
    icon: LayoutDashboard,
    roles: ["ranger"],
  },
  {
    label: "Verify Reports",
    href: "/ranger/verify-reports",
    icon: UserCheck,
    roles: ["ranger"],
  },
  {
    label: "Patrol Data",
    href: "/ranger/patrol-data",
    icon: Binoculars,
    roles: ["ranger"],
  },
  {
    label: "Threat Map",
    href: "/ranger/threat-map",
    icon: Map,
    roles: ["ranger"],
  },

  // Administrator Navigation
  {
    label: "Admin Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    roles: ["administrator"],
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["administrator"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["administrator"],
  },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["administrator"],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  console.log('Current user role:', user.role);

  const userNavItems = navigationItems.filter((item) =>
    item.roles.includes(user.role),
  );

  console.log('Filtered navigation items:', userNavItems);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Mountain className="h-8 w-8 text-emerald-600" />
                <Leaf className="h-4 w-4 text-amber-600 absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-800">
                  EcoRwanda
                </h1>
                <p className="text-xs text-emerald-600">Conservation Portal</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                  {`${user.firstName[0]}${user.lastName[0]}`}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  Welcome back, {user.firstName}!
                </p>
                <p className="text-sm text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <Badge className={cn("text-xs", getRoleColor(user.role))}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <ConnectionStatus isOnline={isOnline} />
              {!user.verified && (
                <Badge
                  variant="outline"
                  className="text-xs text-amber-600 border-amber-300"
                >
                  Pending Verification
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {userNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="py-6">
          <div className="mx-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
