import React, { useEffect, useState, useRef } from "react";
import "./GitHubEditor.modern.css";

// Import Orbitron from Google Fonts for neon/modern effect (inject once if not present)
if (typeof window !== 'undefined' && !document.getElementById('orbitron-font')) {
  const fontLink = document.createElement('link');
  fontLink.id = 'orbitron-font';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Montserrat:wght@400;700&family=Fira+Mono:wght@500;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}

/*
  PUBLIC_INTERFACE
  GitHub Repository File Editor/Browser (Enhanced Functionality)
  - Fast file fetching and file tree navigation.
  - View, edit, add, delete files, and save changes via push to GitHub.
  - Refactored for modern creative neon UI: vibrant neon-glow accents, bouncing/fading animations, subtle glassmorphism,
    cool fonts, and stylish transitions. All GitHub operations fully preserved.
*/

const MONACO_CDN = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs";

function loadMonacoEditor(callback) {
  if (window.monaco) return callback();
  if (window.__monacoLoading) return;
  window.__monacoLoading = true;

  const onLoad = () => {
    window.__monacoLoading = false;
    if (window.require && window.monaco) callback();
  };

  // Inject loader script only if not present
  if (!document.getElementById("monaco-editor-loader")) {
    const script = document.createElement("script");
    script.id = "monaco-editor-loader";
    script.src = `${MONACO_CDN}/loader.min.js`;
    script.onload = () => {
      window.require.config({ paths: { vs: `${MONACO_CDN}` } });
      window.require(["vs/editor/editor.main"], () => {
        onLoad();
      });
    };
    document.body.appendChild(script);
  }
}

function NeonToast({ message, type, onClose }) {
  // Minimal toast for error/success.
  const bg =
    type === "error"
      ? "#2a1a18"
      : type === "success"
      ? "#142819"
      : "#11161e";
  const border =
    type === "error"
      ? "#ff5555"
      : type === "success"
      ? "#00FF00"
      : "#00FF00bb";
  const color =
    type === "error"
      ? "#FF6666"
      : type === "success"
      ? "#00FF00"
      : "#b0ffbc";
  return (
    <div
      style={{
        background: bg,
        color,
        border: `2px solid ${border}`,
        boxShadow: `0 0 17px ${border}55`,
        position: "fixed",
        top: 22,
        right: 32,
        minWidth: 220,
        padding: "18px 32px 15px 20px",
        zIndex: 2002,
        borderRadius: 11,
        fontWeight: 600,
        fontSize: 15.7,
        borderTopLeftRadius: 3,
        filter:
          type === "error"
            ? "drop-shadow(0 0 12px #ff55557a)"
            : "drop-shadow(0 0 15px #00ff009c)",
        transition: "opacity .16s",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      role="alert"
      aria-live="assertive"
    >
      {type === "success" ? (
        <span style={{ fontSize: 21 }}>✅</span>
      ) : (
        <span style={{ fontSize: 21, color: "#FF6666" }}>⚡</span>
      )}
      <span>{message}</span>
      <button
        style={{
          background: "transparent",
          color,
          fontSize: 18,
          marginLeft: 18,
          border: 0,
          cursor: "pointer",
        }}
        aria-label="Close notification"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

// Lightweight Monaco wrapper (CDN, dark theme, disposable)
// Loads Monaco asynchronously.
function MonacoCodeEditor({ value, language, onChange, readOnly, style, fontSize, height, lineNumbers, options }) {
  const containerRef = useRef();
  const editorRef = useRef();
  const optionsMemo = options || {};
  useEffect(() => {
    let mounted = true;
    loadMonacoEditor(() => {
      if (!mounted) return;
      const monaco = window.monaco;
      if (!containerRef.current) return;
      if (editorRef.current) editorRef.current.dispose();

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: value || "",
        language: language || "plaintext",
        theme: "vs-dark",
        automaticLayout: true,
        readOnly: !!readOnly,
        fontSize: fontSize || 15,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontFamily: "'Jetbrains Mono', 'Fira Mono', 'Menlo', monospace",
        wordWrap: "on",
        lineNumbers: lineNumbers ? "on" : "off",
        ...optionsMemo,
      });

      editorRef.current.onDidChangeModelContent(() => {
        if (typeof onChange === "function") {
          onChange(editorRef.current.getValue());
        }
      });
    });
    return () => {
      mounted = false;
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch {}
        editorRef.current = null;
      }
    };
  }, [containerRef, language, readOnly, fontSize, optionsMemo]);
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const currVal = editorRef.current.getValue();
      if (currVal !== value) {
        const model = editorRef.current.getModel();
        if (model) {
          window.monaco.editor.setModelLanguage(model, language || "plaintext");
          editorRef.current.setValue(value || "");
        }
      }
      editorRef.current.updateOptions({
        readOnly: !!readOnly,
        fontSize: fontSize || 15,
      });
    }
  }, [value, language, readOnly, fontSize]);
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: height || 330,
        border: "1.2px solid var(--accent-neon)",
        borderRadius: 8,
        overflow: "hidden",
        ...style,
      }}
    />
  );
}

