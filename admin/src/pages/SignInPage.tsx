import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { isAdminAuthenticated, loginAdmin, setAdminSession, waitForAuth } from "../api/auth";
import WarningIcon from "../../icons/error.svg";

const fulcrumLogoMarkSrc = "/sign-in/fulcrum-logo-mark.svg";
const tseLogoSrc = "/sign-in/tse-logo.png";

import "./SignInPage.css";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void waitForAuth().then(() => {
      if (isAdminAuthenticated()) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const bothFilled = email.trim().length > 0 && password.length > 0;

  const onFieldChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (authError) {
      setAuthError(false);
    }
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bothFilled || submitting) {
      return;
    }
    setSubmitting(true);
    const result = await loginAdmin(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setAuthError(true);
      return;
    }
    setAdminSession(result.token, result.user);
    navigate("/", { replace: true });
  }

  return (
    <div className="sign-in">
      <div className="sign-in__inner">
        <div className="sign-in__brand" aria-label="Fulcrum — do. risk. grow.">
          <img
            src={fulcrumLogoMarkSrc}
            alt=""
            className="sign-in__logo-vector"
            aria-hidden="true"
          />
          <p className="sign-in__tagline">do. risk. grow.</p>
        </div>

        <form className="sign-in__card" onSubmit={onSubmit} noValidate>
          <h1 className="sign-in__title">Sign-In</h1>

          <div className="sign-in__fields">
            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="sign-in-email">
                Email
              </label>
              <TextField
                id="sign-in-email"
                className="sign-in__textfield"
                value={email}
                onChange={onFieldChange(setEmail)}
                placeholder="example@gmail.com"
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="sign-in-password">
                Password
              </label>
              <TextField
                id="sign-in-password"
                className="sign-in__textfield"
                value={password}
                onChange={onFieldChange(setPassword)}
                placeholder="••••••"
                type="password"
                autoComplete="current-password"
                emphasized={authError}
              />
            </div>
          </div>

          {authError ? (
            <div className="sign-in__error-banner" role="alert">
              <img src={WarningIcon} alt="" className="sign-in__error-icon" aria-hidden="true" />
              <p className="sign-in__error-text">Incorrect email or password.</p>
            </div>
          ) : null}

          <Link to="/forgot-password" className="sign-in__link">
            Forgot password?
          </Link>

          <Button
            variant="primary"
            icon={false}
            type="submit"
            fullWidth
            className="sign-in__submit"
            disabled={!bothFilled || submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <p className="sign-in__signup">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="sign-in__signup-link">
              Sign-up
            </Link>
          </p>
        </form>

        <footer className="sign-in__footer">
          <img src={tseLogoSrc} alt="" className="sign-in__footer-mark" aria-hidden="true" />
          <p className="sign-in__footer-text">
            Built for free by{" "}
            <a href="https://tritonse.github.io/" target="_blank" rel="noopener noreferrer">
              Triton Software Engineering
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
