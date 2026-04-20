import { Link } from "react-router-dom";
import { FileText, CheckCircle2, XCircle, Clock, PlusCircle } from "lucide-react";
import { useFebStore } from "@/store/feb-store";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentFebList } from "@/components/dashboard/RecentFebList";

export default function DemandeurDashboard() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());

  const mine = febs.filter((f) => f.demandeurId === user.id);
  const total = mine.length;
  const enCours = mine.filter((f) => f.status.startsWith("en_attente") || f.status === "brouillon").length;
  const validees = mine.filter((f) => f.status === "validee").length;
  const rejetees = mine.filter((f) => f.status === "rejetee").length;

  const recent = [...mine]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes fiches d'expression de besoin</h1>
          <p className="text-muted-foreground mt-1">
            Bonjour <span className="font-medium text-foreground">{user.name}</span>, voici l'état de vos demandes.
          </p>
        </div>
        <Link
          to="/febs/nouveau"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-glow transition-colors shadow-[var(--shadow-md)]"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle FEB
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FileText} label="Mes FEB" value={total} accent="info" />
        <KpiCard icon={Clock} label="En cours" value={enCours} accent="warning" />
        <KpiCard icon={CheckCircle2} label="Validées" value={validees} accent="success" />
        <KpiCard icon={XCircle} label="Rejetées" value={rejetees} accent="destructive" />
      </div>

      <RecentFebList
        febs={recent}
        title="Mes FEB récentes"
        emptyMessage="Vous n'avez pas encore créé de FEB. Cliquez sur « Nouvelle FEB » pour commencer."
      />
    </div>
  );
}
