import React, { useState, useEffect, useMemo } from "react";

// PUBLIC_INTERFACE
/**
 * Projects Page: Fetch and display GitHub repositories the user has access to,
 * styled in a neon/dark responsive grid UI, supporting search/filter,
 * and robustly handling loading, error, and empty states.
 *
 * Prereq: User must have supplied a valid GitHub PAT via Dashboard or below (uses localStorage 'GITHUB_TOKEN').
 */

import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const handleClick = () => {
    // Go to Project Details page: /projects/:owner/:repo
    if (project.owner?.login && project.name) {
      navigate(`/projects/${encodeURIComponent(project.owner.login)}/${encodeURIComponent(project.name)}`);
    }
  };
  return (
    <div
      className="card fade-in"
      tabIndex={0}
      style={{
        background: "var(--card-bg)",
        border: "1.7px solid var(--accent-neon)",
        boxShadow: "0 0 10px #00FF0036",
        borderRadius: 13,
        minWidth: 210,
        maxWidth: 410,
        flex: 1,
        margin: "18px 8px",
        padding: 22,
        transition: "transform .14s, box-shadow .19s",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        wordBreak: "break-word",
      }}
      aria-label={`Project ${project.name}`}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      role="button"
    >
      <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
        <img
          src={project.owner?.avatar_url}
          alt="owner avatar"
          width={36}
          height={36}
          style={{
            borderRadius: "50%",
            border: "2px solid #00FF00",
            boxShadow: "0 0 7px #00FF009f",
            background: "#14181e",
            marginRight: 5,
          }}
        />
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 18.5,
              color: "#00FF00",
              marginBottom: 2,
              letterSpacing: ".01em",
              lineHeight: 1.1,
              textShadow: "0 0 5px #00FF0035",
            }}
          >
            <span
              style={{
                color: "#00FF00",
                textDecoration: "none",
                filter: "drop-shadow(0 0 6px #00FF0031)",
                cursor: "pointer"
              }}
            >
              {project.name}
            </span>
            {project.private && (
              <span
                style={{
                  background: "#00FF004b",
                  color: "#190e10",
                  fontSize: 11.5,
                  marginLeft: 9,
                  padding: "1.5px 7px",
                  borderRadius: 5,
                  fontWeight: 700,
                  letterSpacing: ".016em",
                  verticalAlign: "middle",
                }}
              >
                Private
              </span>
            )}
          </div>
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: 13.1,
              maxWidth: 180,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              letterSpacing: ".004em",
              opacity: 0.74,
            }}
            title={project.owner?.login}
          >
            {project.owner?.login}
          </div>
        </div>
      </div>
      <div style={{
        color: "#ccffec",
        minHeight: 22,
        maxHeight: 41,
        fontSize: 15.8,
        margin: "2px 0 1px 1px",
        overflow: "hidden",
        lineHeight: 1.25,
        textOverflow: "ellipsis",
        opacity: 0.88
      }}>
        {project.description || <span style={{ opacity: 0.33, fontStyle: 'italic' }}>No description…</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13.5, marginTop: 4 }}>
        <span
          style={{
            color: "#00FF00",
            background: "#00FF0019",
            borderRadius: 5,
            padding: "2px 8px",
            fontWeight: 600,
            letterSpacing: ".03em",
            opacity: 0.75,
          }}
        >
          {project.visibility === "private" ? "Private" : "Public"}
        </span>
        {project.language && (
          <span style={{
            color: "#98fa7d",
            opacity: 0.67,
            marginRight: 6,
            fontWeight: 500,
            fontSize: 13
          }}>{project.language}</span>
        )}
        <span style={{ color: "#68ffaa", opacity: 0.79 }}>
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </span>
        <span style={{ color: "#ffd979b4", opacity: 0.62 }}>
          ★ {project.stargazers_count}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading projects"
      style={{
        width: 250,
        height: 108,
        background: "linear-gradient(90deg,#1A1F22 30%,#00FF0030 60%,#1A1F22 95%)",
        borderRadius: 13,
        margin: "18px 7px",
        animation: "fadeIn 1.1s infinite alternate",
        boxShadow: "0 0 9px #00FF0055",
      }}
    />
  );
}

function ErrorMessage({ error, onReset }) {
  return (
    <div
      style={{
        background: "#1a120f",
        color: "#ff8984",
        padding: "24px 20px",
        borderRadius: 9,
        margin: "42px auto",
        maxWidth: 420,
        border: "2px solid #ff4545",
        boxShadow: "0 0 10px #ff45459a",
        textAlign: "center",
      }}
    >
      <strong>Error:</strong> {error}
      <br />
      {onReset && (
        <button
          className="btn"
          style={{
            marginTop: 14,
            background: "transparent",
            color: "#ff7272",
            border: "1.5px solid #ff4545",
            fontWeight: 700,
          }}
          onClick={onReset}
        >
          Reset GitHub Token
        </button>
      )}
    </div>
  );
}

