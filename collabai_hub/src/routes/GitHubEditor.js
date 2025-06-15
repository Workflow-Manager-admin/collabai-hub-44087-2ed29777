import React, { useEffect, useState, useRef } from "react";
import "./GitHubEditor.modern.css";

// Font injection (optimized)
if (typeof window !== 'undefined' && !document.getElementById('orbitron-font')) {
  const fontLink = document.createElement('link');
  fontLink.id = 'orbitron-font';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Montserrat:wght@400;700&family=Fira+Mono:wght@500;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}

const MONACO_CDN = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs";

function loadMonacoEditor(callback) {
  if (window.monaco) return callback();
  if (window.__monacoLoading) return;
  window.__monacoLoading = true;

  const onLoad = () => {
    window.__monacoLoading = false;
    if (window.require && window.monaco) callback();
  };

  if (!document.getElementById("monaco-editor-loader")) {
    const script = document.createElement("script");
    script.id = "monaco-editor-loader";
    script.src = `${MONACO_CDN}/loader.min.js`;
    script.onload = () => {
      window.require.config({ paths: { vs: `${MONACO_CDN}` } });
      window.require(["vs/editor/editor.main"], onLoad);
    };
    document.body.appendChild(script);
  }
}

function NeonToast({ message, type, onClose }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    error: "rgba(42, 26, 24, 0.95)",
    success: "rgba(20, 40, 25, 0.95)",
    info: "rgba(17, 22, 30, 0.95)"
  };
  
  const borderColors = {
    error: "#ff5555",
    success: "#00FF00",
    info: "#00FF00bb"
  };
  
  const icon = {
    error: "⚡",
    success: "✅",
    info: "ℹ️"
  };

  return (
    <div
      style={{
        background: bgColors[type],
        color: type === "error" ? "#FF6666" : "#b0ffbc",
        border: `2px solid ${borderColors[type]}`,
        boxShadow: `0 0 17px ${borderColors[type]}55`,
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
        filter: `drop-shadow(0 0 ${type === "error" ? "12px #ff55557a" : "15px #00ff009c"})`,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)"
      }}
      role="alert"
      aria-live="assertive"
    >
      <span style={{ fontSize: 21 }}>{icon[type]}</span>
      <span>{message}</span>
      <button
        style={{
          background: "transparent",
          color: type === "error" ? "#FF6666" : "#b0ffbc",
          fontSize: 18,
          marginLeft: 18,
          border: 0,
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.2s",
          padding: "0 5px"
        }}
        aria-label="Close notification"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        ×
      </button>
    </div>
  );
}

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
        onChange?.(editorRef.current.getValue());
      });
    });
    return () => {
      mounted = false;
      editorRef.current?.dispose();
      editorRef.current = null;
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
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: "0 0 0 rgba(57, 255, 20, 0)",
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-neon-bright)";
        e.currentTarget.style.boxShadow = "0 0 15px rgba(57, 255, 20, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-neon)";
        e.currentTarget.style.boxShadow = "0 0 0 rgba(57, 255, 20, 0)";
      }}
    />
  );
}

function guessMonacoLang(filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  const langMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    json: "json",
    css: "css",
    scss: "css",
    less: "css",
    md: "markdown",
    html: "html",
    htm: "html",
    sh: "shell",
    zsh: "shell",
    bash: "shell",
    yml: "yaml",
    yaml: "yaml"
  };
  return langMap[ext] || "plaintext";
}

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

