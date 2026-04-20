import { useFebStore, formatXAF } from "@/store/feb-store";
import { STATUS_LABELS } from "@/types/feb";
import { ArrowUpRight, FileText, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
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
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PIE_COLORS = ["hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

export default function Dashboard() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());

  const total = febs.length;
  const enCours = febs.filter((f) => f.status.startsWith("en_attente")).length;
  const validees = febs.filter((f) => f.status === "validee").length;
  const rejetees = febs.filter((f) => f.status === "rejetee").length;
  const montantTotal = febs.filter((f) => f.status === "validee").reduce((s, f) => s + f.totalEstime, 0);
  const montantEnCours = febs.filter((f) => f.status.startsWith("en_attente")).reduce((s, f) => s + f.totalEstime, 0);

  // Per department
  const byDept = Object.entries(
    febs.reduce<Record<string, number>>((acc, f) => {
      acc[f.departement] = (acc[f.departement] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, value }));

  // Status pie
  const byStatus = Object.entries(
    febs.reduce<Record<string, number>>((acc, f) => {
      const k = f.status.startsWith("en_attente") ? "En cours" : f.status === "validee" ? "Validée" : f.status === "rejetee" ? "Rejetée" : "Brouillon";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Top fournisseurs
  const fournisseurs = Object.entries(
    febs.reduce<Record<string, { count: number; total: number }>>((acc, f) => {
      const key = f.fournisseurPotentiel || "Non spécifié";
      if (!acc[key]) acc[key] = { count: 0, total: 0 };
      acc[key].count += 1;
      acc[key].total += f.totalEstime;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const recent = [...febs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, <span className="font-medium text-foreground">{user.name}</span> — vue d'ensemble des fiches d'expression de besoin.
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={FileText} label="Total fiches" value={total} accent="info" />
        <KPI icon={Clock} label="En cours de validation" value={enCours} accent="warning" />
        <KPI icon={CheckCircle2} label="Validées" value={validees} accent="success" />
        <KPI icon={XCircle} label="Rejetées" value={rejetees} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Montant total validé</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatXAF(montantTotal)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Montant en attente de validation</p>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatXAF(montantEnCours)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">FEB par département</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDept} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
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
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent + Top fournisseurs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">FEB récentes</h3>
            <Link to="/febs" className="text-xs text-info font-medium inline-flex items-center gap-1 hover:underline">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((f) => (
              <Link
                to={`/febs/${f.id}`}
                key={f.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate text-foreground">{f.natureBesoin}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.numero} · {f.departement} · {format(new Date(f.updatedAt), "dd MMM", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-foreground">{formatXAF(f.totalEstime)}</span>
                  <StatusBadge status={f.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Top fournisseurs</h3>
          <div className="space-y-3">
            {fournisseurs.map(([name, data], i) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground truncate pr-2">{name}</span>
                  <span className="text-muted-foreground shrink-0">{data.count} FEB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-primary h-full rounded-full"
                    style={{ width: `${(data.total / fournisseurs[0][1].total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatXAF(data.total)}</p>
              </div>
            ))}
            {fournisseurs.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: "info" | "warning" | "success" | "destructive" }) {
  const colors = {
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
    destructive: "bg-destructive-soft text-destructive",
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
