import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  useUser,
  UserButton,
  SignedIn,
  SignedOut
} from "@clerk/clerk-react";
import Footer from "./routes/Footer";
import LockOverlay from "./LockOverlay";
import "./LockOverlay.css";

// Navbar component
function Navbar() {
  const { user } = useUser();

  const navStyle = {
    padding: "12px 24px",
    background: "#000000",
    borderBottom: "1px solid #0f0",
    boxShadow: "0 2px 10px rgba(0,255,0,0.05)",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const logoStyle = {
    fontSize: "1.4rem",
    color: "#0f0",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center"
  };

  const navLinkStyle = {
    padding: "8px 14px",
    textDecoration: "none",
    color: "#ccc",
    fontWeight: 500,
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
    border: "1px solid transparent"
  };

  const activeStyle = {
    color: "#0f0",
    borderBottom: "2px solid #0f0"
  };

  const hoverStyle = {
    ...navLinkStyle,
    color: "#0f0",
    border: "1px solid #0f0",
    background: "rgba(0,255,0,0.1)"
  };

  const [hovered, setHovered] = React.useState(null);

  const navLinks = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/projects", label: "Projects" },
    { to: "/github-editor", label: "GitHub Editor" },
    { to: "/upload", label: "Upload/Audio" },
    { to: "/pricing", label: "Pricing" },
    { to: "/auth", label: "Auth" }
  ];

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "#0f0",
              fontWeight: "bold"
            }}
            aria-label="Go to Dashboard"
          >
            <span style={{ fontSize: "2rem", marginRight: 8 }}>*</span> CollabAI Hub
          </NavLink>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) =>
                isActive
                  ? { ...navLinkStyle, ...activeStyle }
                  : hovered === to
                  ? hoverStyle
                  : navLinkStyle
              }
              onMouseEnter={() => setHovered(to)}
              onMouseLeave={() => setHovered(null)}
            >
              {label}
            </NavLink>
          ))}

          <SignedIn>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
              <span style={{ color: "#0f0", fontWeight: 600, fontSize: "0.95rem" }}>
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
              </span>
              <UserButton afterSignOutUrl="/auth" />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

/* App component uses LockOverlay to conditionally block UI until Clerk auth & verification */
function App() {
  return (
    <LockOverlay>
      <div
        className="app"
        style={{
          backgroundColor: "#000",
          color: "#e0e0e0",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Navbar />
        <main style={{ flex: 1, marginTop: 80 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </LockOverlay>
  );
}

export default App;
