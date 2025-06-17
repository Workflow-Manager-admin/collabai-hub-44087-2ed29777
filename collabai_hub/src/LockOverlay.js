import React from "react";
import { useUser } from "@clerk/clerk-react";
import "./LockOverlay.css";

/**
 * PUBLIC_INTERFACE
 * LockOverlay displays a full-screen lock animation overlay until Clerk authentication is complete and verification passes.
 * When user is authenticated and verified, the overlay disappears and children/components are shown.
 *
 * Props:
 *   children (ReactNode): Content to render when unlocked.
 */
function LockOverlay({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();

  // Only "verified" users may access the dashboard
  const isVerified =
    !!user &&
    // Typical Clerk verification for email or phone:
    (user.emailAddresses?.some((e) => e.verification?.status === "verified") ||
      user.primaryEmailAddress?.verification?.status === "verified" ||
      user.primaryPhoneNumber?.verification?.status === "verified");

  // Wait for Clerk to determine authentication state
  if (!isLoaded) {
    return (
      <div className="lock-overlay">
        <LockAnimation />
        <div className="lock-overlay-text">Checking authentication...</div>
      </div>
    );
  }

  // Not signed in or not verified: SHOW overlay
  if (!isSignedIn || !isVerified) {
    return (
      <div className="lock-overlay">
        <LockAnimation />
        <div className="lock-overlay-text">
          {isSignedIn
            ? "Please verify your email or phone to unlock the dashboard."
            : "Sign in or register to unlock CollabAI Hub"}
        </div>
      </div>
    );
  }

  // Authenticated and verified: show the dashboard
  return <>{children}</>;
}

// Neon Green Lock Animation as a separate component
function LockAnimation() {
  // SVG lock, animated with CSS
  return (
    <div className="neon-lock-container">
      <svg
        className="neon-lock"
        width="84"
        height="104"
        viewBox="0 0 84 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lock body */}
        <rect
          x="14"
          y="46"
          width="56"
          height="44"
          rx="10"
          className="neon-glow"
          stroke="#00FF41"
          strokeWidth="4"
          fill="#070707"
        />
        {/* Lock shackle */}
        <path
          d="M24 46V34C24 19 60 19 60 34V46"
          className="neon-shackle"
          stroke="#00FF41"
          strokeWidth="4"
          fill="none"
        />
        {/* Circle for the keyhole */}
        <circle
          cx="42"
          cy="70"
          r="6"
          className="neon-keyhole"
          fill="none"
          stroke="#00FF41"
          strokeWidth="3"
        />
        {/* Keyhole line */}
        <rect
          x="40.5"
          y="70"
          width="3"
          height="10"
          rx="1.5"
          fill="#00FF41"
          className="neon-keyhole-blink"
        />
      </svg>
      {/* Animated pulsating glow below the lock */}
      <div className="neon-lock-glow"></div>
    </div>
  );
}

export default LockOverlay;
