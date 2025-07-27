import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Menu,
  X,
  Signal,
  WifiOff,
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
  Megaphone,
  MessageSquare,
  LayoutGrid,
  Briefcase,
} from "lucide-react";
import { useMediaQuery } from '@mui/material';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConnectionStatus } from "@/components/common/OfflineIndicator";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDisplayName, getRoleColor } from "@/lib/auth";
import { useOfflineStatus } from "@/lib/offline";
import { cn } from "@/lib/utils";

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
  {
    label: "My Applications",
    href: "/volunteer/my-applications",
    icon: Briefcase,
    roles: ["volunteer"],
  },
  {
    label: "Publications",
    href: "/volunteer/Publications",
    icon: FileText,
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
    label: "My Research Projects",
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
  {
    label: "Threat Map",
    href: "/researcher/threat-map",
    icon: Map,
    roles: ["researcher"],
  },
  {
    label: "Research Analytics",
    href: "/researcher/analytics",
    icon: BarChart3,
    roles: ["researcher"],
  },
  {
    label: "Publications",
    href: "/researcher/publications",
    icon: FileText,
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
  {
    label: "Communications",
    href: "/ranger/communications",
    icon: MessageSquare,
    roles: ["ranger"],
  },
  {
    label: "Publications",
    href: "/ranger/Publications",
    icon: FileText,
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
    label: "Threat Map",
    href: "/admin/threat-map",
    icon: Map,
    roles: ["administrator"],
  },
  {
    label: "User Management",
    href: "/admin/user-management",
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
    label: "Communications",
    href: "/admin/communications",
    icon: MessageSquare,
    roles: ["administrator"],
  },
  {
    label: "System Settings",
    href: "/admin/system-settings",
    icon: Settings,
    roles: ["administrator"],
  },
  {
    label: "Publications",
    href: "/admin/Publications",
    icon: FileText,
    roles: ["administrator"],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:1024px)');

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/auth/login");
    }
  }, [user, authLoading, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  console.log('Current user role:', user.role);

  const userNavItemsRaw = navigationItems.filter((item) =>
    item.roles.includes(user.role),
  );

  // Sort alphabetically by label, but keep the dashboard page first
  let userNavItems = userNavItemsRaw;
  const dashboardLabels = {
    administrator: "Admin Dashboard",
    ranger: "Ranger Dashboard",
    volunteer: "Volunteer Dashboard",
    researcher: "Research Dashboard",
  };
  const dashboardLabel = dashboardLabels[user.role] || "";
  const dashboardItem = userNavItemsRaw.find((item) => item.label === dashboardLabel);
  const otherItems = userNavItemsRaw.filter((item) => item.label !== dashboardLabel);
  otherItems.sort((a, b) => a.label.localeCompare(b.label));
  userNavItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;

  console.log('Filtered navigation items:', userNavItems);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Header with Toggle Button */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex items-center justify-between z-50">
          <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <Mountain className="h-8 w-8 text-emerald-600" />
                <Leaf className="h-4 w-4 text-amber-600 absolute -bottom-1 -right-1" />
              </div>
              <div>
              <h1 className="text-xl font-bold text-emerald-800">EcoRwanda</h1>
                <p className="text-xs text-emerald-600">Conservation Portal</p>
            </div>
          </Link>
          <button onClick={toggleSidebar} className="p-2 focus:outline-none">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          </div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile
            ? 'fixed inset-y-0 left-0 z-40 bg-white w-64 p-4 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto'
            : 'relative w-64 flex-shrink-0 bg-white p-4 h-screen overflow-y-auto shadow-lg'}
          ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          ${isMobile && !isSidebarOpen ? 'hidden' : 'block'}
        `}
      >
        {/* Sidebar Content (same as before) */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <Mountain className="h-10 w-10 text-emerald-600" />
              <Leaf className="h-5 w-5 text-amber-600 absolute -bottom-1 -right-1" />
              </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">EcoRwanda</h1>
              <p className="text-xs text-emerald-600">Conservation Portal</p>
            </div>
          </Link>
          {isMobile && (
            <button onClick={toggleSidebar} className="p-2 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center text-lg font-bold text-green-800 mx-auto mb-2">
            {(user?.firstName || '').charAt(0).toUpperCase()}{(user?.lastName || '').charAt(0).toUpperCase()}
          </div>
          <p className="text-lg font-semibold text-gray-900">Welcome back, {user?.firstName}!</p>
          <p className="text-sm text-gray-600">{user?.role === 'administrator' ? 'Admin' : user?.role} </p>
          <div className="mt-2">
            {isOnline ? (
              <span className="text-emerald-600 text-sm flex items-center justify-center">
                <Signal className="h-4 w-4 mr-1" /> Online
              </span>
            ) : (
              <span className="text-amber-600 text-sm flex items-center justify-center">
                <WifiOff className="h-4 w-4 mr-1" /> Offline
              </span>
            )}
            </div>
          </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {userNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 p-3 rounded-md text-gray-700 hover:bg-gray-200 transition-colors duration-200
                    ${location.pathname === item.href ? 'bg-green-100 text-green-700 font-semibold' : ''}
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          </nav>

        <div className="mt-auto border-t pt-4">
            <Button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-100"
              variant="ghost"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          © 2025 EcoRwanda. All rights reserved.
        </div>
        <div className="text-center mt-4">
          <Link
            to="/terms-and-conditions"
            className="text-xs text-gray-400 hover:text-emerald-700 underline transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </Link>
        </div>
      </aside>

      {/* Gap between sidebar and main content */}
      <div className="w-[7px] min-h-screen bg-transparent" />

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 w-full max-w-full overflow-x-hidden transition-all duration-300 px-2 sm:px-4 md:px-6 lg:px-8 ${isMobile ? 'pt-20 mr-[10px]' : 'mr-[10px]'}`}
      >
        {children}
      </main>
    </div>
  );
};
