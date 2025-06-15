import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react"; // ✅ move ClerkProvider here
import App from "./App";
import "./index.css";

// Routes
import LandingPage from "./routes/LandingPage";
import Auth from "./routes/Auth";
import Dashboard from "./routes/Dashboard";
import Projects from "./routes/Projects";
import GitHub from "./routes/GitHub";
import GitHubEditor from "./routes/GitHubEditor";
import NotFound from "./routes/NotFound";
import Transcription from "./routes/Transcription";
import UploadAudio from "./routes/UploadAudio";
import Pricing from "./routes/Pricing";
import ProjectDetails from "./routes/ProjectDetails";
import Team from "./routes/Team";

const AudioPdfTranscription = lazy(() => import("./routes/AudioPdfTranscription"));

const CLERK_PUBLISHABLE_KEY = "pk_test_Z2xhZC10b3J0b2lzZS0zMy5jbGVyay5hY2NvdW50cy5kZXYk";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} routing="path">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:owner/:repo" element={<ProjectDetails />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/github-editor" element={<GitHubEditor />} />
          <Route path="/upload" element={<UploadAudio />} />
          <Route path="/transcribe" element={<Transcription />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/team" element={<Team />} />
          <Route
            path="/upload-transcript"
            element={
              <Suspense fallback={<div style={{
                color: "#e87a41",
                background: "#181818",
                borderRadius: 10,
                padding: 32,
                margin: 32,
                fontWeight: 600,
                fontSize: "1.17em"
              }}>Loading Transcription Page...</div>}
              >
                <AudioPdfTranscription />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ClerkProvider>
);
