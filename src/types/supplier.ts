export type SupplierStatus = "actif" | "inactif" | "blackliste";
export type SupplierRating = "excellent" | "bon" | "moyen" | "mauvais";

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  actif: "Actif",
  inactif: "Inactif",
  blackliste: "Blacklisté",
};

export const SUPPLIER_RATING_LABELS: Record<SupplierRating, string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  mauvais: "Mauvais",
};

/** Catégories d'achat (libre — préchargées par défaut). */
export const DEFAULT_SUPPLIER_CATEGORIES = [
  "Informatique & Bureautique",
  "Mobilier & Aménagement",
  "EPI & Sécurité",
  "Consommables Bureau",
  "Restauration & Eau",
  "Transport & Logistique",
  "Maintenance & Travaux",
  "Formation & Conseil",
  "Marketing & Communication",
  "Énergie & Solaire",
] as const;

export interface Supplier {
  id: string;
  // Identité
  raisonSociale: string;
  sigle?: string;
  niu?: string;
  rccm?: string;
  adresse?: string;
  ville?: string;
  pays: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  // Contact
  contactNom?: string;
  contactFonction?: string;
  contactTelephone?: string;
  contactEmail?: string;
  // Évaluation
  status: SupplierStatus;
  rating?: SupplierRating;
  notes?: string;
  categories: string[];
  // Audit
  createdAt: string;
  updatedAt: string;
}
