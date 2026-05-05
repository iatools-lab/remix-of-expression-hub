import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@/types/feb";

const SUPER_ADMIN_EMAIL = "jalil.ketou@upowa.org";
const SUPER_ADMIN_PASSWORD = "jalil@123";

const ALLOWED_DOMAIN = "@upowa.org";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith(ALLOWED_DOMAIN);
}

interface RegisteredUser {
  email: string;
  name: string;
  password: string;
  role: Role;
}

interface AuthStore {
  user: AuthUser | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  register: (email: string, name: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  updateUserRole: (email: string, role: Role) => void;
  getAllUsers: () => RegisteredUser[];
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
          registeredUsers: [...s.registeredUsers, { email, name: name.trim(), password, role: "demandeur" }],
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

        // Super admin built-in account
        if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
          const user: AuthUser = {
            email,
            name: "Jalil Ketou",
            role: "super_admin",
          };
          set({ user });
          // Ensure super admin is also in registeredUsers for listing
          const exists = get().registeredUsers.find((u) => u.email === email);
          if (!exists) {
            set((s) => ({
              registeredUsers: [...s.registeredUsers, { email, name: "Jalil Ketou", password: SUPER_ADMIN_PASSWORD, role: "super_admin" }],
            }));
          }
          return { ok: true };
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
          role: registered.role,
        };
        set({ user });
        return { ok: true };
      },
      logout: () => set({ user: null }),
      updateUserRole: (email: string, role: Role) => {
        set((s) => ({
          registeredUsers: s.registeredUsers.map((u) =>
            u.email === email ? { ...u, role } : u
          ),
          // Also update current user if they're the one being changed
          user: s.user && s.user.email === email ? { ...s.user, role } : s.user,
        }));
      },
      getAllUsers: () => get().registeredUsers,
    }),
    { name: "auth-store-v3" }
  )
);