function FilterBar({ value, onChange, total, results }) {
  return (
    <div style={{
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 18,
      flexWrap: "wrap",
    }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search projects by name or description…"
        style={{
          minWidth: 180,
          width: 300,
          background: "#121c19",
          color: "var(--accent-neon)",
          border: "1.6px solid #00FF003B",
          borderRadius: 8,
          padding: "8px 14px",
          fontWeight: 500,
          fontSize: 15.7,
          marginRight: 8
        }}
      />
      <span style={{
        color: "#b0ff93",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: ".04em",
        marginTop: 3
      }}>
        Showing {results} of {total} project{total === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function TokenSetupNotice({ onSet }) {
  const [manualToken, setManualToken] = useState("");
  return (
    <div className="dashboard-card" style={{
      background: "#181a1f",
      border: "2px solid #00FF00",
      margin: "38px auto",
      padding: "30px 23px",
      borderRadius: 14,
      color: "#00FF00",
      fontWeight: 600,
      boxShadow: "0 0 13px #00FF003e",
      maxWidth: 450,
      textAlign: "center"
    }}>
      <div style={{ fontSize: 22, marginBottom: 5 }}>🔐</div>
      <h3 style={{ color: "#00FF00", fontWeight: 700, marginBottom: 5 }}>GitHub Token Required</h3>
      <div style={{ fontSize: 15.5, color: "#cfffec", marginBottom: 5 }}>
        To display your projects, please provide a GitHub Personal Access Token (PAT) with <b>repo</b> and <b>read:user</b> scopes.<br />
        <span style={{ fontSize: 13.5, opacity: 0.73 }}>
          You can reuse a token or generate one in <a href="https://github.com/settings/tokens" style={{ color: "#00FF00", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">GitHub Settings</a>.
        </span>
      </div>
      <form
        style={{ margin: "18px 0 0 0" }}
        onSubmit={e => {
          e.preventDefault();
          if (manualToken.length > 15) {
            localStorage.setItem("GITHUB_TOKEN", manualToken);
            if (typeof onSet === "function") onSet(manualToken);
          }
        }}
      >
        <input
          type="password"
          minLength={15}
          maxLength={128}
          value={manualToken}
          onChange={e => setManualToken(e.target.value)}
          placeholder="Paste your GitHub PAT here…"
          aria-label="GitHub Personal Access Token"
          style={{
            margin: "0 0 8px 0",
            width: 220,
            border: "1.6px solid #00FF00",
            borderRadius: 8,
            background: "#191f17",
            color: "#00FF00",
            fontWeight: 500,
            fontSize: 15
          }}
        />
        <button
          className="btn btn-large"
          style={{ marginLeft: 10, fontWeight: 700, background: "var(--accent-neon)", color: "#191f11" }}
          type="submit"
        >
          Save Token
        </button>
      </form>
      <div style={{ fontSize: 12.5, marginTop: 6, color: "#b0ffbc" }}>
        Your token is stored locally in your browser only.
      </div>
    </div>
  );
}

function Projects() {
  // Main Projects page component
  const [githubToken, setGitHubToken] = useState(() =>
    localStorage.getItem("GITHUB_TOKEN") || ""
  );
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  // Fetch user's repos from GitHub API (100 per page for demo, can paginate for more)
  useEffect(() => {
    if (!githubToken) return;
    setLoading(true);
    setError("");
    fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Invalid or missing GitHub token. Please supply a valid Personal Access Token (repo/read:user scopes)."
          );
        }
        if (!res.ok) throw new Error("GitHub API error: " + res.statusText);
        return res.json();
      })
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load repositories");
        setLoading(false);
      });
  }, [githubToken]);

  // Filter repos by query in name, description, or owner
  const filteredRepos = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        (r.description?.toLowerCase() || "").includes(q) ||
        r.owner?.login?.toLowerCase().includes(q)
    );
  }, [repos, filter]);

  // Token reset
  const handleResetToken = () => {
    setGitHubToken("");
    setRepos([]);
    setError("");
    localStorage.removeItem("GITHUB_TOKEN");
  };

  return (
    <div className="container" style={{ paddingTop: 100, minHeight: "82vh" }}>
      <header style={{ marginBottom: 15 }}>
        <h2
          className="title"
          style={{
            color: "var(--accent-neon)",
            letterSpacing: ".015em",
            marginBottom: 2,
            filter: "drop-shadow(0 0 9px #00FF0044)",
            fontWeight: 700,
          }}
        >
          Projects
        </h2>
        <p className="description" style={{ marginBottom: 0 }}>
          View and manage your repositories from GitHub, filter by keyword, and prepare for advanced project collaboration.<br />
          <span style={{ opacity: 0.62 }}>
            Each card shows project visibility, language, stars, and last update. <b>More features coming soon!</b>
          </span>
        </p>
      </header>
      {!githubToken ? (
        <TokenSetupNotice onSet={setGitHubToken} />
      ) : error ? (
        <ErrorMessage error={error} onReset={handleResetToken} />
      ) : (
        <>
          <FilterBar
            value={filter}
            onChange={setFilter}
            total={repos.length}
            results={filteredRepos.length}
          />
          <div
            className="project-gallery"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 0",
              justifyContent: filteredRepos.length <= 2 ? "flex-start" : "space-between",
              alignItems: "stretch",
              minHeight: loading ? 220 : undefined,
            }}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} />)
              : filteredRepos.length === 0 ? (
                <div style={{ color: "#ffa", margin: "40px 0 16px 4px", fontSize: 15 }}>
                  No projects found. Try adjusting your search or check your GitHub repository list.
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <ProjectCard key={repo.id} project={repo} />
                ))
              )
            }
          </div>
          <div style={{
            marginTop: 30,
            fontSize: 13.2,
            color: "var(--accent-neon)",
            opacity: 0.6,
            textAlign: "right"
          }}>
            Powered by GitHub API — Neon theme by CollabAI Hub. <a href="/dashboard" style={{ color: "#00FF00", textDecoration: "underline" }}>Back to Dashboard</a>
          </div>
        </>
      )}
    </div>
  );
}

export default Projects;
