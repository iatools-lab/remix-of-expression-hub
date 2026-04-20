export type Department =
  | "Direction Générale"
  | "QHSE"
  | "Ressources Humaines"
  | "Contrôle de Gestion"
  | "Administratif et Financier"
  | "Recherche et Développement"
  | "Infrastructures"
  | "Systèmes d'Information"
  | "Supply Chains and Operations"
  | "Commercial et Marketing";

export const DEPARTMENTS: Department[] = [
  "Direction Générale",
  "QHSE",
  "Ressources Humaines",
  "Contrôle de Gestion",
  "Administratif et Financier",
  "Recherche et Développement",
  "Infrastructures",
  "Systèmes d'Information",
  "Supply Chains and Operations",
  "Commercial et Marketing",
];

export type Role =
  | "demandeur"
  | "responsable_technique"
  | "responsable_pole"
  | "rpaf"
  | "supply_chain"
  | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  demandeur: "Demandeur",
  responsable_technique: "Responsable pôle technique",
  responsable_pole: "Responsable du pôle",
  rpaf: "Responsable Pôle Administratif & Financier",
  supply_chain: "Réception Supply Chain",
  admin: "Administrateur",
};

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
  email: string;
}

export interface FebItem {
  id: string;
  designation: string;
  quantite: number;
  caracteristiques: string;
  prixEstime: number; // unit or total estimated — we store estimated total per line
  /** Optional product photo (PNG/JPG data URL). */
  photo?: string;
}

export type FebStatus =
  | "brouillon"
  | "en_attente_technique"
  | "en_attente_pole"
  | "en_attente_rpaf"
  | "en_attente_reception"
  | "validee"
  | "rejetee";

export const STATUS_LABELS: Record<FebStatus, string> = {
  brouillon: "Brouillon",
  en_attente_technique: "Attente Resp. Technique",
  en_attente_pole: "Attente Resp. Pôle",
  en_attente_rpaf: "Attente RPAF",
  en_attente_reception: "Attente Réception",
  validee: "Validée",
  rejetee: "Rejetée",
};

export interface ValidationStep {
  role: Role;
  userName: string;
  action: "approuvee" | "rejetee";
  comment?: string;
  date: string; // ISO
  /** Snapshot of the signatory's signature at the time of validation. */
  signature?: {
    type: "drawn" | "typed";
    /** PNG data URL (drawn) or displayed name (typed). */
    value: string;
  };
}

export interface Feb {
  id: string;
  numero: string; // 000/JJ-MM-AAAA/DD
  natureBesoin: string;
  departement: Department;
  demandeurId: string;
  demandeurName: string;
  items: FebItem[];
  totalEstime: number;
  delaiLivraison: string; // ISO date
  fournisseurPotentiel: string;
  needsTechnicalReview: boolean;
  status: FebStatus;
  validations: ValidationStep[];
  createdAt: string;
  updatedAt: string;
}

// Workflow next-status mapping
export function nextPendingStatus(feb: Feb): FebStatus {
  if (feb.status === "brouillon") {
    return feb.needsTechnicalReview ? "en_attente_technique" : "en_attente_pole";
  }
  if (feb.status === "en_attente_technique") return "en_attente_pole";
  if (feb.status === "en_attente_pole") return "en_attente_rpaf";
  if (feb.status === "en_attente_rpaf") return "en_attente_reception";
  if (feb.status === "en_attente_reception") return "validee";
  return feb.status;
}

export function roleForStatus(status: FebStatus): Role | null {
  switch (status) {
    case "en_attente_technique":
      return "responsable_technique";
    case "en_attente_pole":
      return "responsable_pole";
    case "en_attente_rpaf":
      return "rpaf";
    case "en_attente_reception":
      return "supply_chain";
    default:
      return null;
  }
}

export function canActOn(feb: Feb, role: Role): boolean {
  if (role === "admin") return false;
  return roleForStatus(feb.status) === role;
}

// Roles that participate in the validation circuit (can both create AND validate)
export const VALIDATOR_ROLES: Role[] = [
  "responsable_technique",
  "responsable_pole",
  "rpaf",
  "supply_chain",
];

export function isValidatorRole(role: Role): boolean {
  return VALIDATOR_ROLES.includes(role) || role === "admin";
}

// Days a FEB has been pending (since createdAt) — only meaningful for in-flight FEBs
export function pendingDays(feb: Feb): number {
  const start = new Date(feb.createdAt).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

// A FEB is "late" if it's still in the validation circuit and older than the threshold
export const LATE_THRESHOLD_DAYS = 5;
export function isLate(feb: Feb): boolean {
  if (!feb.status.startsWith("en_attente")) return false;
  return pendingDays(feb) >= LATE_THRESHOLD_DAYS;
}

// Average validation duration in days for fully-validated FEBs
export function averageValidationDays(febs: Feb[]): number {
  const validated = febs.filter((f) => f.status === "validee" && f.validations.length > 0);
  if (validated.length === 0) return 0;
  const totalDays = validated.reduce((sum, f) => {
    const start = new Date(f.createdAt).getTime();
    const end = new Date(f.validations[f.validations.length - 1].date).getTime();
    return sum + (end - start) / (1000 * 60 * 60 * 24);
  }, 0);
  return Math.round((totalDays / validated.length) * 10) / 10;
}
