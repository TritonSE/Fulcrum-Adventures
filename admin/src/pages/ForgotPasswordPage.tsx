import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { forgotPasswordAdmin, isAdminAuthenticated, waitForAuth } from "../api/auth";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import WarningIcon from "../../icons/error.svg";

import "./AuthConfirmation.css";
import "./ForgotPasswordPage.css";
import "./SignInPage.css";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void waitForAuth().then(() => {
      if (isAdminAuthenticated()) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const emailFilled = email.trim().length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!emailFilled || submitting || sent) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const result = await forgotPasswordAdmin(email);
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    setSent(true);
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="sign-in__card auth-confirmation__card">
          <h1 className="sign-in__title">Forgot Password</h1>
          <p className="auth-confirmation__message">
            Email sent—check your inbox for a link to reset your password!
          </p>
          <Button
            variant="primary"
            icon={false}
            type="button"
            fullWidth
            className="sign-in__submit"
            onClick={() => navigate("/sign-in")}
          >
            Back to Sign-In
          </Button>
        </div>
      ) : (
        <form className="sign-in__card" onSubmit={onSubmit} noValidate>
          <h1 className="sign-in__title">Forgot Password</h1>

          <div className="sign-in__fields">
            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="forgot-email">
                Email
              </label>
              <TextField
                id="forgot-email"
                className="sign-in__textfield"
                value={email}
                onChange={setEmail}
                placeholder="example@gmail.com"
                type="email"
                autoComplete="email"
              />
            </div>
          </div>

          <Link to="/sign-in" className="sign-in__link forgot-password__back-link">
            ← Back to Sign-In
          </Link>

          <Button
            variant="primary"
            icon={false}
            type="submit"
            fullWidth
            className="sign-in__submit"
            disabled={!emailFilled || submitting}
          >
            {submitting ? "Sending…" : "Send Email"}
          </Button>

          {submitError ? (
            <div className="sign-in__error-banner" role="alert">
              <img src={WarningIcon} alt="" className="sign-in__error-icon" aria-hidden="true" />
              <p className="sign-in__error-text">{submitError}</p>
            </div>
          ) : null}
        </form>
      )}
    </AuthShell>
  );
}
