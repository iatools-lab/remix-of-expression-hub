import { useState } from "react";
import { Unlock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReopenFebDialogProps {
  onConfirm: (reason: string) => void;
}

export function ReopenFebDialog({ onConfirm }: ReopenFebDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning hover:text-warning-foreground">
          <Unlock className="w-3.5 h-3.5 mr-1.5" /> Réouvrir pour modification
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réouvrir cette FEB ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action remet la FEB à l'état <strong>brouillon</strong>. Toutes les
            validations précédentes seront effacées et le circuit devra être refait.
            Indiquez impérativement la raison — elle sera consignée dans le journal d'audit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5 my-2">
          <Label htmlFor="reopen-reason">Raison de la modification *</Label>
          <Textarea
            id="reopen-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Erreur sur la quantité ligne #2, ajustement budget..."
            maxLength={500}
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (!reason.trim()) {
                e.preventDefault();
                toast.error("La raison est obligatoire.");
                return;
              }
              onConfirm(reason.trim());
              setReason("");
              setOpen(false);
            }}
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Confirmer la réouverture
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
