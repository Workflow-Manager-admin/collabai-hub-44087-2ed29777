import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import GeminiChatbot from "./GeminiChatbot";

/**
 * PUBLIC_INTERFACE
 * Project Details view: fetches and displays recent commits for a repo,
 * including commit message, author avatar, and date, styled with neon/dark theme.
 * Now includes Gemini AI Chatbot for project Q&A.
 */
function ProjectDetails() {
  const { owner, repo } = useParams();
  const [commits, setCommits] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(true);
  const [commitError, setCommitError] = useState("");
  const [token] = useState(() => localStorage.getItem("GITHUB_TOKEN") || "");

  useEffect(() => {
    if (!owner || !repo) return;
    setLoading(true);
    setCommitError("");
    setReadme("");
    // Fetch repo for details (name, description, stars, etc)
    fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: token ? `token ${token}` : undefined,
        Accept: "application/vnd.github+json",
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Repository not found or access denied.");
        return res.json();
      })
      .then(data => setRepoData(data))
      .catch(() => setRepoData(null));

    // Fetch most recent commits (20)
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`, {
      headers: {
        Authorization: token ? `token ${token}` : undefined,
        Accept: "application/vnd.github+json",
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch commits. Repo/Token may not have access.");
        return res.json();
      })
      .then(data => {
        setCommits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        setCommitError(e.message || "Failed to fetch commits.");
        setLoading(false);
      });

    // Fetch README.md (for repo context, for Gemini)
    fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: token ? `token ${token}` : undefined,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((text) => setReadme(text))
      .catch(() => setReadme(""));

  }, [owner, repo, token]);

  // Prepare recent commits for Gemini chatbot context (message, author, date)
  const recentCommitContext = commits
    .slice(0, 8)
    .map((c) => ({
      message: c.commit?.message?.split("\n")[0] || "",
      author: c.commit?.author?.name || (c.author?.login || "unknown"),
      date: c.commit?.author?.date
        ? new Date(c.commit.author.date).toLocaleString()
        : "",
    }));

  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 420 }}>
      <Link
        to="/projects"
        style={{
          color: "#00FF00",
          textDecoration: "underline",
          opacity: 0.7,
          fontSize: 15.5
        }}
      >
        ← Back to Projects
      </Link>
      {repoData && (
        <header style={{ marginBottom: 18, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={repoData.owner?.avatar_url}
              alt="owner avatar"
              width={48}
              height={48}
              style={{
                borderRadius: "50%",
                border: "3px solid #00FF00",
                boxShadow: "0 0 11px #00FF0095",
                marginRight: 6,
                background: "#1a1e24",
              }}
            />
            <div>
              <div className="title" style={{
                color: "#00FF00",
                fontWeight: 700,
                marginBottom: 2,
                filter: "drop-shadow(0 0 7px #00FF0037)",
                fontSize: "2rem"
              }}>
                {repoData.name}
                <span style={{
                  fontSize: 14,
                  background: "#00FF0050",
                  color: "#181814",
                  marginLeft: 14,
                  borderRadius: 8,
                  padding: "2.5px 11px",
                  fontWeight: 700,
                  verticalAlign: "middle"
                }}>
                  {repoData.private ? "Private" : "Public"}
                </span>
              </div>
              <div className="description" style={{ color: "#b0ffbc", opacity: 0.84, fontSize: 16 }}>
                {repoData.description || <span style={{ opacity: 0.45 }}>No description...</span>}
              </div>
              <div style={{ color: "#ffa", marginTop: 3, fontSize: 14 }}>
                <span style={{ color: "#ffd979", marginRight: 14 }}>
                  ★ {repoData.stargazers_count}
                </span>
                <span style={{ color: "#98fa7d" }}>
                  {repoData.language ? (`{ ${repoData.language} }`) : ""}
                </span>
                <span style={{ color: "#68ffaa", marginLeft: 18, opacity: 0.75 }}>
                  Last Push: {repoData.pushed_at && (new Date(repoData.pushed_at)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}
      <section style={{
        marginTop: 16,
        marginBottom: 24,
        background: "#11161b",
        borderLeft: "4px solid #00FF00",
        borderRadius: 8,
        padding: "22px 14px 13px 18px",
        boxShadow: "0 0 13px #00FF0039",
        position: "relative"
      }}>
        <h3 style={{
          color: "#00FF00",
          fontSize: "1.36rem",
          fontWeight: 700,
          margin: "0 0 13px 0",
          letterSpacing: ".018em",
          textShadow: "0 0 7px #00FF0072",
          lineHeight: 1.2
        }}>
          Recent Commits
        </h3>
        {loading && (
          <div style={{ color: "#b0ffbc", fontSize: 16, padding: "28px 0" }}>Loading...</div>
        )}
        {commitError && (
          <div style={{
            color: "#ff8984",
            background: "#1a120f",
            border: "2px solid #ff4545",
            padding: "17px 18px",
            borderRadius: 7,
            boxShadow: "0 0 7px #ff45456b",
            maxWidth: 480,
            margin: "23px auto"
          }}>
            Error: {commitError}
          </div>
        )}
        {!loading && !commitError && (
          <>
            {commits.length === 0 && (
              <div style={{ color: "#ffa", fontSize: 15, opacity: 0.76 }}>No commits found.</div>
            )}
            <ul style={{
              listStyle: "none",
              margin: 0,
              padding: 0
            }}>
              {commits.map(commit => (
                <li
                  key={commit.sha}
                  style={{
                    background: "#171f23",
                    border: "1.6px solid #00FF002b",
                    borderRadius: 7,
                    marginBottom: 15,
                    padding: "11px 9px 11px 11px",
                    boxShadow: "0 0 8px #00FF0036",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <img
                    src={commit.author?.avatar_url || commit.commit?.author?.avatar_url || "/favicon.ico"}
                    alt={commit.commit?.author?.name}
                    width={37}
                    height={37}
                    style={{
                      borderRadius: "50%",
                      border: "2px solid #00FF00",
                      marginRight: 14,
                      background: "#151a16"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      color: "#00FF00",
                      fontSize: 16.3,
                      textShadow: "0 0 5px #00FF0063"
                    }}>
                      {commit.commit.message.split("\n")[0]}
                    </div>
                    <div style={{
                      fontSize: 14.5,
                      color: "#b0ffbc",
                      opacity: 0.84,
                      marginTop: 3
                    }}>
                      <span>{commit.commit.author.name}</span>
                      {commit.author && commit.author.login &&
                        <span style={{
                          marginLeft: 8,
                          color: "#ccffec",
                          fontSize: 12.7,
                          opacity: 0.75
                        }}>@{commit.author.login}</span>
                      }
                      <span style={{
                        marginLeft: 15,
                        color: "#5dff9a",
                        fontSize: 13.3
                      }}>
                        {new Date(commit.commit.author.date).toLocaleString()}
                      </span>
                    </div>
                    {commit.html_url &&
                      <a href={commit.html_url} target="_blank" rel="noopener noreferrer"
                         style={{
                           marginTop: 6,
                           display: "inline-block",
                           color: "#00FF00",
                           fontSize: 13.7,
                           textDecoration: "underline",
                           opacity: 0.8,
                         }}>
                        View on GitHub →
                      </a>
                    }
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      {/* BEGIN GEMINI CHATBOT INTEGRATION */}
      {repoData && (
        <GeminiChatbot
          repoInfo={{
            name: repoData.name,
            owner: repoData.owner,
            description: repoData.description,
            readme: readme,
            recentCommits: recentCommitContext,
          }}
          style={{ marginBottom: 24 }}
        />
      )}
      {/* END GEMINI CHATBOT INTEGRATION */}
      <div style={{
        marginTop: 26,
        fontSize: 13.2,
        color: "var(--accent-neon)",
        opacity: 0.54,
        textAlign: "right"
      }}>
        Commit data provided by GitHub API. Neon theme by CollabAI Hub.
      </div>
    </div>
  );
}

export default ProjectDetails;
