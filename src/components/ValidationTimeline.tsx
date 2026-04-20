import { Feb, ROLE_LABELS, roleForStatus } from "@/types/feb";
import { Check, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Step {
  key: string;
  label: string;
  role: "responsable_technique" | "responsable_pole" | "rpaf" | "supply_chain";
}

export function ValidationTimeline({ feb }: { feb: Feb }) {
  const steps: Step[] = [
    ...(feb.needsTechnicalReview
      ? [{ key: "tech", label: "Resp. Pôle Technique", role: "responsable_technique" as const }]
      : []),
    { key: "pole", label: "Responsable du Pôle", role: "responsable_pole" },
    { key: "rpaf", label: "Resp. Pôle Admin & Financier", role: "rpaf" },
    { key: "reception", label: "Réception Supply Chain", role: "supply_chain" },
  ];

  const currentRole = roleForStatus(feb.status);
  const isRejected = feb.status === "rejetee";

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const validation = feb.validations.find((v) => v.role === step.role);
        const isCurrent = currentRole === step.role && !isRejected;
        const isDone = !!validation && validation.action === "approuvee";
        const isRejectedHere = !!validation && validation.action === "rejetee";

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors",
                  isDone && "bg-success border-success text-success-foreground",
                  isRejectedHere && "bg-destructive border-destructive text-destructive-foreground",
                  isCurrent && "bg-info border-info text-info-foreground animate-pulse",
                  !isDone && !isRejectedHere && !isCurrent && "bg-muted border-border text-muted-foreground"
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : isRejectedHere ? <X className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 my-1",
                    isDone ? "bg-success" : "bg-border"
                  )}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pb-6 flex-1">
              <p className={cn("font-semibold text-sm", (isCurrent || isDone) ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </p>
              {validation && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {validation.userName} —{" "}
                    {format(new Date(validation.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                  {validation.comment && (
                    <p className="text-xs italic text-muted-foreground bg-muted px-2 py-1 rounded mt-1">
                      « {validation.comment} »
                    </p>
                  )}
                </div>
              )}
              {isCurrent && (
                <p className="text-xs text-info font-medium mt-0.5">En attente d'action</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
