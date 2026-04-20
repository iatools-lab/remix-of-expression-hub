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
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {showAllLink && (
          <Link to="/febs" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {febs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          {febs.map((f) => (
            <Link
              to={`/febs/${f.id}`}
              key={f.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">{f.natureBesoin}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{f.numero}</span> · {f.departement} · {format(new Date(f.updatedAt), "dd MMM", { locale: fr })}
                </p>
              </div>
              <StatusBadge status={f.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
