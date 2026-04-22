export type PurchaseOrderStatus =
  | "brouillon"
  | "en_attente_rpaf"
  | "approuve"
  | "envoye"
  | "receptionne"
  | "cloture"
  | "rejete"
  | "annule";

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  brouillon: "Brouillon",
  en_attente_rpaf: "Attente RPAF",
  approuve: "Approuvé",
  envoye: "Envoyé",
  receptionne: "Réceptionné",
  cloture: "Clôturé",
  rejete: "Rejeté",
  annule: "Annulé",
};

export interface PurchaseOrderLine {
  id: string;
  position: number;
  designation: string;
  caracteristiques: string;
  quantite: number;
  unite: string;
  prixUnitaireHt: number;
  tauxTva: number; // 0 si exonéré
  /** Prestataire de cette ligne (multi-fournisseurs autorisé). */
  supplierId: string;
  supplierName: string; // snapshot pour le PDF
}

export interface PurchaseOrderApproval {
  role: "rpaf";
  userName: string;
  action: "approuvee" | "rejetee";
  comment?: string;
  date: string;
  signature?: { type: "drawn" | "typed"; value: string };
}

export interface PurchaseOrder {
  id: string;
  numero: string; // BA-001/15-04-2025
  objet: string;
  description?: string;
  status: PurchaseOrderStatus;
  devise: string;
  lines: PurchaseOrderLine[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  dateLivraisonPrevue?: string;
  dateLivraisonReelle?: string;
  conditionsPaiement?: string;
  createdById: string;
  createdByName: string;
  approvals: PurchaseOrderApproval[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  closedAt?: string;
}

export function computeLineTotals(line: Pick<PurchaseOrderLine, "quantite" | "prixUnitaireHt" | "tauxTva">) {
  const totalHt = (Number(line.quantite) || 0) * (Number(line.prixUnitaireHt) || 0);
  const totalTtc = totalHt * (1 + (Number(line.tauxTva) || 0) / 100);
  return { totalHt, totalTtc };
}

export function computeOrderTotals(lines: PurchaseOrderLine[]) {
  let totalHt = 0;
  let totalTtc = 0;
  for (const l of lines) {
    const t = computeLineTotals(l);
    totalHt += t.totalHt;
    totalTtc += t.totalTtc;
  }
  return { totalHt, totalTva: totalTtc - totalHt, totalTtc };
}

/** Liste distincte de prestataires utilisés sur un BA. */
export function distinctSuppliers(po: PurchaseOrder): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const l of po.lines) map.set(l.supplierId, l.supplierName);
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}
