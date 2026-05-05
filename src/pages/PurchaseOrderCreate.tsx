import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { useFebStore } from "@/store/feb-store";
import { usePurchaseOrderStore, formatXAF } from "@/store/purchase-order-store";
import {
  PurchaseOrderLine,
  computeLineTotals,
  computeOrderTotals,
} from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();
  const allSuppliers = useSupplierStore((s) => s.suppliers);
  const suppliers = useMemo(
    () => allSuppliers.filter((x) => x.status === "actif"),
    [allSuppliers]
  );
  const createOrder = usePurchaseOrderStore((s) => s.createOrder);
  const allFebs = useFebStore((s) => s.febs);
  const approvedFebs = useMemo(
    () => allFebs.filter((f) => f.status === "validee" || f.status === "en_attente_reception"),
    [allFebs]
  );

  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [devise, setDevise] = useState("XAF");
  const [conditions, setConditions] = useState("30 jours fin de mois");
  const [dateLivraison, setDateLivraison] = useState("");
  const [selectedFebId, setSelectedFebId] = useState("");

  const [lines, setLines] = useState<PurchaseOrderLine[]>([
    {
      id: crypto.randomUUID(),
      position: 1,
      designation: "",
      caracteristiques: "",
      quantite: 1,
      unite: "u",
      prixUnitaireHt: 0,
      tauxTva: 19.25,
      supplierId: suppliers[0]?.id ?? "",
      supplierName: suppliers[0]?.raisonSociale ?? "",
    },
  ]);

  const totals = useMemo(() => computeOrderTotals(lines), [lines]);

  function updateLine(id: string, patch: Partial<PurchaseOrderLine>) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        // Sync supplierName when supplierId changes
        if (patch.supplierId !== undefined) {
          const sup = suppliers.find((s) => s.id === patch.supplierId);
          next.supplierName = sup?.raisonSociale ?? "";
        }
        return next;
      })
    );
  }

  function addLine() {
    setLines((ls) => [
      ...ls,
      {
        id: crypto.randomUUID(),
        position: ls.length + 1,
        designation: "",
        caracteristiques: "",
        quantite: 1,
        unite: "u",
        prixUnitaireHt: 0,
        tauxTva: 19.25,
        supplierId: suppliers[0]?.id ?? "",
        supplierName: suppliers[0]?.raisonSociale ?? "",
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((ls) => ls.filter((l) => l.id !== id).map((l, i) => ({ ...l, position: i + 1 })));
  }

  function handleSubmit(submit: boolean) {
    if (!objet.trim()) {
      toast({ title: "Objet requis", variant: "destructive" });
      return;
    }
    if (lines.length === 0) {
      toast({ title: "Ajoutez au moins une ligne", variant: "destructive" });
      return;
    }
    for (const l of lines) {
      if (!l.designation.trim() || !l.supplierId || l.quantite <= 0 || l.prixUnitaireHt < 0) {
        toast({
          title: "Ligne incomplète",
          description: "Désignation, prestataire, quantité et prix sont obligatoires.",
          variant: "destructive",
        });
        return;
      }
    }
    const po = createOrder({
      objet,
      description: description || undefined,
      devise,
      conditionsPaiement: conditions || undefined,
      dateLivraisonPrevue: dateLivraison || undefined,
      lines,
      submit,
    });
    toast({
      title: submit ? "Bon d'achat soumis au RPAF" : "Brouillon enregistré",
    });
    navigate(`/bons-achat/${po.id}`);
  }

  if (suppliers.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bons-achat">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div className="bg-card border rounded-lg p-8 text-center">
          <h2 className="font-semibold mb-2">Aucun prestataire actif</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Créez d'abord au moins un prestataire actif pour pouvoir émettre un bon d'achat.
          </p>
          <Button asChild>
            <Link to="/prestataires/nouveau">Créer un prestataire</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/bons-achat">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau bon d'achat</h1>
        <p className="text-muted-foreground mt-1">
          Plusieurs prestataires possibles : choisissez un fournisseur par ligne.
        </p>
      </div>

      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="objet">Objet *</Label>
            <Input
              id="objet"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder="Ex: Réapprovisionnement consommables Q2"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="desc">Description / motif</Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="devise">Devise</Label>
            <Select value={devise} onValueChange={setDevise}>
              <SelectTrigger id="devise">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dl">Date de livraison prévue</Label>
            <Input
              id="dl"
              type="date"
              value={dateLivraison}
              onChange={(e) => setDateLivraison(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="feb">FEB liée (optionnel)</Label>
            <Select value={selectedFebId} onValueChange={setSelectedFebId}>
              <SelectTrigger id="feb">
                <SelectValue placeholder="Aucune FEB liée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {approvedFebs.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.numero} — {f.natureBesoin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="cp">Conditions de paiement</Label>
            <Input
              id="cp"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Ex: 30 jours fin de mois"
            />
          </div>
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Lignes ({lines.length})</h2>
          <Button size="sm" variant="outline" onClick={addLine}>
            <Plus className="w-4 h-4 mr-1" />
            Ligne
          </Button>
        </div>

        <div className="space-y-3">
          {lines.map((l, idx) => {
            const t = computeLineTotals(l);
            return (
              <div
                key={l.id}
                className="border rounded-lg p-4 bg-background grid grid-cols-12 gap-3 items-start"
              >
                <div className="col-span-12 md:col-span-3">
                  <Label className="text-xs">Désignation *</Label>
                  <Input
                    value={l.designation}
                    onChange={(e) => updateLine(l.id, { designation: e.target.value })}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <Label className="text-xs">Caractéristiques</Label>
                  <Input
                    value={l.caracteristiques}
                    onChange={(e) => updateLine(l.id, { caracteristiques: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <Label className="text-xs">Qté *</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.quantite}
                    onChange={(e) => updateLine(l.id, { quantite: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <Label className="text-xs">Unité</Label>
                  <Input
                    value={l.unite}
                    onChange={(e) => updateLine(l.id, { unite: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <Label className="text-xs">PU HT *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={l.prixUnitaireHt}
                    onChange={(e) =>
                      updateLine(l.id, { prixUnitaireHt: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <Label className="text-xs">TVA %</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.tauxTva}
                    onChange={(e) => updateLine(l.id, { tauxTva: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Label className="text-xs">Prestataire *</Label>
                  <Select
                    value={l.supplierId}
                    onValueChange={(v) => updateLine(l.id, { supplierId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.raisonSociale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 flex items-center justify-between border-t pt-3 text-sm">
                  <div className="text-muted-foreground">
                    Ligne {idx + 1} · HT :{" "}
                    <span className="font-medium text-foreground">{formatXAF(t.totalHt)}</span>{" "}
                    · TTC :{" "}
                    <span className="font-medium text-foreground">{formatXAF(t.totalTtc)}</span>
                  </div>
                  {lines.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeLine(l.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Retirer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total HT</p>
            <p className="text-lg font-bold">{formatXAF(totals.totalHt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total TVA</p>
            <p className="text-lg font-bold">{formatXAF(totals.totalTva)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total TTC</p>
            <p className="text-lg font-bold text-primary">{formatXAF(totals.totalTtc)}</p>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => handleSubmit(false)}>
          Enregistrer en brouillon
        </Button>
        <Button onClick={() => handleSubmit(true)}>Soumettre au RPAF</Button>
      </div>
    </div>
  );
}
