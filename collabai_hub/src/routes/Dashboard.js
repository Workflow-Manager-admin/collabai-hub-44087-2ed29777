import React from "react";

/**
 * PUBLIC_INTERFACE
 * Dashboard Overview Stub
 * - Quick links and status for all main features
 */
function Dashboard() {
  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <h2 className="title">Dashboard</h2>
      <div className="description">Welcome to the CollabAI Hub Dashboard.</div>
      <div style={{ marginTop: 32 }}>
        <section style={{ marginBottom: 16 }}>
          <strong>GitHub Integration:</strong> <span style={{ opacity: 0.7 }}>Connect repositories and manage code</span>
        </section>
        <section style={{ marginBottom: 16 }}>
          <strong>Audio Transcription/Summarization:</strong> <span style={{ opacity: 0.7 }}>Upload audio, generate transcripts, AI summaries</span>
        </section>
        <section style={{ marginBottom: 16 }}>
          <strong>Team Collaboration:</strong> <span style={{ opacity: 0.7 }}>Create/join projects, invite team</span>
        </section>
        <section style={{ marginBottom: 16 }}>
          <strong>Credits & Pricing:</strong> <span style={{ opacity: 0.7 }}>Track usage, manage payments/credits</span>
        </section>
      </div>
      <div style={{ marginTop: 32, fontSize: 14, opacity: 0.5 }}>
        All features are in stub mode — Start collaborating!
      </div>
    </div>
  );
}

export default Dashboard;
