import React from "react";
import { SignIn, SignUp, useUser, SignedIn, SignedOut } from "@clerk/clerk-react";

// PUBLIC_INTERFACE
/**
 * Authentication page using Clerk.js UI.
 * Shows sign-in/sign-up if user is not authenticated, else shows user profile.
 */
function Auth() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <h2 className="title">
        {isSignedIn ? (
          <>
            Welcome, <span style={{ color: "var(--base-light)" }}>
              {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
            </span>
          </>
        ) : "Sign In / Sign Up"}
      </h2>
      <div className="description">
        <SignedOut>
          <div
            style={{
              maxWidth: 350,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <SignIn routing="hash" path="/auth/sign-in" />
            <div style={{ margin: "20px 0" }} />
            <div style={{ opacity: 0.7, marginBottom: 4 }}>or</div>
            <SignUp routing="hash" path="/auth/sign-up" />
          </div>
        </SignedOut>
        <SignedIn>
          <p>
            You are authenticated. You can access all features.
          </p>
        </SignedIn>
      </div>
    </div>
  );
}

export default Auth;
