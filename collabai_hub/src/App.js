import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ClerkProvider, useUser, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import "./App.css";

// Replace with your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = "pk_test_Z2xhZC10b3J0b2lzZS0zMy5jbGVyay5hY2NvdW50cy5kZXYk";

// Navbar with user info + auth links
function Navbar() {
  // Use Clerk hook to obtain user status
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div className="logo">
            <span className="logo-symbol">*</span> CollabAI Hub
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "btn btn-large" : "btn"
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive ? "btn btn-large" : "btn"
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? "btn btn-large" : "btn"
              }
            >
              Upload/Audio
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                isActive ? "btn btn-large" : "btn"
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                isActive ? "btn btn-large" : "btn"
              }
            >
              Auth
            </NavLink>
            {/* Show user info when signed in */}
            <SignedIn>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 10,
                }}
              >
                <span style={{ color: "var(--base-light)", fontWeight: 500 }}>
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </SignedIn>
            <SignedOut>
              {/* Optionally, show sign in prompt or nothing */}
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Wrap everything in ClerkProvider
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      navigate={(to) => window.history.pushState(null, "", to)}
    >
      <div className="app">
        <Navbar />
        <main style={{ marginTop: 80 /* Space for fixed navbar */ }}>
          <Outlet />
        </main>
      </div>
    </ClerkProvider>
  );
}

export default App;