import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Download,
  Send,
  PackageCheck,
  Lock,
  X,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useFebStore } from "@/store/feb-store";
import { usePurchaseOrderStore, formatXAF } from "@/store/purchase-order-store";
import { distinctSuppliers } from "@/types/purchase-order";
import { POStatusBadge } from "@/components/POStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { exportPurchaseOrderPdf } from "@/lib/po-pdf-export";

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = usePurchaseOrderStore((s) => s.orders.find((o) => o.id === id));
  const submitOrder = usePurchaseOrderStore((s) => s.submitOrder);
  const approveOrder = usePurchaseOrderStore((s) => s.approveOrder);
  const rejectOrder = usePurchaseOrderStore((s) => s.rejectOrder);
  const markSent = usePurchaseOrderStore((s) => s.markSent);
  const markReceived = usePurchaseOrderStore((s) => s.markReceived);
  const closeOrder = usePurchaseOrderStore((s) => s.closeOrder);
  const cancelOrder = usePurchaseOrderStore((s) => s.cancelOrder);
  const user = useFebStore((s) => s.getCurrentUser());

  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Bon d'achat introuvable.</p>
        <Button asChild>
          <Link to="/bons-achat">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const isOwnerDraft = order.createdById === user.id && order.status === "brouillon";
  const isRpaf = user.role === "rpaf" || user.role === "admin";
  const canValidate = isRpaf && order.status === "en_attente_rpaf";
  const canMarkSent = isRpaf && order.status === "approuve";
  const canMarkReceived =
    (user.role === "supply_chain" || isRpaf) && order.status === "envoye";
  const canClose = isRpaf && order.status === "receptionne";
  const canCancel = !["cloture", "annule", "rejete"].includes(order.status) && isRpaf;

  const sups = distinctSuppliers(order);

  return (
    <div className="space-y-6 max-w-6xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/bons-achat">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
      </Button>

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight font-mono">{order.numero}</h1>
            <POStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-2">{order.objet}</p>
        </div>
        <Button variant="outline" onClick={() => exportPurchaseOrderPdf(order)}>
          <Download className="w-4 h-4 mr-2" />
          Exporter en PDF
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total HT" value={formatXAF(order.totalHt)} />
        <Stat label="Total TVA" value={formatXAF(order.totalTva)} />
        <Stat label="Total TTC" value={formatXAF(order.totalTtc)} highlight />
        <Stat label="Prestataire(s)" value={String(sups.length)} />
      </div>

      <section className="bg-card border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-lg">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Demandeur" value={order.createdByName} />
          <Field label="Devise" value={order.devise} />
          <Field
            label="Date livraison prévue"
            value={
              order.dateLivraisonPrevue
                ? format(new Date(order.dateLivraisonPrevue), "dd MMMM yyyy", { locale: fr })
                : "—"
            }
          />
          <Field
            label="Date livraison réelle"
            value={
              order.dateLivraisonReelle
                ? format(new Date(order.dateLivraisonReelle), "dd MMMM yyyy", { locale: fr })
                : "—"
            }
          />
          <Field label="Conditions de paiement" value={order.conditionsPaiement ?? "—"} />
          <Field
            label="FEB liée"
            value={
              order.febId
                ? <Link to={`/feb/${order.febId}`} className="text-primary underline">{order.febNumero}</Link>
                : "—"
            }
          />
          <Field
            label="Créé le"
            value={format(new Date(order.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          />
        </div>
        {order.description && (
          <>
            <h3 className="font-medium text-sm pt-3">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.description}</p>
          </>
        )}
      </section>

      <section className="bg-card border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-lg">Lignes ({order.lines.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Désignation</TableHead>
              <TableHead>Prestataire</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="text-right">PU HT</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.lines.map((l) => {
              const ttc = l.quantite * l.prixUnitaireHt * (1 + l.tauxTva / 100);
              return (
                <TableRow key={l.id}>
                  <TableCell>{l.position}</TableCell>
                  <TableCell>
                    <p className="font-medium">{l.designation}</p>
                    {l.caracteristiques && (
                      <p className="text-xs text-muted-foreground">{l.caracteristiques}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{l.supplierName}</TableCell>
                  <TableCell className="text-right">
                    {l.quantite} {l.unite}
                  </TableCell>
                  <TableCell className="text-right">{formatXAF(l.prixUnitaireHt)}</TableCell>
                  <TableCell className="text-right">{l.tauxTva}%</TableCell>
                  <TableCell className="text-right font-medium">{formatXAF(ttc)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {/* Actions */}
      {(isOwnerDraft || canValidate || canMarkSent || canMarkReceived || canClose || canCancel) && (
        <section className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">Actions</h2>

          {isOwnerDraft && (
            <Button
              onClick={() => {
                submitOrder(order.id);
                toast({ title: "Soumis au RPAF" });
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Soumettre au RPAF
            </Button>
          )}

          {canValidate && (
            <div className="space-y-3">
              <Textarea
                placeholder="Commentaire (optionnel)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    approveOrder(order.id, comment || undefined);
                    toast({ title: "Bon d'achat approuvé" });
                    setComment("");
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approuver
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <X className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rejeter ce bon d'achat ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Indiquez le motif. Cette action est définitive.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Motif du rejet *"
                      className="my-3"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (!rejectReason.trim()) {
                            toast({ title: "Motif requis", variant: "destructive" });
                            return;
                          }
                          rejectOrder(order.id, rejectReason);
                          toast({ title: "Bon d'achat rejeté" });
                          setRejectReason("");
                        }}
                      >
                        Confirmer le rejet
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canMarkSent && (
              <Button
                variant="outline"
                onClick={() => {
                  markSent(order.id);
                  toast({ title: "Marqué comme envoyé au prestataire" });
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Marquer comme envoyé
              </Button>
            )}
            {canMarkReceived && (
              <Button
                variant="outline"
                onClick={() => {
                  markReceived(order.id);
                  toast({ title: "Réception enregistrée" });
                }}
              >
                <PackageCheck className="w-4 h-4 mr-2" />
                Marquer comme réceptionné
              </Button>
            )}
            {canClose && (
              <Button
                variant="outline"
                onClick={() => {
                  closeOrder(order.id);
                  toast({ title: "Bon d'achat clôturé" });
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Clôturer
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  cancelOrder(order.id);
                  toast({ title: "Bon d'achat annulé" });
                }}
              >
                <Ban className="w-4 h-4 mr-2" />
                Annuler le BA
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Approvals */}
      {order.approvals.length > 0 && (
        <section className="bg-card border rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">Validations RPAF</h2>
          <div className="space-y-2">
            {order.approvals.map((a, i) => (
              <div key={i} className="border rounded-md p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {a.userName} —{" "}
                    {a.action === "approuvee" ? (
                      <span className="text-success">✓ Approuvé</span>
                    ) : (
                      <span className="text-destructive">✗ Rejeté</span>
                    )}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(a.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
                {a.comment && (
                  <p className="text-muted-foreground mt-1 italic">« {a.comment} »</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
