import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { useWallet } from "./hooks/useWallet";
import { ROLES } from "./blockchain/contractConfig";
import { getRoleDashboardPath } from "./utils/roleUtils";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { EntrepreneurDashboard } from "./pages/EntrepreneurDashboard";
import { MunicipalityDashboard } from "./pages/MunicipalityDashboard";
import { CivilProtectionDashboard } from "./pages/CivilProtectionDashboard";
import { TaxOfficeDashboard } from "./pages/TaxOfficeDashboard";
import { RNEDashboard } from "./pages/RNEDashboard";
import { CNSSDashboard } from "./pages/CNSSDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ApplicationDetailsPage } from "./pages/ApplicationDetailsPage";

/**
 * Composant de protection de route selon l'état de connexion et le rôle
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isConnected, role, isInitializing } = useWallet();

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--bg-app)",
        }}
      >
        <LoadingSpinner size="lg" text="Initialisation de l'environnement blockchain..." />
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur n'a aucun rôle (Role.None) et que la page n'est pas unauthorized
  if (role === ROLES.NONE && !allowedRoles.includes(ROLES.NONE)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si des rôles spécifiques sont requis et que l'utilisateur n'en fait pas partie
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirection vers son propre dashboard légitime
    const target = getRoleDashboardPath(role);
    return <Navigate to={target} replace />;
  }

  return children;
}

/**
 * Route Racine : redirige vers le dashboard approprié ou vers le login
 */
function RootRedirect() {
  const { isConnected, role, isInitializing } = useWallet();

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--bg-app)",
        }}
      >
        <LoadingSpinner size="lg" text="Connexion à Ganache..." />
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDashboardPath(role)} replace />;
}

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          {/* Route d'authentification */}
          <Route path="/login" element={<LoginPage />} />

          {/* Racine */}
          <Route path="/" element={<RootRedirect />} />

          {/* Routes avec Layout applicatif */}
          <Route element={<AppLayout />}>
            <Route
              path="/unauthorized"
              element={
                <ProtectedRoute allowedRoles={[ROLES.NONE]}>
                  <UnauthorizedPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/entrepreneur"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ENTREPRENEUR]}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/municipality"
              element={
                <ProtectedRoute allowedRoles={[ROLES.MUNICIPALITY]}>
                  <MunicipalityDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/civil-protection"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CIVIL_PROTECTION]}>
                  <CivilProtectionDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tax-office"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TAX_OFFICE]}>
                  <TaxOfficeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rne"
              element={
                <ProtectedRoute allowedRoles={[ROLES.RNE]}>
                  <RNEDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cnss"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CNSS]}>
                  <CNSSDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications/:id"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ENTREPRENEUR, ROLES.ADMIN]}>
                  <ApplicationDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}
