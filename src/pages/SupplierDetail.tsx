import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Building2, Mail, Phone, Globe, MapPin, Star, FileText } from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { usePurchaseOrderStore, formatXAF } from "@/store/purchase-order-store";
import { SUPPLIER_RATING_LABELS } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import { SupplierStatusBadge } from "@/components/SupplierStatusBadge";
import { POStatusBadge } from "@/components/POStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const suppliers = useSupplierStore((s) => s.suppliers);
  const allOrders = usePurchaseOrderStore((s) => s.orders);
  const supplier = useMemo(() => suppliers.find((x) => x.id === id), [suppliers, id]);
  const orders = useMemo(
    () => allOrders.filter((o) => o.lines.some((l) => l.supplierId === id)),
    [allOrders, id]
  );

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Prestataire introuvable.</p>
        <Button asChild>
          <Link to="/prestataires">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, o) => {
    const linesForSupplier = o.lines.filter((l) => l.supplierId === id);
    return (
      acc +
      linesForSupplier.reduce(
        (s, l) => s + l.quantite * l.prixUnitaireHt * (1 + l.tauxTva / 100),
        0
      )
    );
  }, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/prestataires">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
      </Button>

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <Building2 className="w-7 h-7 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">{supplier.raisonSociale}</h1>
            <SupplierStatusBadge status={supplier.status} />
          </div>
          {supplier.sigle && (
            <p className="text-muted-foreground mt-1 ml-10">Sigle : {supplier.sigle}</p>
          )}
        </div>
        <Button onClick={() => navigate(`/prestataires/${supplier.id}/modifier`)}>
          <Pencil className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">Bons d'achat</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">Volume total TTC</p>
          <p className="text-2xl font-bold mt-1">{formatXAF(totalSpent)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">Évaluation</p>
          <p className="text-2xl font-bold mt-1 flex items-center gap-2">
            {supplier.rating ? (
              <>
                <Star className="w-5 h-5 text-warning fill-warning" />
                {SUPPLIER_RATING_LABELS[supplier.rating]}
              </>
            ) : (
              <span className="text-muted-foreground text-base">Non évalué</span>
            )}
          </p>
        </div>
      </div>

      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Identité légale & coordonnées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="NIU" value={supplier.niu} />
          <Field label="RCCM" value={supplier.rccm} />
          <Field
            label="Adresse"
            value={[supplier.adresse, supplier.ville, supplier.pays].filter(Boolean).join(", ")}
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
          <Field label="Téléphone" value={supplier.telephone} icon={<Phone className="w-3.5 h-3.5" />} />
          <Field label="Email" value={supplier.email} icon={<Mail className="w-3.5 h-3.5" />} />
          <Field label="Site web" value={supplier.siteWeb} icon={<Globe className="w-3.5 h-3.5" />} />
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Contact commercial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Nom" value={supplier.contactNom} />
          <Field label="Fonction" value={supplier.contactFonction} />
          <Field label="Téléphone direct" value={supplier.contactTelephone} />
          <Field label="Email direct" value={supplier.contactEmail} />
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-lg">Catégories</h2>
        <div className="flex flex-wrap gap-2">
          {supplier.categories.length === 0 && (
            <span className="text-sm text-muted-foreground">Aucune catégorie.</span>
          )}
          {supplier.categories.map((c) => (
            <span
              key={c}
              className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium border"
            >
              {c}
            </span>
          ))}
        </div>
        {supplier.notes && (
          <>
            <h3 className="font-medium text-sm mt-4">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.notes}</p>
          </>
        )}
      </section>

      <section className="bg-card border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Bons d'achat liés ({orders.length})
        </h2>
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun bon d'achat n'a encore été émis pour ce prestataire.
          </p>
        )}
        <div className="divide-y">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/bons-achat/${o.id}`}
              className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded"
            >
              <div>
                <p className="font-semibold">{o.numero}</p>
                <p className="text-xs text-muted-foreground">
                  {o.objet} · {format(new Date(o.createdAt), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
              <POStatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5 flex items-center gap-1.5">
        {icon}
        {value || <span className="text-muted-foreground font-normal">—</span>}
      </p>
    </div>
  );
}
