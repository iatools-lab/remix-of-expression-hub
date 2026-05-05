import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFebStore, formatXAF } from "@/store/feb-store";
import { canActOn, ROLE_LABELS, roleForStatus, RECEIVED_VIA_LABELS } from "@/types/feb";
import { StatusBadge } from "@/components/StatusBadge";
import { ValidationTimeline } from "@/components/ValidationTimeline";
import { exportFebPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Send, Check, X, Calendar, Building2, User, Truck, AlertCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FebDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const feb = useFebStore((s) => s.febs.find((f) => f.id === id));
  const user = useFebStore((s) => s.getCurrentUser());
  const submitFeb = useFebStore((s) => s.submitFeb);
  const approveFeb = useFebStore((s) => s.approveFeb);
  const rejectFeb = useFebStore((s) => s.rejectFeb);
  const updateFeb = useFebStore((s) => s.updateFeb);

  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [editingTracking, setEditingTracking] = useState(false);

  // Post-validation tracking fields (local state for editing)
  const [trackProjectName, setTrackProjectName] = useState("");
  const [trackFebDetails, setTrackFebDetails] = useState("");
  const [trackReceivedVia, setTrackReceivedVia] = useState<string>("plateforme");
  const [trackBudgetSpend, setTrackBudgetSpend] = useState<number>(0);
  const [trackAssignee, setTrackAssignee] = useState("");
  const [trackHistorySpend, setTrackHistorySpend] = useState<number>(0);
  const [poTransmissionDate, setPoTransmissionDate] = useState("");
  const [procurementLeadDays, setProcurementLeadDays] = useState<number>(5);
  const [actualDeliveryDate, setActualDeliveryDate] = useState("");
  const [challenges, setChallenges] = useState("");
  const [actionSolutions, setActionSolutions] = useState("");
  const [actualSpend, setActualSpend] = useState<number>(0);
  const [savings, setSavings] = useState("");

  if (!feb) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">FEB introuvable.</p>
        <Link to="/febs" className="text-info hover:underline mt-2 inline-block">Retour à la liste</Link>
      </div>
    );
  }

  const isOwnerDraft = feb.status === "brouillon" && feb.demandeurId === user.id;
  const canValidate = canActOn(feb, user.role);
  const expectedRole = roleForStatus(feb.status);

  const startEditTracking = () => {
    setTrackProjectName(feb.projectName ?? "");
    setTrackFebDetails(feb.febDetails ?? "");
    setTrackReceivedVia(feb.receivedVia ?? "plateforme");
    setTrackBudgetSpend(feb.budgetSpend ?? 0);
    setTrackAssignee(feb.assignee ?? "");
    setTrackHistorySpend(feb.historySpend ?? 0);
    setPoTransmissionDate(feb.poTransmissionDate ? feb.poTransmissionDate.slice(0, 10) : "");
    setProcurementLeadDays(feb.procurementLeadDays ?? 5);
    setActualDeliveryDate(feb.actualDeliveryDate ? feb.actualDeliveryDate.slice(0, 10) : "");
    setChallenges(feb.challenges ?? "");
    setActionSolutions(feb.actionSolutions ?? "");
    setActualSpend(feb.actualSpend ?? 0);
    setSavings(feb.savings ?? "");
    setEditingTracking(true);
  };

  const saveTracking = () => {
    updateFeb(feb.id, {
      projectName: trackProjectName.trim() || undefined,
      febDetails: trackFebDetails.trim() || undefined,
      receivedVia: (trackReceivedVia as any) || undefined,
      budgetSpend: trackBudgetSpend || undefined,
      assignee: trackAssignee.trim() || undefined,
      historySpend: trackHistorySpend || undefined,
      poTransmissionDate: poTransmissionDate ? new Date(poTransmissionDate).toISOString() : undefined,
      procurementLeadDays: procurementLeadDays || undefined,
      actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate).toISOString() : undefined,
      challenges: challenges.trim() || undefined,
      actionSolutions: actionSolutions.trim() || undefined,
      actualSpend: actualSpend || undefined,
      savings: savings.trim() || undefined,
    });
    setEditingTracking(false);
    toast.success("Suivi mis à jour");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">{feb.numero}</span>
              <StatusBadge status={feb.status} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{feb.natureBesoin}</h1>
            {feb.projectName && (
              <p className="text-sm font-medium text-primary">Projet : {feb.projectName}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {feb.departement}</span>
              <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {feb.demandeurName}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Livraison {format(new Date(feb.delaiLivraison), "dd MMM yyyy", { locale: fr })}</span>
              <span className="inline-flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> {feb.fournisseurPotentiel}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-xs text-muted-foreground">Montant total estimé</p>
            <p className="text-3xl font-bold text-foreground">{formatXAF(feb.totalEstime)}</p>
            <Button variant="outline" size="sm" onClick={() => exportFebPdf(feb)}>
              <Download className="w-4 h-4 mr-1.5" /> Exporter en PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items + Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* FEB Details */}
          {feb.febDetails && (
            <section className="card-elevated p-6">
              <h2 className="font-semibold text-foreground mb-2">Détails de la FEB</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{feb.febDetails}</p>
            </section>
          )}

          {/* Items table */}
          <section className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">Articles demandés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 px-2 font-semibold">N°</th>
                    <th className="py-2 px-2 font-semibold">Désignation</th>
                    <th className="py-2 px-2 font-semibold text-center">Qté</th>
                    <th className="py-2 px-2 font-semibold">Caractéristiques</th>
                    <th className="py-2 px-2 font-semibold text-right">Prix estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {feb.items.map((it, i) => (
                    <tr key={it.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-2 font-medium text-foreground">{it.designation}</td>
                      <td className="py-3 px-2 text-center">{it.quantite}</td>
                      <td className="py-3 px-2 text-muted-foreground">{it.caracteristiques || "—"}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatXAF(it.prixEstime)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="py-3 px-2 text-right">Total estimé</td>
                    <td className="py-3 px-2 text-right text-foreground">{formatXAF(feb.totalEstime)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Post-validation tracking */}
          <section className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Suivi approvisionnement</h2>
              {!editingTracking && (
                <Button variant="outline" size="sm" onClick={startEditTracking}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Modifier
                </Button>
              )}
            </div>

            {editingTracking ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date transmission PO</Label>
                  <Input type="date" value={poTransmissionDate} onChange={(e) => setPoTransmissionDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Délai approvisionnement (jours ouvrés)</Label>
                  <Input type="number" min={0} value={procurementLeadDays} onChange={(e) => setProcurementLeadDays(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label>Date livraison réelle</Label>
                  <Input type="date" value={actualDeliveryDate} onChange={(e) => setActualDeliveryDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Dépense réelle (FCFA)</Label>
                  <Input type="number" min={0} value={actualSpend} onChange={(e) => setActualSpend(Number(e.target.value))} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Économies négociées (XAF/EUR/USD)</Label>
                  <Input value={savings} onChange={(e) => setSavings(e.target.value)} placeholder="Ex: 150 000 FCFA / 230 EUR" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Défis rencontrés</Label>
                  <Textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="Décrivez les défis..." className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Actions / Solutions</Label>
                  <Textarea value={actionSolutions} onChange={(e) => setActionSolutions(e.target.value)} placeholder="Actions prises pour résoudre..." className="mt-1" />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={saveTracking}>Enregistrer</Button>
                  <Button variant="outline" onClick={() => setEditingTracking(false)}>Annuler</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TrackingField label="Date transmission PO" value={feb.poTransmissionDate ? format(new Date(feb.poTransmissionDate), "dd MMM yyyy", { locale: fr }) : undefined} />
                <TrackingField label="Délai appro. (jours ouvrés)" value={feb.procurementLeadDays != null ? `${feb.procurementLeadDays} j` : undefined} />
                <TrackingField label="Date livraison réelle" value={feb.actualDeliveryDate ? format(new Date(feb.actualDeliveryDate), "dd MMM yyyy", { locale: fr }) : undefined} />
                <TrackingField label="Dépense réelle" value={feb.actualSpend ? formatXAF(feb.actualSpend) : undefined} />
                <TrackingField label="Économies négociées" value={feb.savings} />
                <TrackingField label="Défis" value={feb.challenges} />
                <TrackingField label="Actions / Solutions" value={feb.actionSolutions} className="sm:col-span-2" />
              </div>
            )}
          </section>

          {/* Actions */}
          {(isOwnerDraft || canValidate) && (
            <section className="card-elevated p-6 border-l-4 border-l-info">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-info" />
                <h2 className="font-semibold text-foreground">Action requise</h2>
              </div>

              {isOwnerDraft && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Cette FEB est encore en brouillon. Soumettez-la pour démarrer le circuit de validation.
                  </p>
                  <Button
                    onClick={() => {
                      submitFeb(feb.id);
                      toast.success("FEB soumise pour validation");
                    }}
                    className="bg-primary hover:bg-primary-glow"
                  >
                    <Send className="w-4 h-4 mr-2" /> Soumettre pour validation
                  </Button>
                </div>
              )}

              {canValidate && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    En tant que <span className="font-semibold text-foreground">{ROLE_LABELS[user.role]}</span>, vous devez valider ou rejeter cette fiche.
                  </p>
                  <Textarea
                    placeholder="Commentaire optionnel pour la validation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    className="bg-card"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => {
                        approveFeb(feb.id, comment.trim() || undefined);
                        setComment("");
                        toast.success("FEB approuvée");
                      }}
                      className="bg-success hover:bg-success/90 text-success-foreground"
                    >
                      <Check className="w-4 h-4 mr-2" /> Approuver
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <X className="w-4 h-4 mr-2" /> Rejeter
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rejeter cette FEB ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est définitive. Indiquez le motif du rejet — il sera visible par le demandeur et tous les valideurs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Motif du rejet (obligatoire)..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          maxLength={500}
                          className="my-2"
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRejectReason("")}>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (!rejectReason.trim()) {
                                toast.error("Le motif est obligatoire");
                                return;
                              }
                              rejectFeb(feb.id, rejectReason.trim());
                              setRejectReason("");
                              toast.success("FEB rejetée");
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Confirmer le rejet
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </section>
          )}

          {!isOwnerDraft && !canValidate && expectedRole && feb.status !== "validee" && feb.status !== "rejetee" && (
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
              En attente de validation par : <span className="font-semibold text-foreground">{ROLE_LABELS[expectedRole]}</span>.
              Connectez-vous avec ce rôle pour pouvoir agir.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">Circuit de validation</h2>
            <ValidationTimeline feb={feb} />
          </section>

          <section className="card-elevated p-6 space-y-2">
            <h2 className="font-semibold text-foreground mb-2">Informations</h2>
            <MetaRow label="Créée le" value={format(new Date(feb.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })} />
            <MetaRow label="Mise à jour" value={format(new Date(feb.updatedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })} />
            {feb.receivedDate && <MetaRow label="Reçue le" value={format(new Date(feb.receivedDate), "dd MMM yyyy", { locale: fr })} />}
            {feb.receivedVia && <MetaRow label="Reçue via" value={RECEIVED_VIA_LABELS[feb.receivedVia]} />}
            {feb.assignee && <MetaRow label="Assignée" value={feb.assignee} />}
            <MetaRow label="Validation technique" value={feb.needsTechnicalReview ? "Requise" : "Non requise"} />
            {feb.budgetSpend != null && feb.budgetSpend > 0 && <MetaRow label="Budget alloué" value={formatXAF(feb.budgetSpend)} />}
            {feb.historySpend != null && feb.historySpend > 0 && <MetaRow label="Historique dépenses" value={formatXAF(feb.historySpend)} />}
          </section>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function TrackingField({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
    </div>
  );
}
