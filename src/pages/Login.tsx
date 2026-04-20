import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import logo from "@/assets/upowa-logo.jpg";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (res.ok !== true) {
      setError(res.error);
      return;
    }
    toast.success("Connexion réussie");
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-lg bg-white border border-border p-1 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="upöwa" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg leading-tight">upöwa</p>
            <p className="text-xs text-muted-foreground">FEB Dashboard</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Connexion</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accès réservé aux collaborateurs upöwa.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Adresse e-mail professionnelle
              </label>
              <Input
                type="email"
                placeholder="prenom.nom@upowa.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive-soft/60 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-1.5" />
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success" />
            <p>
              Seules les adresses <span className="font-medium text-foreground">@upowa.org</span>{" "}
              sont autorisées. Les rôles sont attribués automatiquement.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Démo · n'importe quel mot de passe ≥ 4 caractères est accepté
        </p>
      </div>
    </div>
  );
}
