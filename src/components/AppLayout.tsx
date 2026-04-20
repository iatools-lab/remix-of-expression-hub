import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, PlusCircle, Users, Inbox } from "lucide-react";
import logo from "@/assets/upowa-logo.jpg";
import { useFebStore } from "@/store/feb-store";
import { ROLE_LABELS, isValidatorRole, canActOn } from "@/types/feb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const users = useFebStore((s) => s.users);
  const febs = useFebStore((s) => s.febs);
  const currentUserId = useFebStore((s) => s.currentUserId);
  const setCurrentUser = useFebStore((s) => s.setCurrentUser);
  const current = users.find((u) => u.id === currentUserId)!;
  const location = useLocation();

  const isValidator = isValidatorRole(current.role);
  const pendingCount = isValidator ? febs.filter((f) => canActOn(f, current.role)).length : 0;

  const navItems = [
    {
      to: "/",
      label: isValidator ? "Tableau de bord" : "Mes FEB",
      icon: LayoutDashboard,
      end: true,
      badge: isValidator && pendingCount > 0 ? pendingCount : undefined,
      badgeIcon: Inbox,
    },
    { to: "/febs", label: "Toutes les FEB", icon: FileText, end: false },
    { to: "/febs/nouveau", label: "Nouvelle FEB", icon: PlusCircle, end: false },
  ];

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
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Role switcher */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground/60 uppercase tracking-wider font-semibold">
            <Users className="w-3 h-3" />
            Connecté en tant que
          </div>
          <Select value={currentUserId} onValueChange={setCurrentUser}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-white hover:bg-sidebar-accent/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="px-2 py-1.5 rounded-md bg-sidebar-accent/50 text-xs text-sidebar-foreground/80">
            <span className="font-medium text-white">{current.name}</span>
            <br />
            <span className="text-[11px]">{ROLE_LABELS[current.role]}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-8 animate-fade-in" key={location.pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}
