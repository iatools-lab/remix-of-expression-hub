import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  History,
  PlusCircle,
  Inbox,
  LogOut,
  PenLine,
} from "lucide-react";
import logo from "@/assets/upowa-logo.jpg";
import { useFebStore } from "@/store/feb-store";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_LABELS, isValidatorRole, canActOn } from "@/types/feb";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const febs = useFebStore((s) => s.febs);
  const ensureUser = useFebStore((s) => s.ensureUserFromAuth);
  const current = useFebStore((s) => s.getCurrentUser());

  // Sync the FEB store's current user with the authenticated user.
  useEffect(() => {
    if (authUser) ensureUser(authUser);
  }, [authUser, ensureUser]);

  const isValidator = isValidatorRole(current.role);
  const pendingCount = isValidator
    ? febs.filter((f) => canActOn(f, current.role)).length
    : 0;

  const navItems = isValidator
    ? [
        { to: "/", label: "Accueil", icon: LayoutDashboard, end: true },
        {
          to: "/validation",
          label: "FEB en attente",
          icon: Inbox,
          end: false,
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { to: "/historique", label: "Historique FEB", icon: History, end: false },
        { to: "/febs/nouveau", label: "Nouvelle FEB", icon: PlusCircle, end: false },
        { to: "/signature", label: "Ma signature", icon: PenLine, end: false },
      ]
    : [
        { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
        { to: "/historique", label: "Historique FEB", icon: History, end: false },
        { to: "/febs/nouveau", label: "Nouvelle FEB", icon: PlusCircle, end: false },
      ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="upöwa logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">upöwa</p>
            <p className="text-xs text-sidebar-foreground/70">FEB Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge !== undefined && (
                  <span className="bg-warning text-warning-foreground text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User block */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-2.5 py-2 rounded-md bg-sidebar-accent/50">
            <p className="font-medium text-white text-sm leading-tight truncate">
              {current.name}
            </p>
            <p className="text-[11px] text-sidebar-foreground/70 mt-0.5 truncate">
              {ROLE_LABELS[current.role]}
            </p>
            {authUser && (
              <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 truncate font-mono">
                {authUser.email}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div
          className="max-w-[1400px] mx-auto p-8 animate-fade-in"
          key={location.pathname}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
