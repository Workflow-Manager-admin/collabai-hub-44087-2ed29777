import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Dashboard from "./routes/Dashboard";
import Projects from "./routes/Projects";
import UploadAudio from "./routes/UploadAudio";
import Auth from "./routes/Auth";
import Pricing from "./routes/Pricing";
import NotFound from "./routes/NotFound";

const root = ReactDOM.createRoot(document.getElementById("root"));

// PUBLIC_INTERFACE
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="upload" element={<UploadAudio />} />
          <Route path="auth" element={<Auth />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
