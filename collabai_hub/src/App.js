import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // Navbar navigation links for all major routes.
  return (
    <div className="app">
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
            <div style={{ display: "flex", gap: "12px" }}>
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
            </div>
          </div>
        </div>
      </nav>

      <main style={{ marginTop: 80 /* Space for fixed navbar */ }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;