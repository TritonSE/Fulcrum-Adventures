import type { ReactNode } from "react";

const fulcrumLogoMarkSrc = "/sign-in/fulcrum-logo-mark.svg";
const tseLogoSrc = "/sign-in/tse-logo.png";

import "../pages/SignInPage.css";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
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

        {children}

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
