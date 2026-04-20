import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useFebStore } from "@/store/feb-store";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentFebList } from "@/components/dashboard/RecentFebList";

export default function DemandeurDashboard() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());

  const mine = febs.filter((f) => f.demandeurId === user.id);
  const total = mine.length;
  const enCours = mine.filter(
    (f) => f.status.startsWith("en_attente") || f.status === "brouillon"
  ).length;
  const validees = mine.filter((f) => f.status === "validee").length;
  const rejetees = mine.filter((f) => f.status === "rejetee").length;

  const recent = [...mine]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {format(new Date(), "EEEE dd MMMM", { locale: fr })}
          </p>
          <h1 className="text-2xl font-semibold text-foreground mt-1 tracking-tight">
            Bonjour {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total === 0
              ? "Vous n'avez pas encore créé de FEB."
              : `${total} fiche${total > 1 ? "s" : ""} au total.`}
          </p>
        </div>
        <Link
          to="/febs/nouveau"
          className="inline-flex items-center gap-1.5 bg-foreground text-background px-3.5 py-2 rounded-md font-medium text-xs hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle FEB
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Mes FEB" value={total} accent="neutral" />
        <KpiCard label="En cours" value={enCours} accent="warning" />
        <KpiCard label="Validées" value={validees} accent="success" />
        <KpiCard label="Rejetées" value={rejetees} accent="destructive" />
      </div>

      <RecentFebList
        febs={recent}
        title="Mes FEB récentes"
        emptyMessage="Vous n'avez pas encore créé de FEB. Cliquez sur « Nouvelle FEB » pour commencer."
      />
    </div>
  );
}
