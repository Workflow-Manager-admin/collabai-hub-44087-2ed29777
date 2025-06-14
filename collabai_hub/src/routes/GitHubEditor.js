import React, { useEffect, useState, useRef } from "react";

/*
  PUBLIC_INTERFACE
  GitHub Repository File Editor/Browser (Enhanced Functionality)
  - Fast file fetching and file tree navigation.
  - View, edit, add, delete files, and save changes via push to GitHub.
  - Enhanced modern, dark, neon-accented UI/UX for professional appearance.
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

// Recursively renders a file tree
function FileTreeView({ tree, path, onFileClick, selectedFile }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: "0 0 0 15px" }}>
      {Object.entries(tree).map(([key, item]) => {
        const fullPath = path ? `${path}/${key}` : key;
        if (item.type === "tree" || typeof item.sha === "undefined") {
          // Folder
          return (
            <li key={fullPath}>
              <span
                style={{
                  color: "#00FF00",
                  fontWeight: 700,
                  fontSize: 15.5,
                  cursor: "pointer",
                  textShadow: "0 0 4px #00FF0044",
                  padding: "2px 0",
                  letterSpacing: ".01em"
                }}
              >
                📂 {key}
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
                style={{
                  color: fullPath === selectedFile ? "#11161e" : "#b0ffbc",
                  background: fullPath === selectedFile ? "#00FF00" : "transparent",
                  border: "none",
                  fontWeight: fullPath === selectedFile ? 700 : 500,
                  fontSize: 15.1,
                  textAlign: "left",
                  width: "100%",
                  borderRadius: 5,
                  margin: "1px 0",
                  cursor: "pointer",
                  letterSpacing: ".01em",
                  padding: "4.5px 5px 3.7px 12px",
                  outline: fullPath === selectedFile ? "2px solid #00FF00" : "none",
                  boxShadow: fullPath === selectedFile ? "0 0 8px #00FF0088" : "none"
                }}
                onClick={() => onFileClick(fullPath)}
                aria-label={`Open ${fullPath}`}
              >
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
    <div
      className="container fade-in"
      style={{
        paddingTop: 100,
        minHeight: 610,
        fontFamily: "'Inter', 'Roboto', 'Fira Mono', monospace",
        color: "var(--text-color)"
      }}
    >
      <h2
        className="title"
        style={{
          color: "var(--accent-neon)",
          letterSpacing: ".016em",
          marginBottom: 11,
          fontWeight: 800,
          textShadow: "0 0 13px #00FF0044"
        }}
      >
        GitHub Editor Dashboard
      </h2>
      <div
        style={{
          background: "#101415",
          borderRadius: 11,
          borderLeft: "4px solid #00FF00",
          boxShadow: "0 0 25px #00FF0020, 0 2px 13px #00FF0016",
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          marginTop: 14,
          marginBottom: 10,
          minHeight: 440
        }}
      >
        {/* -- Sidebar: Repo picker & file tree -- */}
        <aside
          style={{
            minWidth: 225,
            maxWidth: 275,
            background: "#12191a",
            borderRight: "2px solid #00FF0023",
            padding: 15,
            height: "100%",
            boxShadow: "0 0 8px #00FF0040",
            borderTopLeftRadius: 11,
            borderBottomLeftRadius: 11
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="repo-select"
              style={{
                color: "#b0ffbc",
                fontWeight: 700,
                fontSize: 15.2,
                letterSpacing: ".015em",
                display: "block",
                marginBottom: 6
              }}
            >
              Repository
            </label>
            <select
              id="repo-select"
              value={selectedRepo}
              onChange={handleRepoChange}
              style={{
                width: "100%",
                background: "#161b20",
                color: "#00FF00",
                border: "1.7px solid #00FF00",
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 15.5,
                padding: "6px 10px",
                marginBottom: 3,
                transition: "border .15s"
              }}
              disabled={!githubToken || loadingRepos}
              aria-label="Choose GitHub repository"
            >
              <option value="">Select repository…</option>
              {repos.map((r) => (
                <option
                  key={r.full_name}
                  value={r.full_name}
                  style={{
                    color: "#b0ffbc",
                    background: "#101415"
                  }}
                >
                  {r.full_name}
                </option>
              ))}
            </select>
            <button
              className="btn"
              style={{
                background: "transparent",
                color: "#00FF00",
                marginTop: 6,
                padding: "5px 11px",
                fontWeight: 700,
                borderRadius: 5,
                fontSize: 13
              }}
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
            <span
              style={{
                color: "#b0ffbc",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: ".01em"
              }}
            >
              Files
            </span>
            <button
              className="btn"
              style={{
                background: "#00FF00",
                color: "#11161e",
                fontWeight: 600,
                marginLeft: 9,
                fontSize: 13,
                padding: "2.5px 9px",
                borderRadius: 7
              }}
              aria-label="New file"
              onClick={handleAddFileClick}
              disabled={!selectedRepo || refreshingTree}
              type="button"
            >
              + Add File
            </button>
            <button
              className="btn"
              style={{
                marginLeft: 7,
                background: "transparent",
                color: "#00FF00",
                fontWeight: 700,
                fontSize: 13,
                padding: "2px 6px",
                border: 0
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
              style={{
                color: "#FF6666",
                background: "#1a120f",
                border: "1.4px solid #ff4545",
                padding: "10px 6px",
                borderRadius: 5,
                marginBottom: 6,
                fontSize: 12.8
              }}
            >
              {treeErr}
            </div>
          )}
          {refreshingTree ? (
            <div style={{ color: "#00FF00", marginLeft: 2, marginTop: 16 }}>
              Loading tree…
            </div>
          ) : tree ? (
            <div
              style={{
                maxHeight: "48vh",
                overflowY: "auto",
                marginBottom: 8
              }}
            >
              <FileTreeView
                tree={tree}
                path=""
                onFileClick={handleFileClick}
                selectedFile={selectedFile}
              />
            </div>
          ) : selectedRepo ? (
            <div style={{ color: "#b0ffbc", marginTop: 12 }}>No files found.</div>
          ) : (
            <div style={{ color: "#b0ffbc", opacity: 0.7 }}>Select a repo to view its files.</div>
          )}
        </aside>
        {/* -- Editor/Main view -- */}
        <section
          style={{
            flex: 1,
            padding: "23px 16px 0 26px",
            minHeight: 420,
            position: "relative"
          }}
        >
          {!githubToken ? (
            <div
              style={{
                color: "#00FF00",
                padding: 34,
                fontWeight: 700,
                fontSize: 17
              }}
            >
              Please supply a GitHub Personal Access Token on the Dashboard or Projects page to use this editor.
            </div>
          ) : loadingRepos ? (
            <div style={{ color: "#b0ffbc", fontSize: 16, opacity: 0.7 }}>
              Loading repositories…
            </div>
          ) : !selectedRepo ? (
            <div
              style={{
                color: "#b0ffbc",
                opacity: 0.77,
                fontSize: 16.5,
                marginTop: 30
              }}
            >
              Pick a repository to browse and edit files.
            </div>
          ) : showNewFile ? (
            <div
              style={{
                background: "#141922",
                borderLeft: "3.2px solid #00FF00",
                borderRadius: 9,
                boxShadow: "0 0 9px #00FF0063",
                maxWidth: 610,
                margin: "23px auto",
                padding: "25px 16px",
              }}
            >
              <h3 style={{ color: "#00FF00", fontWeight: 800 }}>
                New File
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateFile();
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text"
                    value={newFilePath}
                    onChange={(e) => setNewFilePath(e.target.value)}
                    placeholder="Filename, e.g. src/App.js"
                    style={{
                      width: "97%",
                      border: "1.7px solid #00FF00",
                      borderRadius: 7,
                      background: "#10181d",
                      color: "#00FF00",
                      fontWeight: 600,
                      fontSize: 15.4,
                      padding: "8px 10px 7px 14px"
                    }}
                    disabled={creatingFile}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <MonacoCodeEditor
                    value={newFileContent}
                    language={guessMonacoLang(newFilePath)}
                    onChange={setNewFileContent}
                    height={220}
                  />
                </div>
                <div style={{ marginBottom: 11 }}>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    style={{
                      width: "97%",
                      border: "1.5px solid #00FF00",
                      borderRadius: 6,
                      background: "#142a15",
                      color: "#00FF00",
                      fontWeight: 700,
                      fontSize: 14.5,
                      padding: "8px 14px 7px 14px"
                    }}
                    disabled={creatingFile}
                  />
                </div>
                <button
                  className="btn btn-large"
                  style={{
                    background: "var(--accent-neon)",
                    color: "#11191a",
                    fontWeight: 700,
                    border: 0,
                    marginRight: 7
                  }}
                  type="submit"
                  disabled={creatingFile}
                >
                  {creatingFile ? "Creating file…" : "Create & Commit"}
                </button>
                <button
                  className="btn"
                  style={{
                    color: "#00FF00",
                    background: "transparent",
                    border: 0,
                    marginLeft: 8
                  }}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 7
                }}
              >
                <span
                  style={{
                    color: "#00FF00",
                    fontWeight: 800,
                    fontSize: 18,
                    letterSpacing: ".01em"
                  }}
                >
                  {selectedFile}
                </span>
                <span
                  style={{
                    background: editorDirty
                      ? "#aaffb326"
                      : "#00FF0033",
                    color: "#00FF00",
                    borderRadius: 7,
                    padding: "3px 11px",
                    fontSize: 13.2,
                    fontWeight: 700,
                    marginLeft: 6
                  }}
                >
                  {editorDirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              {loadingFile ? (
                <div style={{ color: "#b0ffbc" }}>Loading file…</div>
              ) : (
                <MonacoCodeEditor
                  value={fileContent}
                  language={guessMonacoLang(selectedFile)}
                  onChange={handleEditorChange}
                />
              )}
              <form
                style={{ marginTop: 15, display: "flex", gap: 13, alignItems: "center" }}
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
                  style={{
                    flex: 1,
                    background: "#181e14",
                    border: "1.4px solid #00FF00",
                    borderRadius: 7,
                    color: "#00FF00",
                    fontWeight: 700,
                    fontSize: 14
                  }}
                  disabled={pushing}
                />
                <button
                  className="btn btn-large"
                  style={{
                    background: "var(--accent-neon)",
                    color: "#191e13",
                    fontWeight: 700,
                    border: 0
                  }}
                  type="submit"
                  disabled={pushing || !editorDirty || !commitMessage}
                >
                  {pushing ? "Saving…" : "Save & Commit"}
                </button>
                <button
                  className="btn"
                  style={{
                    color: "#00FF00",
                    background: "transparent",
                    border: 0,
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
            <div
              style={{
                color: "#b0ffbc",
                opacity: 0.77,
                fontSize: 16.5,
                marginTop: 24
              }}
            >
              Select a file to view or edit it, or <b>+ Add File</b>.
            </div>
          )}
        </section>
      </div>
      <div
        style={{
          marginTop: 16,
          color: "var(--accent-neon)",
          textAlign: "right",
          fontSize: 13.2,
          opacity: 0.61
        }}
      >
        All file actions use the official GitHub API. Neon theme by CollabAI Hub.
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
