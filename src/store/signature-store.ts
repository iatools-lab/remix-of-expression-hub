import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SignatureType = "drawn" | "typed";

export interface Signature {
  type: SignatureType;
  /** For "drawn": a PNG data URL. For "typed": the displayed name string. */
  value: string;
  updatedAt: string;
}

interface SignatureStore {
  /** keyed by lowercased email */
  signatures: Record<string, Signature>;
  setSignature: (email: string, sig: Signature) => void;
  getSignature: (email: string) => Signature | undefined;
  clearSignature: (email: string) => void;
}

export const useSignatureStore = create<SignatureStore>()(
  persist(
    (set, get) => ({
      signatures: {},
      setSignature: (email, sig) =>
        set({
          signatures: { ...get().signatures, [email.toLowerCase()]: sig },
        }),
      getSignature: (email) => get().signatures[email.toLowerCase()],
      clearSignature: (email) => {
        const next = { ...get().signatures };
        delete next[email.toLowerCase()];
        set({ signatures: next });
      },
    }),
    { name: "signature-store-v1" }
  )
);
