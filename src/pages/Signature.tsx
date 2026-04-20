import { useEffect, useRef, useState } from "react";
import { PenLine, Type, Trash2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { useSignatureStore } from "@/store/signature-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "drawn" | "typed";

export default function Signature() {
  const user = useAuthStore((s) => s.user)!;
  const existing = useSignatureStore((s) => s.getSignature(user.email));
  const setSignature = useSignatureStore((s) => s.setSignature);
  const clearSignature = useSignatureStore((s) => s.clearSignature);

  const [mode, setMode] = useState<Mode>(existing?.type ?? "drawn");
  const [typedName, setTypedName] = useState(
    existing?.type === "typed" ? existing.value : user.name
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Initialize canvas (DPI-aware) and restore existing drawn signature
  useEffect(() => {
    if (mode !== "drawn") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = cssW * ratio;
    canvas.height = cssH * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);

    if (existing?.type === "drawn") {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cssW, cssH);
        setHasDrawing(true);
      };
      img.src = existing.value;
    }
  }, [mode, existing]);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function moveDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  }
  function endDraw() {
    drawingRef.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setHasDrawing(false);
  }

  function handleSave() {
    if (mode === "drawn") {
      if (!hasDrawing) {
        toast.error("Veuillez d'abord dessiner votre signature.");
        return;
      }
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      setSignature(user.email, {
        type: "drawn",
        value: dataUrl,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Signature enregistrée");
    } else {
      const name = typedName.trim();
      if (!name) {
        toast.error("Le nom ne peut pas être vide.");
        return;
      }
      setSignature(user.email, {
        type: "typed",
        value: name,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Signature enregistrée");
    }
  }

  function handleDelete() {
    clearSignature(user.email);
    handleClear();
    toast.success("Signature supprimée");
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Ma signature
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Configurez votre signature personnelle. Elle sera apposée automatiquement
          sur chaque FEB que vous validez.
        </p>
      </header>

      {existing && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success-soft/40 px-4 py-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-foreground">
            Signature configurée — dernière mise à jour le{" "}
            {new Date(existing.updatedAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setMode("drawn")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              mode === "drawn"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PenLine className="w-3.5 h-3.5" />
            Dessiner
          </button>
          <button
            type="button"
            onClick={() => setMode("typed")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              mode === "typed"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Type className="w-3.5 h-3.5" />
            Saisir le nom
          </button>
        </div>

        {mode === "drawn" ? (
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">
              Tracez votre signature dans la zone ci-dessous
            </label>
            <div className="rounded-lg border-2 border-dashed border-border bg-white overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-56 cursor-crosshair touch-none block"
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Effacer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">
              Nom à apposer en signature
            </label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Votre nom complet"
            />
            <div className="rounded-lg border border-border bg-white p-6 text-center">
              <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
              <p
                className="text-2xl text-foreground"
                style={{ fontFamily: "'Brush Script MT', cursive" }}
              >
                {typedName || "—"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-6 pt-5 border-t border-border">
          {existing ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Supprimer
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" />
            Enregistrer la signature
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        💡 Votre signature est stockée localement et chiffrée dans votre navigateur.
        Elle sera intégrée automatiquement au PDF des FEB que vous validez.
      </p>
    </div>
  );
}
