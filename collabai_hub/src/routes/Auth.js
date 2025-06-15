import React from "react";
import {
  SignIn,
  useUser,
  SignedIn,
  SignedOut
} from "@clerk/clerk-react";

// Inject Hacker Font
const hackerFont = document.createElement("link");
hackerFont.href =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";
hackerFont.rel = "stylesheet";
document.head.appendChild(hackerFont);

function Auth() {
  const { isSignedIn, user } = useUser();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>
          {isSignedIn ? (
            <>
              ACCESS GRANTED:{" "}
              <span style={styles.userName}>
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
              </span>
            </>
          ) : (
            "COLLABAI HUB // AUTH PORTAL"
          )}
        </h2>
        <p style={styles.description}>
          {isSignedIn ? (
            <>
              Authentication successful. You are cleared to access all modules.
              <br /><br />
              <strong>User flow:</strong> Return to dashboard or continue to last visited project.
            </>
          ) : (
            <>
              Please authenticate to access secured modules.
              <br /><br />
              <strong>User flow:</strong> Sign in or register → system verification → dashboard access.
            </>
          )}
        </p>
      </header>

      <div style={styles.authWrapper}>
        <SignedOut>
          <SignIn
            appearance={{
              elements: {
                rootBox: {
                  width: '100%',
                  maxWidth: '400px',
                  fontFamily: "'Share Tech Mono', monospace"
                },
                card: {
                  background: "#111",
                  border: "1px solid #00ff88",
                  borderRadius: "12px",
                  boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)",
                  color: "#00ff00"
                },
                headerTitle: {
                  color: "#00ff88"
                },
                headerSubtitle: {
                  color: "#00ff44"
                },
                formFieldLabel: {
                  color: "#00ff88"
                },
                formFieldInput: {
                  backgroundColor: "#000",
                  borderColor: "#00ff88",
                  color: "#00ff00"
                },
                footerActionText: {
                  color: "#00ff44"
                },
                socialButtonsBlockButton: {
                  backgroundColor: "#000",
                  borderColor: "#00ff88",
                  color: "#00ff00"
                },
                dividerLine: {
                  backgroundColor: "#00ff88"
                }
              }
            }}
          />
        </SignedOut>

        <SignedIn>
          <div style={styles.successBox}>
            <p style={styles.successText}>✔ AUTHENTICATED</p>
            <div style={styles.userDetails}>
              <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress}</p>
              {user?.firstName && (
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              )}
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#00ff00",
    fontFamily: "'Share Tech Mono', monospace",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    maxWidth: "700px"
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "12px",
    color: "#00ff00"
  },
  userName: {
    color: "#00ff88"
  },
  description: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#00ff66"
  },
  authWrapper: {
    display: "flex",
    justifyContent: "center",
    width: "100%"
  },
  successBox: {
    border: "1px solid #00ff00",
    background: "rgba(0, 255, 0, 0.03)",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 0 16px rgba(0,255,0,0.2)",
    maxWidth: "420px"
  },
  successText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#00ff00"
  },
  userDetails: {
    fontSize: "1rem",
    lineHeight: "1.5",
    background: "#000",
    border: "1px dashed #00ff00",
    borderRadius: "8px",
    padding: "16px"
  }
};

export default Auth;
