import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Feb,
  FebItem,
  FebStatus,
  Role,
  User,
  nextPendingStatus,
} from "@/types/feb";

const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Awa Mbarga", role: "demandeur", department: "Supply Chains and Operations", email: "awa@upowa.com" },
  { id: "u2", name: "Jean Tchoffo", role: "responsable_technique", department: "Infrastructures", email: "jean@upowa.com" },
  { id: "u3", name: "Marie Nguemo", role: "responsable_pole", department: "Supply Chains and Operations", email: "marie@upowa.com" },
  { id: "u4", name: "Paul Kamga", role: "rpaf", department: "Administratif et Financier", email: "paul@upowa.com" },
  { id: "u5", name: "Sandra Eyenga", role: "supply_chain", department: "Supply Chains and Operations", email: "sandra@upowa.com" },
  { id: "u6", name: "Admin upöwa", role: "admin", department: "Direction Générale", email: "admin@upowa.com" },
];

function generateNumero(existing: number, departement: string): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const seq = String(existing + 1).padStart(3, "0");
  // Use first 2 letters of department code
  const dep = departement
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `${seq}/${dd}-${mm}-${yyyy}/${dep}`;
}

interface FebStore {
  users: User[];
  currentUserId: string;
  febs: Feb[];
  setCurrentUser: (id: string) => void;
  getCurrentUser: () => User;
  createFeb: (input: {
    natureBesoin: string;
    departement: Feb["departement"];
    items: FebItem[];
    delaiLivraison: string;
    fournisseurPotentiel: string;
    needsTechnicalReview: boolean;
    submit: boolean;
  }) => Feb;
  updateFeb: (id: string, patch: Partial<Feb>) => void;
  submitFeb: (id: string) => void;
  approveFeb: (id: string, comment?: string) => void;
  rejectFeb: (id: string, comment: string) => void;
  deleteFeb: (id: string) => void;
}

