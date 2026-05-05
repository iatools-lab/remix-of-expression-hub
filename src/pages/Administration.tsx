import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Role, ROLE_LABELS } from "@/types/feb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import { toast } from "sonner";

const ASSIGNABLE_ROLES: Role[] = [
  "demandeur",
  "responsable_technique",
  "responsable_pole",
  "rpaf",
  "supply_chain",
  "admin",
];

export default function Administration() {
  const currentUser = useAuthStore((s) => s.user);
  const registeredUsers = useAuthStore((s) => s.registeredUsers);
  const updateUserRole = useAuthStore((s) => s.updateUserRole);

  if (!currentUser || currentUser.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Accès réservé au super administrateur.</p>
      </div>
    );
  }

  function handleRoleChange(email: string, newRole: Role) {
    updateUserRole(email, newRole);
    toast.success(`Rôle mis à jour avec succès.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Gestion des utilisateurs et des rôles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilisateurs enregistrés ({registeredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registeredUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun utilisateur enregistré.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle actuel</TableHead>
                  <TableHead>Modifier le rôle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registeredUsers.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "super_admin" ? (
                        <span className="text-xs text-muted-foreground italic">Non modifiable</span>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.email, v as Role)}
                        >
                          <SelectTrigger className="w-[260px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNABLE_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
