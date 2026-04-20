import { useMemo, useState } from "react";
import { Inbox, Filter } from "lucide-react";
import { useFebStore } from "@/store/feb-store";
import { canActOn, pendingDays, DEPARTMENTS } from "@/types/feb";
import { ValidationQueue } from "@/components/dashboard/ValidationQueue";
import { LateAlerts } from "@/components/dashboard/LateAlerts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Validation() {
  const febs = useFebStore((s) => s.febs);
  const user = useFebStore((s) => s.getCurrentUser());
  const [scope, setScope] = useState<"mine" | "all_pending">("mine");
  const [dept, setDept] = useState<string>("all");

  const queue = useMemo(() => {
    const base =
      scope === "mine"
        ? febs.filter((f) => canActOn(f, user.role))
        : febs.filter((f) => f.status.startsWith("en_attente"));
    return base
      .filter((f) => (dept === "all" ? true : f.departement === dept))
      .sort((a, b) => pendingDays(b) - pendingDays(a));
  }, [febs, user.role, scope, dept]);

  const mineCount = febs.filter((f) => canActOn(f, user.role)).length;
  const allPendingCount = febs.filter((f) => f.status.startsWith("en_attente")).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          <Inbox className="w-3.5 h-3.5" />
          Validation
        </div>
        <h1 className="text-2xl font-semibold text-foreground mt-1 tracking-tight">
          FEB en attente de validation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mineCount} en attente de votre action · {allPendingCount} dans le circuit total
        </p>
      </header>

      <LateAlerts febs={febs} />

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
          <SelectTrigger className="w-full sm:w-64 h-9 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mine">À valider par moi ({mineCount})</SelectItem>
            <SelectItem value="all_pending">
              Tout le circuit en cours ({allPendingCount})
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-full sm:w-60 h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous départements</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ValidationQueue febs={queue} />
    </div>
  );
}
