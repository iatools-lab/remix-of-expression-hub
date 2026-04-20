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

interface AuthStore {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (rawEmail, password) => {
        const email = rawEmail.toLowerCase().trim();
        if (!email || !password) {
          return { ok: false, error: "Email et mot de passe requis." };
        }
        if (!isAllowedEmail(email)) {
          return {
            ok: false,
            error: "Accès réservé aux adresses @upowa.org.",
          };
        }
        // Demo: any password ≥ 4 chars is accepted (no real backend yet).
        if (password.length < 4) {
          return { ok: false, error: "Mot de passe trop court (min. 4 caractères)." };
        }
        const user: AuthUser = {
          email,
          name: deriveNameFromEmail(email),
          role: getRoleForEmail(email),
        };
        set({ user });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: "auth-store-v1" }
  )
);
