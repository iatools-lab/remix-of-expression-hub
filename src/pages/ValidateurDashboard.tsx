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
  Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpRight, Bell, CheckCircle2, Clock, FileText, Timer, XCircle } from "lucide-react";
import { useFebStore } from "@/store/feb-store";
import { averageValidationDays, canActOn } from "@/types/feb";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";

const PIE_COLORS = [
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

export default function ValidateurDashboard() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());

  const toValidate = febs.filter((f) => canActOn(f, user.role));
  const total = febs.length;
  const enCours = febs.filter((f) => f.status.startsWith("en_attente")).length;
  const validees = febs.filter((f) => f.status === "validee").length;
  const rejetees = febs.filter((f) => f.status === "rejetee").length;
  const avgDays = averageValidationDays(febs);

  const byDept = Object.entries(
    febs.reduce<Record<string, number>>((acc, f) => {
      acc[f.departement] = (acc[f.departement] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, value }));

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

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bonjour <span className="font-medium text-foreground">{user.name}</span> — vue d'ensemble du circuit de
            validation.
          </p>
        </div>
        <Link
          to="/febs/nouveau"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-glow transition-colors shadow-[var(--shadow-md)]"
        >
          <FileText className="w-4 h-4" />
          Nouvelle FEB
        </Link>
      </header>

      {/* Action queue — top priority for validators */}
      <section className="rounded-xl border border-warning/30 bg-warning-soft/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning text-warning-foreground flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">FEB à valider</h2>
              <p className="text-sm text-muted-foreground">
                {toValidate.length === 0
                  ? "Aucune FEB en attente de votre validation."
                  : `${toValidate.length} fiche${toValidate.length > 1 ? "s" : ""} attend${
                      toValidate.length > 1 ? "ent" : ""
                    } votre action.`}
              </p>
            </div>
          </div>
          {toValidate.length > 0 && (
            <Link
              to="/febs"
              className="text-xs text-info font-medium inline-flex items-center gap-1 hover:underline"
            >
              Voir la liste <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {toValidate.length > 0 && (
          <div className="space-y-2">
            {toValidate.slice(0, 4).map((f) => (
              <Link
                to={`/febs/${f.id}`}
                key={f.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate text-foreground">{f.natureBesoin}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.numero} · {f.demandeurName} · {f.departement} ·{" "}
                    {format(new Date(f.updatedAt), "dd MMM", { locale: fr })}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* KPIs (volumes + delays, no amounts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={FileText} label="Total fiches" value={total} accent="info" />
        <KpiCard icon={Clock} label="En cours" value={enCours} accent="warning" />
        <KpiCard icon={CheckCircle2} label="Validées" value={validees} accent="success" />
        <KpiCard icon={XCircle} label="Rejetées" value={rejetees} accent="destructive" />
        <KpiCard icon={Timer} label="Délai moyen" value={avgDays} suffix="j" accent="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">FEB par département</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDept} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {byStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
