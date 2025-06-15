import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  useUser,
  UserButton,
  SignedIn,
  SignedOut
} from "@clerk/clerk-react";
import "./App.css";

// Navbar component
function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div className="logo">
            <span className="logo-symbol">*</span> CollabAI Hub
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <NavLink to="/" className={({ isActive }) => isActive ? "btn btn-large" : "btn"} end>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => isActive ? "btn btn-large" : "btn"}>
              Projects
            </NavLink>
            <NavLink to="/github-editor" className={({ isActive }) => isActive ? "btn btn-large" : "btn"}>
              GitHub Editor
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => isActive ? "btn btn-large" : "btn"}>
              Upload/Audio
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => isActive ? "btn btn-large" : "btn"}>
              Pricing
            </NavLink>
            <NavLink to="/auth" className={({ isActive }) => isActive ? "btn btn-large" : "btn"}>
              Auth
            </NavLink>

            <SignedIn>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
                <span style={{ color: "var(--base-light)", fontWeight: 500 }}>
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </SignedIn>

            <SignedOut>
              {/* Show login/signup button if needed */}
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

// App component
function App() {
  return (
    <div className="app">
      <Navbar />
      <main style={{ marginTop: 80 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
