import React from "react";
import { NavLink, Outlet, Routes, Route } from "react-router-dom";
import {
  useUser,
  UserButton,
  SignedIn,
  SignedOut
} from "@clerk/clerk-react";
import Footer from "./routes/Footer";
import PricingDonation from "./routes/PricingDonation";
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

  // Neon Donate style overrides
  const donateStyle = {
    ...navLinkStyle,
    color: "#00f6ff",
    border: "1px solid #00f6ff",
    background: "rgba(0,246,255,0.15)",
    fontWeight: 700,
    boxShadow: "0 0 12px 2px #00f6ffAA, 0 0 2px #fff",
    textShadow: "0 0 8px #00f6ff, 0 0 3px #fff, 0 0 16px #0ff4",
    position: "relative",
    zIndex: 2
  };

  const donateActiveStyle = {
    ...donateStyle,
    color: "#fff",
    border: "2px solid #00f6ff",
    background: "rgba(0,246,255,0.21)",
    boxShadow: "0 0 32px 6px #00f6ffCC, 0 0 8px #fff"
  };

  const donateHoverStyle = {
    ...donateStyle,
    color: "#fff",
    border: "2px solid #fff",
    background: "rgba(0,246,255,0.25)",
    boxShadow: "0 0 48px 10px #00f6ffEE, 0 0 10px #fff"
  };

  const [hovered, setHovered] = React.useState(null);

  // Reference navigation
  const navLinks = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/projects", label: "Projects" },
    { to: "/github-editor", label: "GitHub Editor" },
    { to: "/upload", label: "Upload/Audio" },
    { to: "/pricing", label: "Pricing" },
    { to: "/pricing-donation", label: "Donate", isDonate: true },
    { to: "/auth", label: "Auth" }
  ];

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: "2rem", marginRight: 8 }}>*</span> CollabAI Hub
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {navLinks.map(({ to, label, end, isDonate }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) =>
                isDonate
                  ? (isActive
                      ? donateActiveStyle
                      : hovered === to
                        ? donateHoverStyle
                        : donateStyle)
                  : (isActive
                      ? { ...navLinkStyle, ...activeStyle }
                      : hovered === to
                        ? hoverStyle
                        : navLinkStyle)
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

/*
  App component
  Added direct Route for /pricing-donation for accessibility.
*/
function App() {
  return (
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
          {/* Routes are now handled here for the PricingDonation page */}
          <Routes>
            {/* All nested routes */}
            <Route path="/*" element={<Outlet />} />
            {/* Dedicated donation page route */}
            <Route path="/pricing-donation" element={<PricingDonation />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