function FileTreeItem({ name, path, type, selected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <li
      style={{
        margin: "4px 0",
        position: "relative",
        transition: "all 0.2s ease"
      }}
    >
      {type === "tree" ? (
        <div
          className="ge-filetree-folder"
          style={{
            fontSize: 16.5,
            display: "inline-block",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            background: isHovered ? "rgba(57, 255, 20, 0.1)" : "transparent",
            transform: isHovered ? "translateX(3px)" : "none",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onClick(path)}
          tabIndex={0}
          aria-label={`Folder ${name}`}
        >
          <span 
            role="img" 
            aria-label="folder" 
            style={{
              filter: `drop-shadow(0 0 ${isHovered ? "12px" : "9px"} #00ff62)`,
              transition: "filter 0.2s ease"
            }}
          >
            📁
          </span>{" "}
          <span style={{ fontWeight: isHovered ? 700 : 600 }}>
            {name}
          </span>
        </div>
      ) : (
        <button
          className={`ge-filetree-file${path === selected ? " selected" : ""}`}
          style={{
            fontFamily: "'Fira Mono', 'Jetbrains Mono', monospace",
            fontWeight: path === selected ? 700 : 500,
            background: path === selected 
              ? "rgba(57, 255, 20, 0.15)" 
              : isHovered 
                ? "rgba(57, 255, 20, 0.08)" 
                : "transparent",
            border: "none",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            transition: "all 0.2s ease",
            transform: isHovered ? "translateX(3px)" : "none",
            boxShadow: isHovered ? "0 0 8px rgba(57, 255, 20, 0.2)" : "none"
          }}
          onClick={() => onClick(path)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={`Open ${path}`}
        >
          <span 
            role="img" 
            aria-label="file" 
            style={{
              marginRight: 6,
              verticalAlign: '-1.5px',
              fontSize: 16,
              filter: `drop-shadow(0 0 ${isHovered ? "8px" : "5px"} rgba(57, 255, 20, 0.7))`,
              transition: "filter 0.2s ease"
            }}
          >
            📄
          </span>
          {name}
        </button>
      )}
    </li>
  );
}

function FileTreeView({ tree, path = "", onFileClick, selectedFile }) {
  return (
    <ul style={{ 
      listStyle: "none", 
      margin: 0, 
      padding: "0 0 0 17px",
      transition: "all 0.3s ease"
    }}>
      {Object.entries(tree).map(([key, item]) => {
        const fullPath = path ? `${path}/${key}` : key;
        if (item.type === "tree" || typeof item.sha === "undefined") {
          return (
            <React.Fragment key={fullPath}>
              <FileTreeItem
                name={key}
                path={fullPath}
                type="tree"
                selected={selectedFile}
                onClick={onFileClick}
              />
              <FileTreeView
                tree={item}
                path={fullPath}
                onFileClick={onFileClick}
                selectedFile={selectedFile}
              />
            </React.Fragment>
          );
        } else {
          return (
            <FileTreeItem
              key={fullPath}
              name={key}
              path={fullPath}
              type="file"
              selected={selectedFile}
              onClick={onFileClick}
            />
          );
        }
      })}
    </ul>
  );
}

function GitHubEditor() {
  // State management
  const [githubToken, setGitHubToken] = useState(() => localStorage.getItem("GITHUB_TOKEN") || "");
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoErr, setRepoErr] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [tree, setTree] = useState(null);
  const [treeSha, setTreeSha] = useState("");
  const [treeErr, setTreeErr] = useState("");
  const [refreshingTree, setRefreshingTree] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileSha, setFileSha] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [pushing, setPushing] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch user's repos
  useEffect(() => {
    if (!githubToken) return;
    
    setLoadingRepos(true);
    setRepoErr("");
    
    const fetchRepos = async () => {
      try {
        const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github+json",
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch repositories.");
        
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (e) {
        setRepoErr(e.message || "Failed to fetch repositories.");
      } finally {
        setLoadingRepos(false);
      }
    };
    
    fetchRepos();
  }, [githubToken]);

  // Load repo tree when repo is selected
  useEffect(() => {
    if (!selectedRepo || !githubToken) {
      setTree(null);
      setTreeSha("");
      setSelectedFile("");
      setFileContent("");
      setFileSha("");
      return;
    }
    
    const loadRepoTree = async () => {
      setRefreshingTree(true);
      setTree(null);
      setTreeSha("");
      setTreeErr("");
      setSelectedFile("");
      setFileContent("");
      setFileSha("");
      
      try {
        const [owner, repo] = selectedRepo.split("/");
        
        // Fetch repo info to get default branch
        const repoRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github+json" } }
        );
        
        if (!repoRes.ok) throw new Error("Repo not found.");
        
        const repoInfo = await repoRes.json();
        setRepoData(repoInfo);
        
        // Fetch tree for default branch
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`,
          { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github+json" } }
        );
        
        if (!treeRes.ok) throw new Error("Failed to load repo tree.");
        
        const treeData = await treeRes.json();
        setTree(flattenGitHubTree(treeData.tree || []));
        setTreeSha(treeData.sha);
      } catch (e) {
        setTreeErr(e.message || "Failed to load file tree.");
      } finally {
        setRefreshingTree(false);
      }
    };
    
    loadRepoTree();
  }, [selectedRepo, githubToken]);

  // Load file content when file is selected
  useEffect(() => {
    if (!selectedRepo || !selectedFile) {
      setFileContent("");
      setFileSha("");
      return;
    }
    
    const loadFileContent = async () => {
      const [owner, repo] = selectedRepo.split("/");
      setLoadingFile(true);
      setFileContent("");
      setFileSha("");
      
      try {
        // Get raw file content
        const contentRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(selectedFile)}`,
          { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github.v3.raw" } }
        );
        
        if (!contentRes.ok) {
          const body = await contentRes.json();
          throw new Error(body.message || "Failed to fetch file.");
        }
        
        const content = await contentRes.text();
        setFileContent(content);
        setEditorDirty(false);
        
        // Get file metadata for SHA
        const metaRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(selectedFile)}`,
          { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github+json" } }
        );
        
        const meta = await metaRes.json();
        setFileSha(meta.sha || "");
      } catch (e) {
        setToast({
          message: e.message || "Failed to fetch file contents. Please check your access/token.",
          type: "error"
        });
      } finally {
        setLoadingFile(false);
      }
    };
    
    loadFileContent();
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
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(selectedFile)}`,
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
      
      // Refresh tree
      setRefreshingTree(true);
      const treeResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
        { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github+json" } }
      );
      
      const treeData = await treeResp.json();
      setTree(flattenGitHubTree(treeData.tree || []));
      setTreeSha(treeData.sha);
      setRefreshingTree(false);
    } catch (e) {
      setToast({ message: e.message || "Failed to commit.", type: "error" });
    } finally {
      setPushing(false);
    }
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
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(newFilePath)}`,
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
      
      // Refresh tree
      setRefreshingTree(true);
      const treeResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
        { headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github+json" } }
      );
      
      const treeData = await treeResp.json();
      setTree(flattenGitHubTree(treeData.tree || []));
      setTreeSha(treeData.sha);
      setRefreshingTree(false);
    } catch (e) {
      setToast({ message: e.message || "Failed to create file.", type: "error" });
    } finally {
      setCreatingFile(false);
    }
  };
  
  const closeToast = () => setToast(null);

  // Styles
  const styles = {
    container: {
      paddingTop: '80px',
      minHeight: 'calc(100vh - 200px)',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.2rem',
      fontWeight: 900,
      fontFamily: "'Orbitron', 'Montserrat', sans-serif",
      color: '#39ff14',
      textShadow: '0 0 15px #39ff14',
      letterSpacing: '0.05em',
      marginBottom: '30px',
      transition: 'all 0.3s ease'
    },
    mainPane: {
      display: 'flex',
      flexDirection: 'row',
      gap: '30px',
      marginTop: '20px',
      marginBottom: '30px',
      transition: 'all 0.3s ease',
      '@media (max-width: 768px)': {
        flexDirection: 'column'
      }
    },
    sidebar: {
      flex: '0 0 300px',
      background: 'rgba(20, 25, 20, 0.7)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(57, 255, 20, 0.3)',
      boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)',
      transition: 'all 0.3s ease',
      '@media (max-width: 768px)': {
        flex: '1',
        width: '100%'
      }
    },
    mainContent: {
      flex: '1',
      background: 'rgba(20, 25, 20, 0.7)',
      borderRadius: '16px',
      padding: '25px',
      border: '1px solid rgba(57, 255, 20, 0.3)',
      boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)',
      transition: 'all 0.3s ease',
      minHeight: '500px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid rgba(57, 255, 20, 0.5)',
      background: 'rgba(10, 15, 10, 0.7)',
      color: '#fff',
      fontFamily: "'Fira Mono', monospace",
      fontSize: '14px',
      marginBottom: '15px',
      transition: 'all 0.3s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#39ff14',
        boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)'
      }
    },
    button: {
      background: 'linear-gradient(145deg, rgba(57, 255, 20, 0.8), rgba(20, 180, 10, 0.8))',
      color: '#000',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '14px',
      fontFamily: "'Montserrat', sans-serif",
      transition: 'all 0.3s ease',
      boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)',
      '&:hover': {
        background: 'linear-gradient(145deg, rgba(57, 255, 20, 0.9), rgba(20, 180, 10, 0.9))',
        boxShadow: '0 0 15px rgba(57, 255, 20, 0.5)',
        transform: 'translateY(-2px)'
      },
      '&:disabled': {
        background: 'rgba(100, 100, 100, 0.5)',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none'
      }
    },
    secondaryButton: {
      background: 'transparent',
      color: '#39ff14',
      border: '1px solid #39ff14',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      fontFamily: "'Montserrat', sans-serif",
      transition: 'all 0.3s ease',
      marginLeft: '10px',
      '&:hover': {
        background: 'rgba(57, 255, 20, 0.1)',
        boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)'
      }
    },
    fileStatus: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      marginLeft: '10px',
      background: editorDirty ? 'rgba(255, 200, 50, 0.2)' : 'rgba(57, 255, 20, 0.2)',
      color: editorDirty ? '#ffcc00' : '#39ff14',
      border: `1px solid ${editorDirty ? '#ffcc00' : '#39ff14'}`,
      transition: 'all 0.3s ease'
    },
    emptyState: {
      color: '#b0ffbc',
      opacity: 0.8,
      fontSize: '16px',
      textAlign: 'center',
      marginTop: '40px',
      textShadow: '0 0 10px rgba(0, 255, 200, 0.3)',
      transition: 'all 0.3s ease'
    },
    footer: {
      marginTop: '30px',
      color: '#39ff14',
      textAlign: 'right',
      fontSize: '13px',
      opacity: 0.7,
      fontFamily: "'Orbitron', 'Montserrat', monospace",
      letterSpacing: '0.02em',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div className="container fade-in github-editor-modern-dashboard" style={styles.container}>
      <h2 style={styles.title}>
        <span 
          role="img" 
          aria-label="neon-light" 
          style={{
            marginRight: '10px',
            fontSize: '32px',
            filter: 'drop-shadow(0 0 8px #39ff14)',
            animation: 'pulse 2s infinite'
          }}
        >
          ⚡
        </span>
        GitHub Editor Dashboard
      </h2>
      
      <div style={styles.mainPane}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={{ marginBottom: '25px' }}>
            <label 
              htmlFor="repo-select" 
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 700,
                color: '#39ff14',
                fontSize: '15px'
              }}
            >
              Repository
            </label>
            <select
              id="repo-select"
              value={selectedRepo}
              onChange={handleRepoChange}
              style={styles.input}
              disabled={!githubToken || loadingRepos}
              aria-label="Choose GitHub repository"
            >
              <option value="">Select repository…</option>
              {repos.map((r) => (
                <option 
                  key={r.full_name} 
                  value={r.full_name}
                  style={{ 
                    color: '#39ff14',
                    background: '#0a0f0a',
                    fontWeight: 600
                  }}
                >
                  {r.full_name}
                </option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                style={{
                  ...styles.secondaryButton,
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '13px'
                }}
                onClick={() => {
                  localStorage.removeItem("GITHUB_TOKEN");
                  window.location.reload();
                }}
                tabIndex={0}
                type="button"
              >
                Reset Token
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <span style={{
                fontWeight: 700,
                color: '#39ff14',
                fontSize: '15px'
              }}>
                Files
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    ...styles.secondaryButton,
                    padding: '6px 12px',
                    fontSize: '13px'
                  }}
                  aria-label="New file"
                  onClick={handleAddFileClick}
                  disabled={!selectedRepo || refreshingTree}
                  type="button"
                >
                  + Add
                </button>
                <button
                  style={{
                    ...styles.secondaryButton,
                    padding: '6px 10px',
                    fontSize: '13px',
                    minWidth: '36px'
                  }}
                  aria-label="Refresh file tree"
                  onClick={() => setSelectedRepo(selectedRepo)}
                  disabled={refreshingTree || !selectedRepo}
                  type="button"
                >
                  ↻
                </button>
              </div>
            </div>
            
            {treeErr && (
              <div
                style={{
                  color: '#FF6666',
                  background: 'rgba(42, 26, 24, 0.7)',
                  border: '1px solid #ff4545',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '13px',
                  boxShadow: '0 0 10px rgba(255, 85, 85, 0.2)'
                }}
              >
                {treeErr}
              </div>
            )}
            
            {refreshingTree ? (
              <div 
                style={{ 
                  color: '#39ff14', 
                  textAlign: 'center', 
                  marginTop: '20px',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                Loading tree…
              </div>
            ) : tree ? (
              <div 
                style={{ 
                  maxHeight: '500px',
                  overflowY: 'auto',
                  paddingRight: '10px'
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
              <div style={{ 
                color: '#b0ffbc', 
                textAlign: 'center', 
                marginTop: '20px',
                opacity: 0.7
              }}>
                No files found.
              </div>
            ) : (
              <div style={{ 
                color: '#b0ffbc', 
                textAlign: 'center', 
                marginTop: '20px',
                opacity: 0.7
              }}>
                Select a repo to view files.
              </div>
            )}
          </div>
        </aside>
        
        {/* Main Content */}
        <section style={styles.mainContent}>
          {!githubToken ? (
            <div style={{
              color: '#39ff14',
              textShadow: '0 0 10px #39ff14',
              padding: '30px',
              fontWeight: 700,
              fontSize: '16px',
              borderRadius: '12px',
              background: 'rgba(34, 42, 34, 0.3)',
              borderLeft: '3px solid #39ff14',
              textAlign: 'center'
            }}>
              Please supply a GitHub Personal Access Token to use this editor.
            </div>
          ) : loadingRepos ? (
            <div 
              style={{ 
                color: '#b0ffbc', 
                textAlign: 'center', 
                marginTop: '40px',
                animation: 'pulse 1.5s infinite'
              }}
            >
              Loading repositories…
            </div>
          ) : !selectedRepo ? (
            <div style={styles.emptyState}>
              Pick a repository to browse and edit files.
            </div>
          ) : showNewFile ? (
            <div style={{
              background: 'linear-gradient(145deg, rgba(20, 40, 25, 0.8), rgba(15, 25, 30, 0.8))',
              borderLeft: '3px solid #39ff14',
              borderRadius: '14px',
              boxShadow: '0 0 20px rgba(57, 255, 20, 0.2)',
              padding: '25px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem',
                marginBottom: '20px',
                color: '#39ff14',
                textShadow: '0 0 10px #39ff14',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span role="img" aria-label="new">📝</span> 
                New File
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateFile(); }}>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={newFilePath}
                    onChange={(e) => setNewFilePath(e.target.value)}
                    placeholder="Filename, e.g. src/App.js"
                    style={styles.input}
                    disabled={creatingFile}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <MonacoCodeEditor
                    value={newFileContent}
                    language={guessMonacoLang(newFilePath)}
                    onChange={setNewFileContent}
                    height={250}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    style={styles.input}
                    disabled={creatingFile}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={styles.button}
                    type="submit"
                    disabled={creatingFile}
                  >
                    {creatingFile ? "Creating..." : "Create & Commit"}
                  </button>
                  
                  <button
                    style={styles.secondaryButton}
                    type="button"
                    onClick={() => setShowNewFile(false)}
                    disabled={creatingFile}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedFile ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      color: '#39ff14',
                      fontWeight: 700,
                      fontFamily: "'Orbitron', 'Montserrat', monospace",
                      fontSize: '1.1rem',
                      textShadow: '0 0 8px #39ff14',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span 
                      role="img" 
                      aria-label="file"
                      style={{
                        fontSize: '20px',
                        filter: 'drop-shadow(0 0 6px rgba(57, 255, 20, 0.7))'
                      }}
                    >
                      📄
                    </span>
                    {selectedFile}
                  </span>
                  
                  <span style={styles.fileStatus}>
                    {editorDirty ? "Unsaved" : "Saved"}
                  </span>
                </div>
              </div>
              
              {loadingFile ? (
                <div 
                  style={{ 
                    color: '#b0ffbc', 
                    textAlign: 'center', 
                    marginTop: '40px',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  Loading file...
                </div>
              ) : (
                <>
                  <MonacoCodeEditor
                    value={fileContent}
                    language={guessMonacoLang(selectedFile)}
                    onChange={handleEditorChange}
                    height="400px"
                    fontSize={15}
                  />
                  
                  <form
                    style={{ 
                      display: 'flex',
                      gap: '10px',
                      marginTop: '20px',
                      flexWrap: 'wrap'
                    }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveFile();
                    }}
                  >
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit message"
                      style={{ ...styles.input, flex: '1', marginBottom: '0' }}
                      disabled={pushing}
                    />
                    
                    <button
                      style={styles.button}
                      type="submit"
                      disabled={pushing || !editorDirty || !commitMessage}
                    >
                      {pushing ? "Saving..." : "Save & Commit"}
                    </button>
                    
                    <button
                      style={styles.secondaryButton}
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
                </>
              )}
            </div>
          ) : (
            <div style={styles.emptyState}>
              Select a file to view or edit it, or{' '}
              <span 
                style={{
                  color: '#39ff14',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textShadow: '0 0 8px #39ff14'
                }}
                onClick={handleAddFileClick}
              >
                + Add File
              </span>.
            </div>
          )}
        </section>
      </div>
      
      <div style={styles.footer}>
        All file actions use the official GitHub API.{' '}
        <span style={{ color: '#00ffcc', fontWeight: 600 }}>
          Neon theme
        </span>{' '}
        by CollabAI Hub.
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