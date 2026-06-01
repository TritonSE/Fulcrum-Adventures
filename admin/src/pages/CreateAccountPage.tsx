import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import {
  isAdminAuthenticated,
  registerAdmin,
  setAdminSession,
  waitForAuth,
} from "../api/auth";
import WarningIcon from "../../icons/error.svg";

import "./SignInPage.css";
import "./CreateAccountPage.css";

const fulcrumLogoMarkSrc = "/sign-in/fulcrum-logo-mark.svg";
const tseLogoSrc = "/sign-in/tse-logo.png";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void waitForAuth().then(() => {
      if (isAdminAuthenticated()) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const allFilled =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0;

  function onPasswordChange(value: string) {
    setPassword(value);
    if (passwordError) {
      setPasswordError(false);
    }
    if (submitError) {
      setSubmitError(null);
    }
  }

  function onFieldChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      if (submitError) {
        setSubmitError(null);
      }
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!allFilled || submitting) {
      return;
    }

    if (password.length <= 6) {
      setPasswordError(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const result = await registerAdmin({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.field === "password") {
        setPasswordError(true);
      } else {
        setSubmitError(result.message);
      }
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

        <form
          className="sign-in__card create-account__card"
          onSubmit={onSubmit}
          noValidate
        >
          <h1 className="sign-in__title">Create Account</h1>

          <div className="sign-in__fields">
            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="create-first-name">
                First Name
              </label>
              <TextField
                id="create-first-name"
                className="sign-in__textfield"
                value={firstName}
                onChange={onFieldChange(setFirstName)}
                placeholder="Jane"
                autoComplete="given-name"
              />
            </div>

            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="create-last-name">
                Last Name
              </label>
              <TextField
                id="create-last-name"
                className="sign-in__textfield"
                value={lastName}
                onChange={onFieldChange(setLastName)}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>

            <div className="sign-in__field-block">
              <label className="sign-in__label" htmlFor="create-email">
                Email
              </label>
              <TextField
                id="create-email"
                className="sign-in__textfield"
                value={email}
                onChange={onFieldChange(setEmail)}
                placeholder="janedoe@gmail.com"
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="create-account__password-block">
              <div className="sign-in__field-block">
                <label className="sign-in__label" htmlFor="create-password">
                  Password
                </label>
                <TextField
                  id="create-password"
                  className="sign-in__textfield"
                  value={password}
                  onChange={onPasswordChange}
                  placeholder="••••••"
                  type="password"
                  autoComplete="new-password"
                  emphasized={passwordError}
                />
              </div>

              {passwordError ? (
                <div className="sign-in__error-banner" role="alert">
                  <img
                    src={WarningIcon}
                    alt=""
                    className="sign-in__error-icon"
                    aria-hidden="true"
                  />
                  <p className="sign-in__error-text">
                    Password must be more than 6 characters.
                  </p>
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

          <Button
            variant="primary"
            icon={false}
            type="submit"
            fullWidth
            className="sign-in__submit"
            disabled={!allFilled || submitting}
          >
            {submitting ? "Creating account…" : "Create Account"}
          </Button>

          <p className="sign-in__signup">
            Already have an account?{" "}
            <Link to="/sign-in" className="create-account__sign-in-link">
              Sign-in
            </Link>
          </p>
        </form>

        <footer className="sign-in__footer">
          <img
            src={tseLogoSrc}
            alt=""
            className="sign-in__footer-mark"
            aria-hidden="true"
          />
          <p className="sign-in__footer-text">
            Built for free by{" "}
            <a
              href="https://tritonse.github.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Triton Software Engineering
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
