import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

/* --- Simple Neon Accented Card/Section --- */
function NeonCard({ title, icon, children, status, footer, style, disabled = false }) {
  return (
    <div
      className="dashboard-card fade-in"
      style={{
        opacity: disabled ? 0.48 : 1,
        filter: disabled ? "grayscale(73%) blur(1.2px)" : undefined,
        ...style,
        borderLeft: `4px solid var(--accent-neon)`,
        boxShadow: disabled
          ? undefined
          : "0 0 0 1.2px #00FF00AA, 0 2px 24px 0 #00FF0030",
        margin: "20px auto", // ✅ centers horizontally
        maxWidth: 700,       // ✅ prevents full-width on large screens
        padding: "20px 28px",
        borderRadius: 12,    // ✅ restores rounded corners
        background: "#0a0a0a",
        transition: "all 0.3s ease"
      }}
      tabIndex={0}
      aria-disabled={disabled}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
        gap: 13,
        flexWrap: "wrap"
      }}>
        {icon}
        <span style={{
          fontWeight: 600,
          fontSize: 19,
          color: "var(--accent-neon)",
          letterSpacing: ".02em",
          filter: "drop-shadow(0 0 5px #00FF0040)"
        }}>
          {title}
        </span>
        {status && (
          <span style={{
            marginLeft: 10,
            background: "#00FF0015",
            borderRadius: 6,
            color: "#00FF00",
            fontSize: 12.5,
            padding: "2px 8px",
            fontWeight: 600,
            letterSpacing: ".03em"
          }}>
            {status}
          </span>
        )}
      </div>

      <div style={{
        minHeight: 30,
        fontSize: 15.5,
        color: "var(--text-secondary)",
        lineHeight: 1.55
      }}>
        {children}
      </div>

      {footer && (
        <div style={{
          marginTop: 18,
          fontSize: 13.5,
          color: "var(--accent-neon)",
          borderTop: "1px solid var(--border-color)",
          paddingTop: 10,
          opacity: 0.9,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}



/* --- GitHub Section: Connect, Fetch, Display --- */

// Helper: Card UI when not connected
function GitHubConnectCard() {
  return (
    <NeonCard
      title="Connected Repositories"
      icon={<span role="img" aria-label="GitHub" style={{ fontSize: 24 }}>🐙</span>}
      status="Not Connected"
      footer={
        <a
  href="https://github.com/settings/tokens"
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-large"
  style={{
    display: "inline-block",
    marginTop: 8,
    background: "transparent",
    color: "var(--accent-neon)",
    border: "1.5px solid var(--accent-neon)",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: 8,
    boxShadow: "0 0 10px #00FF0050",
    textDecoration: "none",
    fontSize: 15.2,
  }}
>
  Connect GitHub
</a>

      }
    >
      To view your repositories and activity, connect your GitHub account.
      <br />
      <span style={{ fontSize: 13.3, color: "#ccc" }}>
        OAuth linking required for full functionality. <br />This is a safe redirect—your tokens are never stored.
      </span>
    </NeonCard>
  );
}



// Helper: Loading skeleton
function RepoSkeleton() {
  return (
    <div>
      <div style={{
        width: "100%",
        height: 20,
        background: "linear-gradient(90deg,#1A1F22 40%,#00FF0030 65%,#1A1F22 90%)",
        borderRadius: 6,
        marginBottom: 9,
        animation: "fadeIn 1s infinite alternate"
      }} />
      <div style={{
        width: "60%",
        height: 16,
        background: "#151C17",
        borderRadius: 6,
        marginBottom: 12
      }} />
      <div style={{
        width: "50%",
        height: 14,
        background: "#152016",
        borderRadius: 6,
        opacity: 0.4,
      }} />
    </div>
  );
}

// Helper: Repo List UI
function RepoListSection({ repos }) {
  if (!repos || repos.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 10 }}>
        No repositories found. Try public repos or adjust your GitHub scopes.
      </div>
    );
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {repos.slice(0, 5).map((repo) => (
        <li key={repo.id}
          style={{
            marginBottom: 14,
            background: "#0e1617",
            borderRadius: 7,
            padding: "10px 11px 8px 10px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 1.5px 8px 0 #00FF001a",
            transition: "background 0.16s",
          }}>
          <span style={{ color: "#00FF00", fontWeight: 600, marginRight: 8 }}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#00FF00" }}>{repo.name}</a>
          </span>
          {repo.private && (
            <span style={{
              background: "#00FF004b",
              color: "#000",
              padding: "2px 7px",
              borderRadius: 4,
              fontSize: 12,
              marginLeft: 6,
              fontWeight: 500,
              letterSpacing: ".015em"
            }}>Private</span>
          )}
          <div style={{ fontSize: 14.5, color: "var(--text-secondary)", margin: "5px 0 0 2px" }}>
            {repo.description || <span style={{ opacity: 0.43 }}>No description...</span>}
          </div>
          <div style={{ fontSize: 12.3, color: "var(--accent-neon)", marginTop: 3, opacity: 0.69 }}>
            Updated: {new Date(repo.updated_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* 
   PUBLIC_INTERFACE
   The production dashboard for CollabAI Hub, featuring live GitHub integration as per requirements.
*/
function Dashboard() {
  const { user } = useUser();
  // ---- Simulate GitHub Auth "connection" ----
  // In production, this would check the backend / real token. For this demo, we use localStorage.
  const [githubToken, setGitHubToken] = useState(() =>
    localStorage.getItem("GITHUB_TOKEN") || null
  );
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  // Load GitHub repos if token present
  useEffect(() => {
    if (!githubToken) return;
    setRepoLoading(true);
    setRepoError("");
    // GitHub API: fetch user repos
    fetch("https://api.github.com/user/repos?sort=updated", {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Invalid or expired GitHub token.");
        }
        if (!res.ok) throw new Error("GitHub API error");
        return res.json();
      })
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setRepoLoading(false);
      })
      .catch((e) => {
        setRepoError(e.message || "Failed to load repositories");
        setRepoLoading(false);
      });
  }, [githubToken]);

  // Demo Token Connect (replace with OAuth for real production)
  const handleTokenSave = () => {
    localStorage.setItem("GITHUB_TOKEN", manualToken);
    setGitHubToken(manualToken);
    setShowTokenInput(false);
    setManualToken("");
  };

  const handleDisconnect = () => {
    localStorage.removeItem("GITHUB_TOKEN");
    setGitHubToken(null);
    setRepos([]);
    setRepoError("");
    setShowTokenInput(false);
    setManualToken("");
  };

  // Neon-accent iconography loaded inline (SVGs for beautiful bright accents)
  const neonIcons = {
    github: (
      <svg style={{ filter: "drop-shadow(0 0 3.7px #00ff0095)" }} width="22" height="22" fill="#00FF00" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.66 0 8.18c0 3.62 2.29 6.7 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.49-2.01.45-2.53-.86-2.69-1.65-.09-.23-.48-.97-.82-1.17-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.92-3.64-4.08 0-.9.32-1.64.84-2.22-.09-.21-.37-1.03.08-2.14 0 0 .7-.23 2.3.82.67-.19 1.39-.29 2.11-.29s1.44.1 2.11.29c1.6-1.05 2.3-.82 2.3-.82.45 1.11.17 1.93.09 2.14.52.58.83 1.32.83 2.22 0 3.17-1.87 3.87-3.65 4.08.29.25.55.74.55 1.49 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.39C13.71 14.87 16 11.8 16 8.18 16 3.66 12.42 0 8 0z" />
      </svg>
    ),
    audio: <span role="img" aria-label="Audio" style={{ fontSize: 22, filter: "drop-shadow(0 0 5px #00FF0045)" }}>🎙️</span>,
    team: <span role="img" aria-label="Team" style={{ fontSize: 22, filter: "drop-shadow(0 0 5px #00FF0045)" }}>👥</span>,
    credits: <span role="img" aria-label="Credits" style={{ fontSize: 22, filter: "drop-shadow(0 0 5px #00FF0045)" }}>💳</span>,
    projects: <span role="img" aria-label="Projects" style={{ fontSize: 22, filter: "drop-shadow(0 0 5px #00FF0045)" }}>🗂️</span>,
  };

  // Mock data for stubbed sections (to be replaced by integrations later)
  const recentProjects = [
    { name: "AI Demo Sprint", status: "Active", updated: "2024-06-05 11:22" },
    { name: "Transcript Review #42", status: "Complete", updated: "2024-06-01 08:00" },
    { name: "Q2 User Report", status: "Active", updated: "2024-05-15 19:20" }
  ];
  const transcriptionTasks = [
    { file: "meeting_April.wav", status: "Processing", time: "2m ago" },
    { file: "demo_pitch.mp3", status: "Done", time: "Yesterday" }
  ];
  const teamMembers = [
    { name: "Jane Doe", role: "Owner" },
    { name: "John Smith", role: "Collaborator" },
    { name: "Alex Q.", role: "Guest" }
  ];

  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <h2 className="title" style={{ margin: '7px 0 19px 0', color: "var(--accent-neon)", letterSpacing: ".018em", filter: "drop-shadow(0 0 10px #00FF0040)", fontWeight: 700 }}>
        CollabAI Hub Dashboard
      </h2>
      <div className="description" style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
        Welcome<span style={{ color: "#00ff00" }}>{user?.firstName ? `, ${user.firstName}` : ""}</span>! Your central space for project, audio, and team workflow—AI-powered and GitHub-connected.
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        margin: "16px 0 7px 0",
        alignItems: "stretch",
        justifyContent: "stretch"
      }}>
        {/* --- Connected Repositories Card (live) --- */}
        <div style={{ flex: 2, minWidth: 320, maxWidth: 520 }}>
          {!githubToken && !showTokenInput ? (
            <div>
              <GitHubConnectCard />
              <button
                className="btn btn-large"
                style={{ marginLeft: 0, marginTop: 8, background: "#00FF001A", color: "#00FF00", borderColor: "#00FF00" }}
                onClick={() => setShowTokenInput(true)}
              >
                Use Personal Access Token
              </button>
            </div>
          ) : showTokenInput ? (
            <NeonCard
              title="GitHub Personal Access Token"
              icon={neonIcons.github}
            >
              <form onSubmit={(e) => { e.preventDefault(); handleTokenSave(); }}>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter GitHub PAT (repo/read:user)"
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  style={{ width: "94%", marginBottom: 10, color: "#00FF00" }}
                />
                <button
                  className="btn btn-large"
                  style={{
                    background: "var(--accent-neon)",
                    color: "#0a1213",
                    fontWeight: 700,
                    marginRight: 8,
                  }}
                  type="submit"
                >Connect & Fetch</button>
                <button
                  className="btn"
                  style={{ color: "#00FF00", background: "transparent", border: 0 }}
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                >Cancel</button>
                {manualToken.length < 20 && (
                  <div style={{ color: "#aaffb3", marginTop: 5 }}>Enter a valid GitHub Personal Access Token (minimum 20 chars).</div>
                )}
                <div style={{ fontSize: 12.5, opacity: 0.69, marginTop: 2 }}>Instructions: Generate token at <a href="https://github.com/settings/tokens" style={{ color: "#00FF00", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">GitHub Settings</a> (enable <b>repo</b> & <b>read:user</b> scopes, copy and paste here).</div>
              </form>
            </NeonCard>
          ) : (
            <NeonCard
              title="Connected Repositories"
              icon={neonIcons.github}
              status="Live"
              footer={<button className="btn" style={{ color: "#00FF00" }} onClick={handleDisconnect}>Disconnect</button>}
            >
              {repoLoading ? (
                <>
                  <RepoSkeleton />
                  <RepoSkeleton />
                  <div style={{ fontSize: 13.1, color: "#00FF00", marginTop: 6 }}>Fetching your repositories…</div>
                </>
              ) : repoError ? (
                <div style={{ color: "#FF4545" }}>
                  Error: {repoError}
                  <br />
                  <button className="btn" style={{ color: "#00FF00", fontSize: 15 }} onClick={handleDisconnect}>Reset Token</button>
                </div>
              ) : (
                <div style={{ marginTop: 0 }}>
                  <RepoListSection repos={repos} />
                  <div style={{ fontSize: 13.1, marginLeft: 2, marginTop: 4, opacity: 0.72 }}>
                    {repos.length > 0
                      ? <>Showing {Math.min(5, repos.length)} of {repos.length} repositories.</>
                      : <>You have no repositories to display.</>}
                  </div>
                </div>
              )}
            </NeonCard>
          )}
        </div>
        {/* --- Recent Projects --- */}
        <div style={{ flex: 1, minWidth: 260, maxWidth: 380 }}>
          <NeonCard
            title="Recent Projects"
            icon={neonIcons.projects}
            footer={
              <a href="/projects" style={{ color: "#00FF00", textDecoration: "underline" }}>Go to Projects</a>
            }
            disabled={false} // In future: make dynamic
          >
            {recentProjects.map((prj, i) => (
              <div key={i} style={{
                background: "#222928",
                marginBottom: 7,
                borderRadius: 6,
                padding: "7px 10px",
                color: "#b0ffbc",
                fontWeight: 500,
                fontSize: 15.3,
                borderLeft: "3.5px solid #00FF00",
                marginLeft: 1
              }}>
                {prj.name}
                <span style={{
                  float: "right",
                  fontSize: 13,
                  color: "#00FF00",
                  fontWeight: 700,
                  marginLeft: 15
                }}>{prj.status}</span>
                <div style={{
                  fontSize: 12.1,
                  color: "#38ff89c0",
                  marginTop: 1
                }}>{prj.updated}</div>
              </div>
            ))}
            <div style={{ opacity: 0.56, fontSize: 13 }}>Stub: Project features coming soon!</div>
          </NeonCard>
        </div>
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        marginTop: 5,
        alignItems: "stretch"
      }}>
        {/* --- Audio Transcription Tasks --- */}
        <div style={{ flex: 1, minWidth: 290, maxWidth: 420 }}>
          <NeonCard
            title="Audio Transcription Tasks"
            icon={neonIcons.audio}
            status="Stub"
            footer={<a href="/transcription" style={{ color: "#00FF00", textDecoration: "underline" }}>Transcription Center</a>}
            disabled={true}
          >
            {transcriptionTasks.map((tx, i) => (
              <div key={i} style={{
                background: "#141e16",
                marginBottom: 7,
                borderRadius: 6,
                padding: "7px 8px",
                color: "#cfffec",
                fontWeight: 500,
                fontSize: 15.3,
                borderLeft: "3px solid #00FF00"
              }}>
                {tx.file}
                <span style={{
                  float: "right",
                  fontSize: 13,
                  color: "#00FF00",
                  fontWeight: 700,
                  marginLeft: 12
                }}>{tx.status}</span>
                <div style={{
                  fontSize: 12.2,
                  color: "#63ffa9c0"
                }}>{tx.time}</div>
              </div>
            ))}
            <div style={{ fontSize: 13.1, opacity: 0.64 }}>Feature integration coming soon.</div>
          </NeonCard>
        </div>
        {/* --- Team Collaboration --- */}
        <div style={{ flex: 1, minWidth: 290, maxWidth: 370 }}>
          <NeonCard
            title="Team Collaboration"
            icon={neonIcons.team}
            status="Stub"
            footer={<a href="/team" style={{ color: "#00FF00", textDecoration: "underline" }}>Team Workspace</a>}
            disabled={true}
          >
            {teamMembers.map((tm, i) => (
              <div key={i} style={{
                background: "#181c20",
                marginBottom: 7,
                borderRadius: 6,
                padding: "7px 8px",
                color: "#cfffec",
                fontWeight: 500,
                fontSize: 15,
                borderLeft: "3px solid #00FF00"
              }}>
                {tm.name}
                <span style={{
                  float: "right",
                  fontSize: 13,
                  color: "#00FF00",
                  fontWeight: 700,
                  marginLeft: 14
                }}>{tm.role}</span>
              </div>
            ))}
            <div style={{ fontSize: 13.1, opacity: 0.60 }}>Team features coming soon.</div>
          </NeonCard>
        </div>
        {/* --- Credits & Notifications --- */}
        <div style={{ flex: 1, minWidth: 175, maxWidth: 260 }}>
          <NeonCard
            title="Credits & Notifications"
            icon={neonIcons.credits}
            status="Stub"
            footer={<a href="/pricing" style={{ color: "#00FF00", textDecoration: "underline" }}>Manage Credits</a>}
            disabled={true}
          >
            <div style={{
              marginBottom: 8,
              color: "#cfffec",
              fontWeight: 600,
              fontSize: 15.4,
              letterSpacing: ".03em"
            }}>Credits: <span style={{ color: "#00FF00", fontWeight: 700 }}>200</span></div>
            <div style={{
              fontSize: 12.5,
              color: "#63ffa9c0"
            }}>Notification: All systems functional</div>
            <div style={{ fontSize: 13.1, opacity: 0.66, marginTop: 4 }}>Billing & alerts soon available.</div>
          </NeonCard>
        </div>
      </div>
      <div style={{
        textAlign: "right",
        marginTop: 36,
        fontSize: 13.1,
        opacity: 0.44
      }}>
        CollabAI Hub &copy; 2024 — All rights reserved. Neon theme powered by Kavia.
      </div>
    </div>
  );
}

export default Dashboard;
