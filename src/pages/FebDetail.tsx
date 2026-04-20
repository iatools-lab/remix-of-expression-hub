import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFebStore, formatXAF } from "@/store/feb-store";
import { canActOn, ROLE_LABELS, roleForStatus } from "@/types/feb";
import { StatusBadge } from "@/components/StatusBadge";
import { ValidationTimeline } from "@/components/ValidationTimeline";
import { exportFebPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Send, Check, X, Calendar, Building2, User, Truck, AlertCircle } from "lucide-react";
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

  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

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

        {/* Timeline */}
        <div className="space-y-6">
          <section className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">Circuit de validation</h2>
            <ValidationTimeline feb={feb} />
          </section>

          <section className="card-elevated p-6 space-y-2">
            <h2 className="font-semibold text-foreground mb-2">Métadonnées</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Créée le</span>
              <span className="font-medium">{format(new Date(feb.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mise à jour</span>
              <span className="font-medium">{format(new Date(feb.updatedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Validation technique</span>
              <span className="font-medium">{feb.needsTechnicalReview ? "Requise" : "Non requise"}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
