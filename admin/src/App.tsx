import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { isAdminAuthenticated, waitForAuth } from "./api/auth";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import { ActivityEditorPage } from "./pages/ActivityEditorPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import Dashboard from "./pages/Dashboard";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import MailingList from "./pages/MailingList";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignInPage } from "./pages/SignInPage";

import "./App.css";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    void waitForAuth().then(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return null;
  }

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
            <Navigate to="/dashboard" replace />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/mailing-list"
        element={
          <RequireAuth>
            <MailingList />
          </RequireAuth>
        }
      />
      <Route
        path="/activities/new"
        element={
          <RequireAuth>
            <ActivityEditorPage mode="create" />
          </RequireAuth>
        }
      />
      <Route
        path="/activities/:activityId/edit"
        element={
          <RequireAuth>
            <ActivityEditorPage mode="edit" />
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
