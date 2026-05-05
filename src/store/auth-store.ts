import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@/types/feb";

// Hardcoded role mapping for designated signataires.
// All other @upowa.org emails default to "demandeur".
const ROLE_BY_EMAIL: Record<string, Role> = {
  "oudou.nsangou@upowa.org": "responsable_pole",
  "jalil.ketou@upowa.org": "rpaf",
};

const ALLOWED_DOMAIN = "@upowa.org";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export function getRoleForEmail(email: string): Role {
  return ROLE_BY_EMAIL[email.toLowerCase()] ?? "demandeur";
}

export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith(ALLOWED_DOMAIN);
}

interface RegisteredUser {
  email: string;
  name: string;
  password: string;
}

interface AuthStore {
  user: AuthUser | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  register: (email: string, name: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      registeredUsers: [],
      register: (rawEmail, name, password) => {
        const email = rawEmail.toLowerCase().trim();
        if (!email || !name || !password) {
          return { ok: false, error: "Tous les champs sont requis." };
        }
        if (!isAllowedEmail(email)) {
          return { ok: false, error: "Accès réservé aux adresses @upowa.org." };
        }
        if (password.length < 6) {
          return { ok: false, error: "Le mot de passe doit contenir au moins 6 caractères." };
        }
        const existing = get().registeredUsers.find((u) => u.email === email);
        if (existing) {
          return { ok: false, error: "Un compte existe déjà avec cette adresse e-mail." };
        }
        set((s) => ({
          registeredUsers: [...s.registeredUsers, { email, name: name.trim(), password }],
        }));
        return { ok: true };
      },
      login: (rawEmail, password) => {
        const email = rawEmail.toLowerCase().trim();
        if (!email || !password) {
          return { ok: false, error: "Email et mot de passe requis." };
        }
        if (!isAllowedEmail(email)) {
          return { ok: false, error: "Accès réservé aux adresses @upowa.org." };
        }
        const registered = get().registeredUsers.find((u) => u.email === email);
        if (!registered) {
          return { ok: false, error: "Aucun compte trouvé avec cette adresse. Veuillez créer un compte." };
        }
        if (registered.password !== password) {
          return { ok: false, error: "Mot de passe incorrect." };
        }
        const user: AuthUser = {
          email,
          name: registered.name,
          role: getRoleForEmail(email),
        };
        set({ user });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: "auth-store-v2" }
  )
);
