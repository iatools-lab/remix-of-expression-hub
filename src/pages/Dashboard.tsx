import { useFebStore } from "@/store/feb-store";
import { isValidatorRole } from "@/types/feb";
import DemandeurDashboard from "./DemandeurDashboard";
import ValidateurDashboard from "./ValidateurDashboard";

export default function Dashboard() {
  const user = useFebStore((s) => s.getCurrentUser());
  return isValidatorRole(user.role) ? <ValidateurDashboard /> : <DemandeurDashboard />;
}
