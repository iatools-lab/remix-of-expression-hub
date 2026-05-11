import { useFebStore } from "@/store/feb-store";
import { isValidatorRole } from "@/types/feb";
import DemandeurDashboard from "./DemandeurDashboard";
import ValidateurDashboard from "./ValidateurDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const user = useFebStore((s) => s.getCurrentUser());
  if (user.role === "admin" || user.role === "super_admin") {
    return <AdminDashboard />;
  }
  return isValidatorRole(user.role) ? <ValidateurDashboard /> : <DemandeurDashboard />;
}
