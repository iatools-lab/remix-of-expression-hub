import { useEffect, useRef, useState } from "react";
import { PenLine, Type, Trash2, Save, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { useSignatureStore } from "@/store/signature-store";
import { fileToCompressedDataUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "drawn" | "typed" | "upload";

export default function Signature() {
  const user = useAuthStore((s) => s.user)!;
  const existing = useSignatureStore((s) => s.getSignature(user.email));
  const setSignature = useSignatureStore((s) => s.setSignature);
  const clearSignature = useSignatureStore((s) => s.clearSignature);

  const [mode, setMode] = useState<Mode>(existing?.type ?? "drawn");
  const [typedName, setTypedName] = useState(
    existing?.type === "typed" ? existing.value : user.name
  );
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(
    existing?.type === "drawn" ? existing.value : null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // PNG output preserves transparency for clean signatures
      const dataUrl = await fileToCompressedDataUrl(file, 1000, "image/png", 0.9);
      setUploadedDataUrl(dataUrl);
      toast.success("Image chargée — n'oubliez pas d'enregistrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du chargement de l'image");
    } finally {
      // allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    } else if (mode === "upload") {
      if (!uploadedDataUrl) {
        toast.error("Veuillez d'abord importer une image.");
        return;
      }
      setSignature(user.email, {
        type: "drawn", // stored & rendered the same way as a drawn signature
        value: uploadedDataUrl,
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
    setUploadedDataUrl(null);
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
          {([
            { value: "drawn", label: "Dessiner", icon: PenLine },
            { value: "upload", label: "Importer", icon: Upload },
            { value: "typed", label: "Saisir le nom", icon: Type },
          ] as { value: Mode; label: string; icon: typeof PenLine }[]).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setMode(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  mode === tab.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {mode === "drawn" && (
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
        )}

        {mode === "upload" && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">
              Importez une image de votre signature (PNG ou JPG)
            </label>

            {uploadedDataUrl ? (
              <div className="rounded-lg border border-border bg-white p-4 flex flex-col items-center gap-3">
                <img
                  src={uploadedDataUrl}
                  alt="Aperçu de la signature"
                  className="max-h-40 object-contain"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Remplacer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedDataUrl(null)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-border bg-white hover:bg-muted/30 transition-colors py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm font-medium text-foreground">
                  Cliquez pour choisir une image
                </p>
                <p className="text-xs">PNG ou JPG, fond blanc ou transparent recommandé</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />

            <p className="text-[11px] text-muted-foreground">
              💡 Pour un meilleur rendu, utilisez une image avec fond transparent (PNG)
              ou une signature noire sur fond blanc.
            </p>
          </div>
        )}

        {mode === "typed" && (
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
