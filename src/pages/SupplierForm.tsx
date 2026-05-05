import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import {
  Supplier,
  SupplierStatus,
  SupplierRating,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
} from "@/types/supplier";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "@/hooks/use-toast";

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "nouveau";

  const suppliers = useSupplierStore((s) => s.suppliers);
  const categories = useSupplierStore((s) => s.categories);
  const createSupplier = useSupplierStore((s) => s.createSupplier);
  const updateSupplier = useSupplierStore((s) => s.updateSupplier);
  const deleteSupplier = useSupplierStore((s) => s.deleteSupplier);

  const existing = isEdit ? suppliers.find((s) => s.id === id) : undefined;

  const [form, setForm] = useState<Omit<Supplier, "id" | "createdAt" | "updatedAt">>({
    raisonSociale: "",
    sigle: "",
    niu: "",
    rccm: "",
    adresse: "",
    ville: "",
    pays: "Cameroun",
    telephone: "",
    email: "",
    siteWeb: "",
    contactNom: "",
    contactFonction: "",
    contactTelephone: "",
    contactEmail: "",
    status: "actif",
    rating: undefined,
    notes: "",
    categories: [],
  });

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing;
      setForm(rest);
    }
  }, [existing]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(c: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  }

  function handleSave() {
    if (!form.raisonSociale.trim()) {
      toast({ title: "Raison sociale requise", variant: "destructive" });
      return;
    }
    if (isEdit && existing) {
      updateSupplier(existing.id, form);
      toast({ title: "Prestataire mis à jour" });
      navigate(`/prestataires/${existing.id}`);
    } else {
      const created = createSupplier(form);
      toast({ title: "Prestataire créé" });
      navigate(`/prestataires/${created.id}`);
    }
  }

  function handleDelete() {
    if (!existing) return;
    deleteSupplier(existing.id);
    toast({ title: "Prestataire supprimé" });
    navigate("/prestataires");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={isEdit ? `/prestataires/${id}` : "/prestataires"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </Button>
        {isEdit && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce prestataire ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Les bons d'achat existants conserveront le nom
                  du prestataire en snapshot mais le lien sera perdu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Modifier le prestataire" : "Nouveau prestataire"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Renseignez les informations légales, le contact commercial et les catégories.
        </p>
      </div>

      {/* Identité */}
      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Identité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="rs">Raison sociale *</Label>
            <Input
              id="rs"
              value={form.raisonSociale}
              onChange={(e) => update("raisonSociale", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sigle">Sigle / Nom commercial</Label>
            <Input
              id="sigle"
              value={form.sigle ?? ""}
              onChange={(e) => update("sigle", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="niu">NIU</Label>
            <Input id="niu" value={form.niu ?? ""} onChange={(e) => update("niu", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rccm">RCCM</Label>
            <Input
              id="rccm"
              value={form.rccm ?? ""}
              onChange={(e) => update("rccm", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pays">Pays</Label>
            <Input id="pays" value={form.pays} onChange={(e) => update("pays", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="adr">Adresse</Label>
            <Input
              id="adr"
              value={form.adresse ?? ""}
              onChange={(e) => update("adresse", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ville">Ville</Label>
            <Input
              id="ville"
              value={form.ville ?? ""}
              onChange={(e) => update("ville", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tel">Téléphone</Label>
            <Input
              id="tel"
              value={form.telephone ?? ""}
              onChange={(e) => update("telephone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="web">Site web</Label>
            <Input
              id="web"
              value={form.siteWeb ?? ""}
              onChange={(e) => update("siteWeb", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Contact commercial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cn">Nom du contact</Label>
            <Input
              id="cn"
              value={form.contactNom ?? ""}
              onChange={(e) => update("contactNom", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cf">Fonction</Label>
            <Input
              id="cf"
              value={form.contactFonction ?? ""}
              onChange={(e) => update("contactFonction", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ct">Téléphone direct</Label>
            <Input
              id="ct"
              value={form.contactTelephone ?? ""}
              onChange={(e) => update("contactTelephone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ce">Email direct</Label>
            <Input
              id="ce"
              type="email"
              value={form.contactEmail ?? ""}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Évaluation + Catégories */}
      <section className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Évaluation & catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Statut</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v as SupplierStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SUPPLIER_STATUS_LABELS) as SupplierStatus[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SUPPLIER_STATUS_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Évaluation</Label>
            <Select
              value={form.rating ?? "none"}
              onValueChange={(v) =>
                update("rating", v === "none" ? undefined : (v as SupplierRating))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Non évalué" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non évalué</SelectItem>
                {(Object.keys(SUPPLIER_RATING_LABELS) as SupplierRating[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SUPPLIER_RATING_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Catégories d'achat</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={form.categories.includes(c)}
                    onCheckedChange={() => toggleCategory(c)}
                  />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Observations, points forts/faibles, raison de blacklist…"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to={isEdit ? `/prestataires/${id}` : "/prestataires"}>Annuler</Link>
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? "Enregistrer" : "Créer le prestataire"}
        </Button>
      </div>
    </div>
  );
}
