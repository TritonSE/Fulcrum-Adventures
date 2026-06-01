import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { isAdminAuthenticated } from "./api/auth";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import { AdminHome } from "./pages/AdminHome";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignInPage } from "./pages/SignInPage";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<CreateAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminHome />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <AccountSettingsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