// Given filename, guesses a language for Monaco
function guessMonacoLang(filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  if (["js", "jsx"].includes(ext)) return "javascript";
  if (["ts", "tsx"].includes(ext)) return "typescript";
  if (["py"].includes(ext)) return "python";
  if (["json"].includes(ext)) return "json";
  if (["css", "scss", "less"].includes(ext)) return "css";
  if (["md"].includes(ext)) return "markdown";
  if (["html", "htm"].includes(ext)) return "html";
  if (["sh", "zsh", "bash"].includes(ext)) return "shell";
  if (["yml", "yaml"].includes(ext)) return "yaml";
  return "plaintext";
}

// Flattens a GitHub repo tree into a file structure
function flattenGitHubTree(tree) {
  const structure = {};
  tree.forEach((item) => {
    const parts = item.path.split("/");
    let curr = structure;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        curr[part] = item;
      } else {
        if (!curr[part]) curr[part] = {};
        curr = curr[part];
      }
    }
  });
  return structure;
}

/* -- FileTreeView with modern neon/creative style -- */
function FileTreeView({ tree, path, onFileClick, selectedFile }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: "0 0 0 17px" }}>
      {Object.entries(tree).map(([key, item]) => {
        const fullPath = path ? `${path}/${key}` : key;
        if (item.type === "tree" || typeof item.sha === "undefined") {
          // Folder
          return (
            <li key={fullPath}>
              <span
                className="ge-filetree-folder ge-blink-text"
                style={{
                  fontSize: 16.5,
                  display: "inline-block",
                  animation: "floatY 2.2s infinite",
                  cursor: "pointer"
                }}
                tabIndex={0}
                aria-label={`Folder ${key}`}
              >
                <span role="img" aria-label="folder" style={{filter:"drop-shadow(0 0 9px #00ff62)"}}>
                  📁
                </span>{" "}
                {key}
              </span>
              <FileTreeView
                tree={item}
                path={fullPath}
                onFileClick={onFileClick}
                selectedFile={selectedFile}
              />
            </li>
          );
        } else {
          // File
          return (
            <li key={fullPath}>
              <button
                className={`ge-filetree-file${fullPath === selectedFile ? " selected" : ""} ge-flash-glow`}
                style={{
                  fontFamily: "'Fira Mono', 'Jetbrains Mono', monospace",
                  fontWeight: fullPath === selectedFile ? 700 : 500
                }}
                onClick={() => onFileClick(fullPath)}
                aria-label={`Open ${fullPath}`}
              >
                <span role="img" aria-label="file" style={{marginRight:6,verticalAlign:'-1.5px',fontSize:16}}>
                  📄
                </span>
                {key}
              </button>
            </li>
          );
        }
      })}
    </ul>
  );
}

function useDebouncedValue(val, delay) {
  // Debounces any value (for commit message, etc).
  const [debounced, setDebounced] = useState(val);
  useEffect(() => {
    const tid = setTimeout(() => setDebounced(val), delay);
    return () => clearTimeout(tid);
  }, [val, delay]);
  return debounced;
}

