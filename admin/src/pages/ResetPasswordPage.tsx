import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  isAdminAuthenticated,
  isPasswordResetCompleteFromUrl,
  resetPasswordAdmin,
  verifyPasswordResetOobCode,
  waitForAuth,
} from "../api/auth";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import WarningIcon from "../../icons/error.svg";

import "./AuthConfirmation.css";
import "./ResetPasswordPage.css";
import "./SignInPage.css";

type PagePhase = "loading" | "success" | "form";

function ConfirmationCard({ onBackToSignIn }: { onBackToSignIn: () => void }) {
  return (
    <div className="sign-in__card auth-confirmation__card">
      <h1 className="sign-in__title">Reset Password</h1>
      <p className="auth-confirmation__message">
        Your password has been successfully reset! Please use your new password to sign in.
      </p>
      <Button
        variant="primary"
        showIcon={false}
        type="button"
        fullWidth
        className="sign-in__submit"
        onClick={onBackToSignIn}
      >
        Back to Sign-In
      </Button>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetCode = searchParams.get("oobCode") ?? searchParams.get("token") ?? "";

  const [phase, setPhase] = useState<PagePhase>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatchError, setMismatchError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolvePage() {
      await waitForAuth();

      if (cancelled) {
        return;
      }

      if (isAdminAuthenticated()) {
        navigate("/", { replace: true });
        return;
      }

      if (isPasswordResetCompleteFromUrl(searchParams)) {
        setPhase("success");
        return;
      }

      if (!resetCode) {
        setSubmitError("Invalid or expired reset link.");
        setPhase("form");
        return;
      }

      const verification = await verifyPasswordResetOobCode(resetCode);
      if (cancelled) {
        return;
      }

      if (!verification.ok) {
        setSubmitError(verification.message);
        setPhase("form");
        return;
      }

      setPhase("form");
    }

    void resolvePage();

    return () => {
      cancelled = true;
    };
  }, [navigate, resetCode, searchParams]);

  const bothFilled = password.length > 0 && confirmPassword.length > 0;

  function onPasswordChange(value: string) {
    setPassword(value);
    if (mismatchError) {
      setMismatchError(false);
    }
    if (submitError) {
      setSubmitError(null);
    }
  }

  function onConfirmChange(value: string) {
    setConfirmPassword(value);
    if (mismatchError) {
      setMismatchError(false);
    }
    if (submitError) {
      setSubmitError(null);
    }
  }

  function onBackToSignIn() {
    navigate("/sign-in", { replace: true });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bothFilled || submitting || phase !== "form") {
      return;
    }

    if (password !== confirmPassword) {
      setMismatchError(true);
      return;
    }

    if (!resetCode) {
      setSubmitError("Invalid or expired reset link.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const result = await resetPasswordAdmin(resetCode, password);
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    setPhase("success");
  }

  if (phase === "loading") {
    return (
      <AuthShell>
        <div className="sign-in__card" aria-busy="true" aria-label="Loading reset password" />
      </AuthShell>
    );
  }

  if (phase === "success") {
    return (
      <AuthShell>
        <ConfirmationCard onBackToSignIn={onBackToSignIn} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form className="sign-in__card" onSubmit={onSubmit} noValidate>
        <h1 className="sign-in__title">Reset Password</h1>

        <div className="sign-in__fields">
          <div className="sign-in__field-block">
            <label className="sign-in__label" htmlFor="reset-password">
              New Password
            </label>
            <TextField
              id="reset-password"
              className="sign-in__textfield"
              value={password}
              onChange={onPasswordChange}
              placeholder="••••••"
              type="password"
              autoComplete="new-password"
            />
          </div>

          <div className="reset-password__confirm-block">
            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="reset-confirm-password">
                Confirm New Password
              </label>
              <TextField
                id="reset-confirm-password"
                className="sign-in__textfield"
                value={confirmPassword}
                onChange={onConfirmChange}
                placeholder="••••••"
                type="password"
                autoComplete="new-password"
                emphasized={mismatchError}
              />
            </div>

            {mismatchError ? (
              <div className="sign-in__error-banner" role="alert">
                <img
                  src={WarningIcon}
                  alt=""
                  className="sign-in__error-icon"
                  aria-hidden="true"
                />
                <p className="sign-in__error-text">Passwords must match</p>
              </div>
            ) : null}
          </div>
        </div>

        {submitError ? (
          <div className="sign-in__error-banner" role="alert">
            <img
              src={WarningIcon}
              alt=""
              className="sign-in__error-icon"
              aria-hidden="true"
            />
            <p className="sign-in__error-text">{submitError}</p>
          </div>
        ) : null}

        <Link to="/sign-in" className="sign-in__link reset-password__back-link">
          ← Back to Sign-In
        </Link>

        <Button
          variant="primary"
          showIcon={false}
          type="submit"
          fullWidth
          className="sign-in__submit"
          disabled={!bothFilled || submitting || !resetCode}
        >
          {submitting ? "Resetting…" : "Reset Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
