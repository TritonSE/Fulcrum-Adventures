import { useEffect, useState, type FormEvent } from "react";

import { AdminLayout } from "../components/AdminLayout";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Toast } from "../components/Toast";
import {
  changePassword,
  fetchAllowedAdminEmails,
  updateAllowedAdminEmails,
  updateProfile,
} from "../api/settings";
import { fetchCurrentUser, getStoredUser } from "../api/auth";
import type { User } from "../types/user";

import "./AccountSettingsPage.css";

type ToastState = {
  message: string;
  variant: "success" | "error";
} | null;

function fullNameFromUser(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.trim());
}

export function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [adminsSaving, setAdminsSaving] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    fetchCurrentUser().then((fresh) => {
      if (fresh) {
        setUser(fresh);
        setFullName(fullNameFromUser(fresh));
        setEmail(fresh.email);
      }
    });
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchAllowedAdminEmails().then((result) => {
      if (result.ok) {
        setAllowedEmails(result.data.emails);
      }
    });
  }, [isSuperAdmin]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setToast({ message: "Enter a valid full name.", variant: "error" });
      return;
    }
    setProfileSaving(true);
    const result = await updateProfile({ fullName });
    setProfileSaving(false);
    if (!result.ok) {
      setToast({ message: result.message, variant: "error" });
      return;
    }
    setUser(result.data.user);
    setFullName(fullNameFromUser(result.data.user));
    setEmail(result.data.user.email);
    setToast({ message: "Changes successfully saved!", variant: "success" });
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: "Fill in all password fields.", variant: "error" });
      return;
    }
    setPasswordSaving(true);
    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setPasswordSaving(false);
    if (!result.ok) {
      setToast({ message: result.message, variant: "error" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToast({ message: "Changes successfully saved!", variant: "success" });
  }

  function onAddAdminEmail() {
    const value = newAdminEmail.trim().toLowerCase();
    if (!value || !isValidEmail(value)) {
      setToast({ message: "Enter a valid email to add.", variant: "error" });
      return;
    }
    if (allowedEmails.includes(value)) {
      setNewAdminEmail("");
      return;
    }
    setAllowedEmails([...allowedEmails, value]);
    setNewAdminEmail("");
  }

  function onRemoveAdminEmail(target: string) {
    setAllowedEmails(allowedEmails.filter((item) => item !== target));
  }

  async function onSaveAdmins(e: FormEvent) {
    e.preventDefault();
    setAdminsSaving(true);
    const result = await updateAllowedAdminEmails(allowedEmails);
    setAdminsSaving(false);
    if (!result.ok) {
      setToast({ message: result.message, variant: "error" });
      return;
    }
    setAllowedEmails(result.data.emails);
    setToast({ message: "Changes successfully saved!", variant: "success" });
  }

  return (
    <AdminLayout>
      <main className="account-settings">
        <h1 className="account-settings__title">Account Settings</h1>

        <form className="settings-card" onSubmit={onSaveProfile}>
          <h2 className="settings-card__title">Profile Information</h2>
          <p className="settings-card__subtitle">Update your display name</p>

          <div className="settings-card__field">
            <label className="settings-card__label" htmlFor="settings-full-name">
              Full Name
            </label>
            <TextField
              id="settings-full-name"
              value={fullName}
              onChange={setFullName}
              placeholder="Enter full name"
            />
          </div>

          <div className="settings-card__field">
            <label className="settings-card__label" htmlFor="settings-email">
              Email
            </label>
            <div id="settings-email" className="settings-card__readonly">
              {email || "No email available"}
            </div>
            <p className="settings-card__hint">
              Email changes must be made in Firebase Authentication.
            </p>
          </div>

          <Button type="submit" icon={false} disabled={profileSaving}>
            {profileSaving ? "Saving…" : "Save Changes"}
          </Button>
        </form>

        <form className="settings-card" onSubmit={onChangePassword}>
          <h2 className="settings-card__title">Change Password</h2>
          <p className="settings-card__subtitle">Update your password to keep your account safe</p>

          <div className="settings-card__field">
            <label className="settings-card__label" htmlFor="settings-current-password">
              Current Password
            </label>
            <TextField
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder=""
              autoComplete="current-password"
            />
          </div>

          <div className="settings-card__field">
            <label className="settings-card__label" htmlFor="settings-new-password">
              New Password
            </label>
            <TextField
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder=""
              autoComplete="new-password"
            />
          </div>

          <div className="settings-card__field">
            <label className="settings-card__label" htmlFor="settings-confirm-password">
              Confirm New Password
            </label>
            <TextField
              id="settings-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder=""
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" icon={false} disabled={passwordSaving}>
            {passwordSaving ? "Saving…" : "Change Password"}
          </Button>
        </form>

        {isSuperAdmin && (
          <form className="settings-card" onSubmit={onSaveAdmins}>
            <h2 className="settings-card__title">Manage Admins</h2>
            <p className="settings-card__subtitle">Add or remove admins</p>

            <ul className="admin-email-list">
              {allowedEmails.map((adminEmail) => (
                <li key={adminEmail} className="admin-email-list__row">
                  <span className="admin-email-list__email">{adminEmail}</span>
                  <button
                    type="button"
                    className="admin-email-list__icon-btn admin-email-list__icon-btn--remove"
                    onClick={() => onRemoveAdminEmail(adminEmail)}
                    aria-label={`Remove ${adminEmail}`}
                  >
                    −
                  </button>
                </li>
              ))}
              <li className="admin-email-list__row admin-email-list__row--add">
                <TextField
                  value={newAdminEmail}
                  onChange={setNewAdminEmail}
                  placeholder=""
                  type="email"
                />
                <button
                  type="button"
                  className="admin-email-list__icon-btn admin-email-list__icon-btn--add"
                  onClick={onAddAdminEmail}
                  aria-label="Add admin email"
                >
                  +
                </button>
              </li>
            </ul>

            <Button type="submit" icon={false} disabled={adminsSaving}>
              {adminsSaving ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          actionText={toast.variant === "success" ? "Undo" : undefined}
          onAction={() => setToast(null)}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
