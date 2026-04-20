import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StatusBadge } from "@/components/StatusBadge";
import { Feb } from "@/types/feb";

interface RecentFebListProps {
  febs: Feb[];
  title?: string;
  emptyMessage?: string;
  showAllLink?: boolean;
}

export function RecentFebList({
  febs,
  title = "FEB récentes",
  emptyMessage = "Aucune FEB.",
  showAllLink = true,
}: RecentFebListProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {showAllLink && (
          <Link to="/febs" className="text-xs text-info font-medium inline-flex items-center gap-1 hover:underline">
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {febs.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">{emptyMessage}</p>}
        {febs.map((f) => (
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
            <StatusBadge status={f.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