export const useFebStore = create<FebStore>()(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,
      currentUserId: DEFAULT_USERS[0].id,
      febs: seedFebs(DEFAULT_USERS),
      setCurrentUser: (id) => set({ currentUserId: id }),
      getCurrentUser: () => {
        const s = get();
        return s.users.find((u) => u.id === s.currentUserId) ?? s.users[0];
      },
      createFeb: ({ natureBesoin, departement, items, delaiLivraison, fournisseurPotentiel, needsTechnicalReview, submit }) => {
        const user = get().getCurrentUser();
        const totalEstime = items.reduce((acc, it) => acc + (Number(it.prixEstime) || 0), 0);
        const numero = generateNumero(get().febs.length, departement);
        const now = new Date().toISOString();
        const draft: Feb = {
          id: crypto.randomUUID(),
          numero,
          natureBesoin,
          departement,
          demandeurId: user.id,
          demandeurName: user.name,
          items,
          totalEstime,
          delaiLivraison,
          fournisseurPotentiel,
          needsTechnicalReview,
          status: "brouillon",
          validations: [],
          createdAt: now,
          updatedAt: now,
        };
        const finalFeb: Feb = submit
          ? { ...draft, status: nextPendingStatus(draft) }
          : draft;
        set({ febs: [finalFeb, ...get().febs] });
        return finalFeb;
      },
      updateFeb: (id, patch) =>
        set({
          febs: get().febs.map((f) =>
            f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f
          ),
        }),
      submitFeb: (id) =>
        set({
          febs: get().febs.map((f) => {
            if (f.id !== id) return f;
            return { ...f, status: nextPendingStatus(f), updatedAt: new Date().toISOString() };
          }),
        }),
      approveFeb: (id, comment) => {
        const user = get().getCurrentUser();
        set({
          febs: get().febs.map((f) => {
            if (f.id !== id) return f;
            const nextStatus = nextPendingStatus(f);
            return {
              ...f,
              status: nextStatus,
              validations: [
                ...f.validations,
                { role: user.role, userName: user.name, action: "approuvee", comment, date: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            };
          }),
        });
      },
      rejectFeb: (id, comment) => {
        const user = get().getCurrentUser();
        set({
          febs: get().febs.map((f) => {
            if (f.id !== id) return f;
            return {
              ...f,
              status: "rejetee" as FebStatus,
              validations: [
                ...f.validations,
                { role: user.role, userName: user.name, action: "rejetee", comment, date: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            };
          }),
        });
      },
      deleteFeb: (id) => set({ febs: get().febs.filter((f) => f.id !== id) }),
    }),
    { name: "feb-store-v1" }
  )
);

function seedFebs(users: User[]): Feb[] {
  const demandeur = users[0];
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  return [
    {
      id: "feb-seed-1",
      numero: "001/15-04-2025/SC",
      natureBesoin: "REGUL. ACHAT EAU MINÉRALE DU PERSONNEL",
      departement: "Supply Chains and Operations",
      demandeurId: demandeur.id,
      demandeurName: demandeur.name,
      items: [
        { id: "i1", designation: "PALETTE VITAL", quantite: 80, caracteristiques: "1,5 L", prixEstime: 80000 },
        { id: "i2", designation: "PALETTE SUPERMON", quantite: 10, caracteristiques: "1,5 L", prixEstime: 15000 },
        { id: "i3", designation: "PALETTE SUPERMON", quantite: 10, caracteristiques: "0,5 cl", prixEstime: 24000 },
      ],
      totalEstime: 119000,
      delaiLivraison: new Date(now + 7 * day).toISOString(),
      fournisseurPotentiel: "DOVV SARL BASTOS",
      needsTechnicalReview: false,
      status: "en_attente_pole",
      validations: [],
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      id: "feb-seed-2",
      numero: "002/12-04-2025/IN",
      natureBesoin: "Renouvellement matériel informatique",
      departement: "Systèmes d'Information",
      demandeurId: demandeur.id,
      demandeurName: demandeur.name,
      items: [
        { id: "i1", designation: "Ordinateur portable Dell Latitude", quantite: 5, caracteristiques: "i7, 16Go RAM, 512Go SSD", prixEstime: 4500000 },
        { id: "i2", designation: "Écran 27 pouces", quantite: 5, caracteristiques: "Full HD IPS", prixEstime: 750000 },
      ],
      totalEstime: 5250000,
      delaiLivraison: new Date(now + 21 * day).toISOString(),
      fournisseurPotentiel: "TECH SOLUTIONS CMR",
      needsTechnicalReview: true,
      status: "validee",
      validations: [
        { role: "responsable_technique", userName: "Jean Tchoffo", action: "approuvee", comment: "Spécifications conformes", date: new Date(now - 8 * day).toISOString() },
        { role: "responsable_pole", userName: "Marie Nguemo", action: "approuvee", date: new Date(now - 6 * day).toISOString() },
        { role: "rpaf", userName: "Paul Kamga", action: "approuvee", comment: "Budget validé", date: new Date(now - 4 * day).toISOString() },
        { role: "supply_chain", userName: "Sandra Eyenga", action: "approuvee", date: new Date(now - 1 * day).toISOString() },
      ],
      createdAt: new Date(now - 12 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: "feb-seed-3",
      numero: "003/10-04-2025/QH",
      natureBesoin: "Équipements de protection individuelle",
      departement: "QHSE",
      demandeurId: demandeur.id,
      demandeurName: demandeur.name,
      items: [
        { id: "i1", designation: "Casques de sécurité", quantite: 50, caracteristiques: "Norme EN 397", prixEstime: 250000 },
        { id: "i2", designation: "Gants de protection", quantite: 100, caracteristiques: "Cuir renforcé", prixEstime: 180000 },
      ],
      totalEstime: 430000,
      delaiLivraison: new Date(now + 14 * day).toISOString(),
      fournisseurPotentiel: "SAFETY FIRST CMR",
      needsTechnicalReview: false,
      status: "en_attente_rpaf",
      validations: [
        { role: "responsable_pole", userName: "Marie Nguemo", action: "approuvee", date: new Date(now - 3 * day).toISOString() },
      ],
      createdAt: new Date(now - 5 * day).toISOString(),
      updatedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      id: "feb-seed-4",
      numero: "004/05-04-2025/CM",
      natureBesoin: "Goodies événement annuel",
      departement: "Commercial et Marketing",
      demandeurId: demandeur.id,
      demandeurName: demandeur.name,
      items: [
        { id: "i1", designation: "T-shirts personnalisés", quantite: 200, caracteristiques: "Coton 180g, logo brodé", prixEstime: 1200000 },
      ],
      totalEstime: 1200000,
      delaiLivraison: new Date(now + 30 * day).toISOString(),
      fournisseurPotentiel: "PRINT EXPRESS",
      needsTechnicalReview: false,
      status: "rejetee",
      validations: [
        { role: "responsable_pole", userName: "Marie Nguemo", action: "rejetee", comment: "Hors budget Q2 — à reporter", date: new Date(now - 2 * day).toISOString() },
      ],
      createdAt: new Date(now - 10 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      id: "feb-seed-5",
      numero: "005/18-04-2025/RH",
      natureBesoin: "Formation cybersécurité",
      departement: "Ressources Humaines",
      demandeurId: demandeur.id,
      demandeurName: demandeur.name,
      items: [
        { id: "i1", designation: "Session formation 3 jours", quantite: 1, caracteristiques: "20 participants, certifiante", prixEstime: 3500000 },
      ],
      totalEstime: 3500000,
      delaiLivraison: new Date(now + 45 * day).toISOString(),
      fournisseurPotentiel: "CYBER ACADEMY",
      needsTechnicalReview: true,
      status: "en_attente_technique",
      validations: [],
      createdAt: new Date(now - 1 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
  ];
}

export function formatXAF(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}
