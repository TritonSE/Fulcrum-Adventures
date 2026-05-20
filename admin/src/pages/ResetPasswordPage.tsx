import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { isAdminAuthenticated, resetPasswordAdmin } from "../api/auth";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import WarningIcon from "../../icons/error.svg";

import "./SignInPage.css";
import "./ResetPasswordPage.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatchError, setMismatchError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bothFilled || submitting) {
      return;
    }

    if (password !== confirmPassword) {
      setMismatchError(true);
      return;
    }

    if (!token) {
      setSubmitError("Invalid or expired reset link.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const result = await resetPasswordAdmin(token, password);
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    navigate("/sign-in", { replace: true });
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
          icon={false}
          type="submit"
          fullWidth
          className="sign-in__submit"
          disabled={!bothFilled || submitting}
        >
          {submitting ? "Resetting…" : "Reset Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
