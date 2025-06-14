import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import "./index.css";
import App from "./App";
import Dashboard from "./routes/Dashboard";
import Projects from "./routes/Projects";
import UploadAudio from "./routes/UploadAudio";
import Auth from "./routes/Auth";
import Pricing from "./routes/Pricing";
import NotFound from "./routes/NotFound";
import GitHub from "./routes/GitHub";
import Transcription from "./routes/Transcription";
import Team from "./routes/Team";

// Utility wrapper for Clerk route protection
function RequireAuth({ children }) {
  // PUBLIC_INTERFACE
  /** Render children only when signed in, else redirect. */
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

// PUBLIC_INTERFACE
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route
            index
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="projects"
            element={
              <RequireAuth>
                <Projects />
              </RequireAuth>
            }
          />
          <Route
            path="upload"
            element={
              <RequireAuth>
                <UploadAudio />
              </RequireAuth>
            }
          />
          <Route path="auth" element={<Auth />} />
          <Route path="pricing" element={<Pricing />} />
          <Route
            path="github"
            element={
              <RequireAuth>
                <GitHub />
              </RequireAuth>
            }
          />
          <Route
            path="transcription"
            element={
              <RequireAuth>
                <Transcription />
              </RequireAuth>
            }
          />
          <Route
            path="team"
            element={
              <RequireAuth>
                <Team />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
