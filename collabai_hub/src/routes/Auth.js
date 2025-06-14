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
      <header style={{ marginBottom: 24 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>
          {isSignedIn
            ? <>Welcome, <span style={{ color: "var(--base-light)" }}>
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                </span></>
            : "Auth Portal"}
        </h2>
        <p className="description">
          {isSignedIn ? (
            <>
              This page provides user authentication and access management powered by Clerk. View your profile, sign out, or manage your account.
              <br /><br />
              <strong>User flow:</strong> All features across CollabAI Hub become available once authenticated.
            </>
          ) : (
            <>
              Sign in or sign up to access all features in CollabAI Hub. Secure authentication is handled via Clerk, offering easy onboarding and single sign-on support.<br /><br />
              <strong>User flow:</strong> Enter your credentials (or use SSO), then proceed to the dashboard or your last visited project.
            </>
          )}
        </p>
      </header>
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
