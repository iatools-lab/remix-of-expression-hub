import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Building2, Star } from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import {
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  SupplierStatus,
} from "@/types/supplier";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierStatusBadge } from "@/components/SupplierStatusBadge";
import { Button } from "@/components/ui/button";

const STATUSES: ("all" | SupplierStatus)[] = ["all", "actif", "inactif", "blackliste"];

export default function SuppliersList() {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const categories = useSupplierStore((s) => s.categories);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | SupplierStatus>("all");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    return suppliers
      .filter((s) => (status === "all" ? true : s.status === status))
      .filter((s) => (cat === "all" ? true : s.categories.includes(cat)))
      .filter((s) => {
        if (!q) return true;
        const needle = q.toLowerCase();
        return (
          s.raisonSociale.toLowerCase().includes(needle) ||
          (s.sigle ?? "").toLowerCase().includes(needle) ||
          (s.ville ?? "").toLowerCase().includes(needle) ||
          (s.contactNom ?? "").toLowerCase().includes(needle) ||
          (s.email ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [suppliers, status, cat, q]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prestataires</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} prestataire{filtered.length > 1 ? "s" : ""} référencé
            {filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link to="/prestataires/nouveau">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau prestataire
          </Link>
        </Button>
      </header>

      <div className="bg-card border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, sigle, ville, contact…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | SupplierStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "Tous les statuts" : SUPPLIER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raison sociale</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead>Évaluation</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/prestataires/${s.id}`} className="block">
                    <div className="flex items-center gap-2 font-semibold">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {s.raisonSociale}
                    </div>
                    {s.sigle && (
                      <div className="text-xs text-muted-foreground mt-0.5">{s.sigle}</div>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/prestataires/${s.id}`} className="block">
                    {s.ville ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/prestataires/${s.id}`} className="block text-sm">
                    {s.contactNom ?? "—"}
                    {s.contactEmail && (
                      <div className="text-xs text-muted-foreground">{s.contactEmail}</div>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/prestataires/${s.id}`} className="block">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium"
                        >
                          {c}
                        </span>
                      ))}
                      {s.categories.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{s.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  {s.rating ? (
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      {SUPPLIER_RATING_LABELS[s.rating]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <SupplierStatusBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun prestataire trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
