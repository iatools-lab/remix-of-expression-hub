import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Historique from "./pages/Historique";
import Validation from "./pages/Validation";
import FebCreate from "./pages/FebCreate";
import FebDetail from "./pages/FebDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Signature from "./pages/Signature";
import SuppliersList from "./pages/SuppliersList";
import SupplierForm from "./pages/SupplierForm";
import SupplierDetail from "./pages/SupplierDetail";
import PurchaseOrdersList from "./pages/PurchaseOrdersList";
import PurchaseOrderCreate from "./pages/PurchaseOrderCreate";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth>
    <AppLayout>{children}</AppLayout>
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/historique" element={<Protected><Historique /></Protected>} />
          <Route path="/validation" element={<Protected><Validation /></Protected>} />
          <Route path="/febs/nouveau" element={<Protected><FebCreate /></Protected>} />
          <Route path="/febs/:id" element={<Protected><FebDetail /></Protected>} />
          <Route path="/signature" element={<Protected><Signature /></Protected>} />
          <Route path="/prestataires" element={<Protected><SuppliersList /></Protected>} />
          <Route path="/prestataires/nouveau" element={<Protected><SupplierForm /></Protected>} />
          <Route path="/prestataires/:id" element={<Protected><SupplierDetail /></Protected>} />
          <Route path="/prestataires/:id/modifier" element={<Protected><SupplierForm /></Protected>} />
          <Route path="/bons-achat" element={<Protected><PurchaseOrdersList /></Protected>} />
          <Route path="/bons-achat/nouveau" element={<Protected><PurchaseOrderCreate /></Protected>} />
          <Route path="/bons-achat/:id" element={<Protected><PurchaseOrderDetail /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
