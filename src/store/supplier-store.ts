import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Supplier, DEFAULT_SUPPLIER_CATEGORIES } from "@/types/supplier";

interface SupplierStore {
  suppliers: Supplier[];
  categories: string[];
  createSupplier: (input: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Supplier;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addCategory: (name: string) => void;
}

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    raisonSociale: "DOVV SARL BASTOS",
    sigle: "DOVV",
    niu: "M021400012345A",
    rccm: "RC/YAO/2014/B/1234",
    adresse: "Bastos, Avenue Charles de Gaulle",
    ville: "Yaoundé",
    pays: "Cameroun",
    telephone: "+237 6 99 12 34 56",
    email: "contact@dovv.cm",
    contactNom: "Jean-Marc Foe",
    contactFonction: "Directeur Commercial",
    contactTelephone: "+237 6 99 12 34 57",
    contactEmail: "jm.foe@dovv.cm",
    status: "actif",
    rating: "bon",
    categories: ["Restauration & Eau", "Consommables Bureau"],
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "sup-2",
    raisonSociale: "TECH SOLUTIONS CMR",
    sigle: "TSC",
    niu: "M021800023456B",
    adresse: "Akwa, Boulevard de la Liberté",
    ville: "Douala",
    pays: "Cameroun",
    telephone: "+237 6 77 88 99 00",
    email: "info@techsolutions.cm",
    siteWeb: "https://techsolutions.cm",
    contactNom: "Aïcha Bello",
    contactFonction: "Account Manager",
    contactEmail: "a.bello@techsolutions.cm",
    status: "actif",
    rating: "excellent",
    notes: "Très bonne réactivité, garantie étendue 3 ans sur le matériel Dell.",
    categories: ["Informatique & Bureautique"],
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "sup-3",
    raisonSociale: "SAFETY FIRST CMR",
    sigle: "SF",
    adresse: "Zone Industrielle Bonabéri",
    ville: "Douala",
    pays: "Cameroun",
    telephone: "+237 6 55 44 33 22",
    email: "ventes@safetyfirst.cm",
    contactNom: "Patrick Mvondo",
    contactFonction: "Responsable Commercial",
    status: "actif",
    rating: "bon",
    categories: ["EPI & Sécurité"],
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "sup-4",
    raisonSociale: "PRINT EXPRESS",
    sigle: "PE",
    adresse: "Mvog-Mbi",
    ville: "Yaoundé",
    pays: "Cameroun",
    telephone: "+237 6 70 11 22 33",
    email: "contact@printexpress.cm",
    contactNom: "Sylvie Nkomo",
    status: "inactif",
    rating: "moyen",
    notes: "Délais souvent dépassés sur les commandes >100 unités.",
    categories: ["Marketing & Communication"],
    createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
  },
];

export const useSupplierStore = create<SupplierStore>()(
  persist(
    (set, get) => ({
      suppliers: SEED_SUPPLIERS,
      categories: [...DEFAULT_SUPPLIER_CATEGORIES],
      createSupplier: (input) => {
        const now = new Date().toISOString();
        const supplier: Supplier = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set({ suppliers: [supplier, ...get().suppliers] });
        return supplier;
      },
      updateSupplier: (id, patch) =>
        set({
          suppliers: get().suppliers.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
          ),
        }),
      deleteSupplier: (id) => set({ suppliers: get().suppliers.filter((s) => s.id !== id) }),
      addCategory: (name) => {
        const cats = get().categories;
        if (cats.includes(name)) return;
        set({ categories: [...cats, name] });
      },
    }),
    { name: "supplier-store-v1" }
  )
);
