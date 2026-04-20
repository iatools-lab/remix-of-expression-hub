import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Inbox, BarChart3, List } from "lucide-react";
import { useFebStore } from "@/store/feb-store";
import { averageValidationDays, canActOn, isLate, pendingDays } from "@/types/feb";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LateAlerts } from "@/components/dashboard/LateAlerts";
import { ValidationQueue } from "@/components/dashboard/ValidationQueue";
import { RecentFebList } from "@/components/dashboard/RecentFebList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_COLORS = [
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

export default function ValidateurDashboard() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());

  const toValidate = febs
    .filter((f) => canActOn(f, user.role))
    .sort((a, b) => pendingDays(b) - pendingDays(a));

  const total = febs.length;
  const enCours = febs.filter((f) => f.status.startsWith("en_attente")).length;
  const validees = febs.filter((f) => f.status === "validee").length;
  const lateCount = febs.filter(isLate).length;
  const avgDays = averageValidationDays(febs);

  // Charts data
  const byDept = Object.entries(
    febs.reduce<Record<string, number>>((acc, f) => {
      acc[f.departement] = (acc[f.departement] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 14) + "…" : name, value }))
    .sort((a, b) => b.value - a.value);

  const byStatus = Object.entries(
    febs.reduce<Record<string, number>>((acc, f) => {
      const k = f.status.startsWith("en_attente")
        ? "En cours"
        : f.status === "validee"
        ? "Validée"
        : f.status === "rejetee"
        ? "Rejetée"
        : "Brouillon";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // 14-day trend
  const trend = Array.from({ length: 14 }).map((_, i) => {
    const day = startOfDay(subDays(new Date(), 13 - i));
    const dayMs = day.getTime();
    const nextMs = dayMs + 24 * 3600 * 1000;
    const count = febs.filter((f) => {
      const t = new Date(f.createdAt).getTime();
      return t >= dayMs && t < nextMs;
    }).length;
    return { date: format(day, "dd/MM", { locale: fr }), count };
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {format(new Date(), "EEEE dd MMMM", { locale: fr })}
          </p>
          <h1 className="text-2xl font-semibold text-foreground mt-1 tracking-tight">
            Bonjour {user.name.split(" ")[0]}
          </h1>
        </div>
        <Link
          to="/febs/nouveau"
          className="inline-flex items-center gap-1.5 bg-foreground text-background px-3.5 py-2 rounded-md font-medium text-xs hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle FEB
        </Link>
      </header>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="bg-transparent p-0 h-auto border-b border-border rounded-none w-full justify-start gap-6">
          <TabsTrigger
            value="queue"
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-0 pb-3 pt-0 text-sm font-medium gap-2"
          >
            <Inbox className="w-3.5 h-3.5" />
            À valider
            {toValidate.length > 0 && (
              <span className="bg-foreground text-background text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center tabular-nums">
                {toValidate.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-0 pb-3 pt-0 text-sm font-medium gap-2"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-0 pb-3 pt-0 text-sm font-medium gap-2"
          >
            <List className="w-3.5 h-3.5" />
            Toutes
          </TabsTrigger>
        </TabsList>

        {/* Tab 1 — Action queue */}
        <TabsContent value="queue" className="space-y-6 mt-0">
          <LateAlerts febs={febs} />
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">Votre file d'attente</h2>
              <p className="text-xs text-muted-foreground">
                {toValidate.length} en attente de votre action
              </p>
            </div>
            <ValidationQueue febs={toValidate} />
          </div>
        </TabsContent>

        {/* Tab 2 — Analytics */}
        <TabsContent value="analytics" className="space-y-6 mt-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Total" value={total} accent="neutral" />
            <KpiCard label="En cours" value={enCours} accent="warning" />
            <KpiCard label="Validées" value={validees} accent="success" />
            <KpiCard label="En retard" value={lateCount} accent="destructive" />
            <KpiCard label="Délai moyen" value={avgDays} suffix="j" accent="info" />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground mb-1">Activité — 14 derniers jours</h3>
            <p className="text-xs text-muted-foreground mb-4">FEB créées par jour</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.5}
                  dot={{ r: 2.5, fill: "hsl(var(--foreground))" }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-foreground mb-4">FEB par département</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byDept} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">Statuts</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {byStatus.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="tabular-nums text-foreground font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3 — All recent */}
        <TabsContent value="all" className="mt-0">
          <RecentFebList
            febs={[...febs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10)}
            title="Activité récente"
            emptyMessage="Aucune FEB."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
