import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { usePurchaseOrderStore, formatXAF } from "@/store/purchase-order-store";
import {
  PO_STATUS_LABELS,
  PurchaseOrderStatus,
  distinctSuppliers,
} from "@/types/purchase-order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { POStatusBadge } from "@/components/POStatusBadge";

const STATUSES: ("all" | PurchaseOrderStatus)[] = [
  "all",
  "brouillon",
  "en_attente_rpaf",
  "approuve",
  "envoye",
  "receptionne",
  "cloture",
  "rejete",
  "annule",
];

export default function PurchaseOrdersList() {
  const orders = usePurchaseOrderStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PurchaseOrderStatus>("all");

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => (status === "all" ? true : o.status === status))
        .filter((o) => {
          if (!q) return true;
          const needle = q.toLowerCase();
          const supplierNames = o.lines.map((l) => l.supplierName.toLowerCase()).join(" ");
          return (
            o.numero.toLowerCase().includes(needle) ||
            o.objet.toLowerCase().includes(needle) ||
            supplierNames.includes(needle) ||
            o.createdByName.toLowerCase().includes(needle)
          );
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [orders, status, q]
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bons d'Achat</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} bon{filtered.length > 1 ? "s" : ""} d'achat
          </p>
        </div>
        <Button asChild>
          <Link to="/bons-achat/nouveau">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau bon d'achat
          </Link>
        </Button>
      </header>

      <div className="bg-card border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher (numéro, objet, prestataire…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | PurchaseOrderStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "Tous les statuts" : PO_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Prestataire(s)</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Mis à jour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => {
              const sups = distinctSuppliers(o);
              return (
                <TableRow key={o.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-semibold">
                    <Link to={`/bons-achat/${o.id}`} className="block">
                      {o.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/bons-achat/${o.id}`} className="block">
                      {o.objet}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/bons-achat/${o.id}`} className="block text-sm">
                      {sups.length === 1 ? (
                        sups[0].name
                      ) : (
                        <span>
                          {sups[0].name}{" "}
                          <span className="text-muted-foreground">+{sups.length - 1}</span>
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Link to={`/bons-achat/${o.id}`} className="block">
                      {formatXAF(o.totalTtc)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <POStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(o.updatedAt), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun bon d'achat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