function GitHubEditor() {
  // --- Auth/Config ---
  const [githubToken, setGitHubToken] = useState(() =>
    localStorage.getItem("GITHUB_TOKEN") || ""
  );
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoErr, setRepoErr] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoData, setRepoData] = useState(null);

  // --- File Tree ---
  const [tree, setTree] = useState(null);
  const [treeSha, setTreeSha] = useState("");
  const [treeErr, setTreeErr] = useState("");
  const [refreshingTree, setRefreshingTree] = useState(false);

  // --- File Editor/Navigation ---
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileSha, setFileSha] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);

  // --- New File ---
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);

  // --- Commit/Push ---
  const [commitMessage, setCommitMessage] = useState("");
  const [pushing, setPushing] = useState(false);

  // --- Success/Error Notification ---
  const [toast, setToast] = useState(null);

  // --- EFFECTS ---

  // Load user's repos on mount/token change
  useEffect(() => {
    if (!githubToken) return;
    setLoadingRepos(true);
    setRepoErr("");
    fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch repositories.");
        return res.json();
      })
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setLoadingRepos(false);
      })
      .catch((e) => {
        setRepoErr(e.message || "Failed to fetch repositories.");
        setLoadingRepos(false);
      });
  }, [githubToken]);

  // Repo selection: load tree
  useEffect(() => {
    if (!selectedRepo || !githubToken) {
      setTree(null);
      setTreeSha("");
      setSelectedFile("");
      setFileContent("");
      setFileSha("");
      return;
    }
    // Fetch main branch SHA and tree
    setRefreshingTree(true);
    setTree(null);
    setTreeSha("");
    setTreeErr("");
    setSelectedFile("");
    setFileContent("");
    setFileSha("");
    const [owner, repo] = selectedRepo.split("/");
    fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json"
        }
      }
    )
      .then(res => {
        if (!res.ok) throw new Error("Repo not found.");
        return res.json();
      })
      .then(data => {
        setRepoData(data);
        return data.default_branch;
      })
      .then((branch) => {
        return fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github+json"
            }
          }
        );
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load repo tree.");
        return res.json();
      })
      .then(data => {
        setTree(flattenGitHubTree(data.tree || []));
        setTreeSha(data.sha);
        setRefreshingTree(false);
      })
      .catch(e => {
        setTreeErr(e.message || "Failed to load file tree.");
        setRefreshingTree(false);
      });
  }, [selectedRepo, githubToken]);

  // File selection: fetch and load file content
  useEffect(() => {
    if (!selectedRepo || !selectedFile) {
      setFileContent("");
      setFileSha("");
      return;
    }
    const [owner, repo] = selectedRepo.split("/");
    setLoadingFile(true);
    setFileContent("");
    setFileSha("");
    fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
        selectedFile
      )}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3.raw"
        }
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.message || "Failed to fetch file.");
        }
        // Try to decode raw content
        return res.text();
      })
      .then((data) => {
        setFileContent(data);
        setEditorDirty(false);
        // Get the SHA for commits
        fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(selectedFile)}`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github+json"
            }
          }
        ).then(r => r.json()).then(meta => {
          setFileSha(meta.sha || "");
        });
        setLoadingFile(false);
      })
      .catch((e) => {
        setFileContent("");
        setFileSha("");
        setToast({
          message:
            e.message ||
            "Failed to fetch file contents. Please check your access/token.",
          type: "error"
        });
        setLoadingFile(false);
      });
    // eslint-disable-next-line
  }, [selectedFile, selectedRepo, githubToken]);

  // Handlers
  const handleRepoChange = (e) => {
    setSelectedRepo(e.target.value);
    setTree(null);
    setTreeSha("");
    setSelectedFile("");
    setFileContent("");
    setFileSha("");
    setShowNewFile(false);
  };
  const handleFileClick = (path) => {
    setSelectedFile(path);
    setShowNewFile(false);
    setNewFilePath("");
    setNewFileContent("");
  };
  const handleEditorChange = (val) => {
    setFileContent(val);
    setEditorDirty(true);
  };
  const handleSaveFile = async () => {
    if (!commitMessage.trim()) {
      setToast({ message: "Commit message is required.", type: "error" });
      return;
    }
    setPushing(true);
    const [owner, repo] = selectedRepo.split("/");
    try {
      // PATCH file using GitHub contents API
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
          selectedFile
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(fileContent))),
            branch: repoData.default_branch,
            sha: fileSha
          })
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to commit.");
      setToast({ message: "File saved and committed!", type: "success" });
      setEditorDirty(false);
      setCommitMessage("");
      // Refresh tree in case file path/sha has changed
      setRefreshingTree(true);
      const treeResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json"
          }
        }
      );
      const treeData = await treeResp.json();
      setTree(flattenGitHubTree(treeData.tree || []));
      setTreeSha(treeData.sha);
      setRefreshingTree(false);
    } catch (e) {
      setToast({ message: e.message || "Failed to commit.", type: "error" });
    }
    setPushing(false);
  };
  const handleAddFileClick = () => {
    setShowNewFile(true);
    setSelectedFile("");
    setNewFilePath("");
    setNewFileContent("");
  };
  const handleCreateFile = async () => {
    if (!newFilePath.trim() || !commitMessage.trim()) {
      setToast({ message: "All fields required.", type: "error" });
      return;
    }
    setCreatingFile(true);
    const [owner, repo] = selectedRepo.split("/");
    try {
      // Create new file using GitHub contents API
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
          newFilePath
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(newFileContent))),
            branch: repoData.default_branch
          })
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create file.");
      setToast({ message: "File created and committed!", type: "success" });
      setShowNewFile(false);
      setCommitMessage("");
      setNewFileContent("");
      setNewFilePath("");
      setSelectedFile(json.content.path);
      // Refresh tree to include new file
      setRefreshingTree(true);
      const treeResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json"
          }
        }
      );
      const treeData = await treeResp.json();
      setTree(flattenGitHubTree(treeData.tree || []));
      setTreeSha(treeData.sha);
      setRefreshingTree(false);
    } catch (e) {
      setToast({ message: e.message || "Failed to create file.", type: "error" });
    }
    setCreatingFile(false);
  };
  // Utility for toast close
  const closeToast = () => setToast(null);

  // -- Neon/minimal style for main panel --
  return (
    <div className="container fade-in github-editor-modern-dashboard" style={{paddingTop: 100, minHeight: 610}}>
      <h2 className="github-editor-title ge-flash-glow">
        <span role="img" aria-label="neon-light" style={{marginRight: 7,fontSize:30,verticalAlign:'-6px', color:"#39ff14"}}>⚡</span>
        GitHub Editor Dashboard
      </h2>
      <div className="github-editor-pane ge-section-fade" style={{marginTop: 14, marginBottom: 10}}>
        {/* -- Sidebar: Repo picker & file tree -- */}
        <aside className="ge-sidebar ge-scrollbar" style={{padding: 15}}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="repo-select" className="github-editor-label">
              <span className="ge-anim-glow-row" style={{fontWeight:800}}>Repository</span>
            </label>
            <select
              id="repo-select"
              value={selectedRepo}
              onChange={handleRepoChange}
              className="github-editor-input ge-flash-glow"
              style={{width:"100%",marginBottom:4,fontWeight:600}}
              disabled={!githubToken || loadingRepos}
              aria-label="Choose GitHub repository"
            >
              <option value="">Select repository…</option>
              {repos.map((r) => (
                <option key={r.full_name} value={r.full_name}
                  style={{ color:"#20ff93", background:"#191e19", fontWeight:700}}
                >
                  {r.full_name}
                </option>
              ))}
            </select>
            <button
              className="github-editor-action-btn"
              style={{marginTop:10,padding:"4px 13px",fontSize:13}}
              onClick={() => {
                localStorage.removeItem("GITHUB_TOKEN");
                window.location.reload();
              }}
              tabIndex={0}
              type="button"
            >
              Reset GitHub Token
            </button>
          </div>
          <div style={{ marginBottom: 15 }}>
            <span className="github-editor-label ge-flash-glow" style={{marginRight:7}}>Files</span>
            <button
              className="github-editor-action-btn"
              style={{
                marginLeft: 7, fontSize: 13,padding:"3.5px 14px"
              }}
              aria-label="New file"
              onClick={handleAddFileClick}
              disabled={!selectedRepo || refreshingTree}
              type="button"
            >
              + Add File
            </button>
            <button
              className="github-editor-action-btn"
              style={{
                marginLeft: 7, background:"#1a251a", color:"#39ff14",fontWeight:700,padding:"3px 13px"
              }}
              aria-label="Refresh file tree"
              onClick={() => setSelectedRepo(selectedRepo)}
              disabled={refreshingTree || !selectedRepo}
              type="button"
            >
              ↻
            </button>
          </div>
          {treeErr && (
            <div
              className="github-editor-file-status"
              style={{
                color: "#FF6666",
                background: "#1a120f",
                border: "1.7px solid #ff4545",
                padding: "9px 8px",
                borderRadius: 7,
                marginBottom: 7,
                fontSize: 13.1
              }}
            >
              {treeErr}
            </div>
          )}
          {refreshingTree ? (
            <div className="ge-blink-text" style={{ color: "#00FF00", marginLeft: 2, marginTop: 16 }}>
              Loading tree…
            </div>
          ) : tree ? (
            <div className="ge-tree-scroll ge-scrollbar" style={{marginBottom:8}}>
              {/* --- Neon creative file tree view with effects --- */}
              <FileTreeView
                tree={tree}
                path=""
                onFileClick={handleFileClick}
                selectedFile={selectedFile}
              />
            </div>
          ) : selectedRepo ? (
            <div style={{ color: "#b0ffbc", marginTop: 12, fontWeight:500, fontSize:14,opacity:0.88 }}>No files found.</div>
          ) : (
            <div style={{ color: "#b0ffbc", opacity: 0.7, fontWeight:500,fontSize:14 }}>Select a repo to view its files.</div>
          )}
        </aside>
        {/* -- Editor/Main view -- */}
        <section className="github-editor-main ge-section-fade">
          {!githubToken ? (
            <div className="ge-flash-glow" style={{
              color: "#39ff14", textShadow: "0 0 18px #39ff14c3,0 0 8px #fff4",
              padding: 35, fontWeight: 800, fontSize: 18, borderRadius: 13,
              background: "rgba(34,42,34,0.13)", borderLeft:"3.7px solid #39ff14"
            }}>
              Please supply a GitHub Personal Access Token on the <b>Dashboard</b> or <b>Projects</b> page to use this editor.
            </div>
          ) : loadingRepos ? (
            <div className="ge-anim-glow-row" style={{ color: "#b0ffbc", fontSize: 16, opacity: 0.7 }}>
              Loading repositories…
            </div>
          ) : !selectedRepo ? (
            <div className="ge-anim-glow-row" style={{
              color: "#b0ffbc",opacity:0.83,
              fontSize: "clamp(1.04rem,2vw,1.25rem)",marginTop: 30, textShadow:"0 0 10px #0fc8"
            }}>
              Pick a repository to browse and edit files.
            </div>
          ) : showNewFile ? (
            <div className="github-editor-newfile-bar ge-flash-glow" style={{
              background: "linear-gradient(118deg,#13271aec 26%, #101922b2 100%)",
              borderLeft: "3.7px solid #39ff14", borderRadius: 14,
              boxShadow: "0 0 15px #39ff1466, 0 0 8px #fff6", maxWidth: 620,
              margin: "23px auto", padding: "29px 19px"
            }}>
              <h3 className="github-editor-title" style={{ fontSize:"1.51rem",marginBottom:13, color:"#39ff14",textShadow:"0 0 13px #39ff1477"}}>
                <span role="img" aria-label="new" style={{marginRight:5}}>📝</span> New File
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateFile();
                }}>
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text"
                    value={newFilePath}
                    onChange={(e) => setNewFilePath(e.target.value)}
                    placeholder="Filename, e.g. src/App.js"
                    className="github-editor-filename-input"
                    style={{ width:"97%" }}
                    disabled={creatingFile}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <MonacoCodeEditor
                    value={newFileContent}
                    language={guessMonacoLang(newFilePath)}
                    onChange={setNewFileContent}
                    height={220}
                    className="github-editor-monaco-blink"
                  />
                </div>
                <div style={{ marginBottom: 11 }}>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    className="github-editor-input"
                    style={{ width: "97%" }}
                    disabled={creatingFile}
                  />
                </div>
                <button
                  className="github-editor-action-btn"
                  type="submit"
                  disabled={creatingFile}
                  style={{marginRight:9}}
                >
                  {creatingFile ? "Creating file…" : "Create & Commit"}
                </button>
                <button
                  className="github-editor-action-btn"
                  style={{
                    color: "#39ff14",
                    background: "transparent",
                    border: "2px solid #39ff14",
                    marginLeft: 8}}
                  type="button"
                  onClick={() => setShowNewFile(false)}
                  disabled={creatingFile}
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : selectedFile ? (
            <div>
              <div className="ge-anim-glow-row" style={{
                display: "flex",
                alignItems: "center", gap: 15, marginBottom: 7
              }}>
                <span
                  style={{
                    color: "#39ff14",
                    fontWeight: 900,
                    fontFamily: "'Orbitron','Montserrat',monospace",
                    fontSize: "1.17rem",
                    textShadow: "0 0 11px #39ff147c",
                    letterSpacing: ".013em"
                  }}
                >
                  <span role="img" aria-label="file" style={{marginRight:7,fontSize:20,verticalAlign:"-3px"}}>📄</span>
                  {selectedFile}
                </span>
                <span className="github-editor-file-status" style={{
                  background: editorDirty ? "#aaffb326":"#39ff1424",
                  color: "#39ff14",
                  border: "1.3px solid #39ff14a9",
                }}>
                  {editorDirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              {loadingFile ? (
                <div className="ge-blink-text" style={{ color: "#b0ffbc", fontWeight:600 }}>
                  Loading file…
                </div>
              ) : (
                <div className="github-editor-monaco-blink">
                  <MonacoCodeEditor
                    value={fileContent}
                    language={guessMonacoLang(selectedFile)}
                    onChange={handleEditorChange}
                    height={320}
                    fontSize={17}
                  />
                </div>
              )}
              <form
                className="github-editor-commit-bar"
                style={{ marginTop: 16 }}
                onSubmit={e => {
                  e.preventDefault();
                  handleSaveFile();
                }}
              >
                <input
                  type="text"
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Commit message"
                  className="github-editor-input"
                  style={{ flex: 1 }}
                  disabled={pushing}
                />
                <button
                  className="github-editor-action-btn"
                  type="submit"
                  disabled={pushing || !editorDirty || !commitMessage}
                >
                  {pushing ? "Saving…" : "Save & Commit"}
                </button>
                <button
                  className="github-editor-action-btn"
                  style={{
                    color: "#39ff14",
                    background: "transparent",
                    border: "2px solid #39ff14",
                    marginLeft: 8
                  }}
                  type="button"
                  onClick={() => {
                    setSelectedFile("");
                    setFileContent("");
                    setEditorDirty(false);
                  }}
                  disabled={pushing}
                >
                  Close
                </button>
              </form>
            </div>
          ) : (
            <div className="ge-anim-glow-row"
              style={{
                color: "#b0ffbc", opacity: 0.81, fontSize: 16.5,marginTop: 27, textShadow:"0 0 11px #00ffe9"
              }}
            >
              Select a file to view or edit it, or <span style={{color:"#39ff14",fontWeight:800}}>+ Add File</span>.
            </div>
          )}
        </section>
      </div>
      <div
        style={{
          marginTop: 24,
          color: "#39ff14",
          textAlign: "right",
          fontSize: 13.2,
          opacity: 0.64,
          fontFamily: "'Orbitron', 'Montserrat', monospace",
          letterSpacing: ".017em"
        }}
      >
        All file actions use the official&nbsp;GitHub API. <span style={{color:"#02fcce",fontWeight:650}}>Neon theme</span> by CollabAI Hub.
      </div>
      {toast && (
        <NeonToast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default GitHubEditor;
