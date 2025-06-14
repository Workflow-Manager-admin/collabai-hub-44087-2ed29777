import React from "react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";

// PUBLIC_INTERFACE
/**
 * Authentication page using Clerk.js UI.
 * Shows sign-in if user is not authenticated, else shows profile message.
 */
function Auth() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <h2 className="title">
        {isSignedIn ? `Welcome, ${user?.firstName || user?.emailAddress}` : "Sign In / Sign Up"}
      </h2>
      <div className="description">
        {!isSignedIn ? (
          <>
            <SignIn routing="hash" path="/auth/sign-in" />
            <div style={{ margin: "20px 0" }} />
            <div style={{ opacity: 0.7, marginBottom: 4 }}>or</div>
            <SignUp routing="hash" path="/auth/sign-up" />
          </>
        ) : (
          <>
            <p>You are authenticated.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;
