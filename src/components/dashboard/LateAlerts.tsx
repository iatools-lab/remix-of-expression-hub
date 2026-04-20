import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Feb, isLate, pendingDays, STATUS_LABELS } from "@/types/feb";

interface LateAlertsProps {
  febs: Feb[];
  limit?: number;
}

export function LateAlerts({ febs, limit = 5 }: LateAlertsProps) {
  const late = febs.filter(isLate).sort((a, b) => pendingDays(b) - pendingDays(a));
  if (late.length === 0) return null;

  return (
    <section className="rounded-lg border border-destructive/20 bg-destructive-soft/30">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-destructive/10">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-medium text-foreground">
          {late.length} FEB en retard
        </h3>
        <span className="text-xs text-muted-foreground">· bloquées depuis 5+ jours</span>
      </div>
      <div className="divide-y divide-border/60">
        {late.slice(0, limit).map((f) => (
          <Link
            key={f.id}
            to={`/febs/${f.id}`}
            className="flex items-center justify-between px-5 py-3 hover:bg-card/60 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{f.natureBesoin}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {f.numero} · {STATUS_LABELS[f.status]} · {f.demandeurName}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-xs font-medium text-destructive tabular-nums">
                {pendingDays(f)} j
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
