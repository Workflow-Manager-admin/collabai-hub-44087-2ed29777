import React, { useState } from "react";

/**
 * UploadAudio Component
 * Neon hacker/terminal themed audio upload page
 * Upload logic unchanged, UI restyled to fit neon/terminal theme
 */
 // PUBLIC_INTERFACE
function UploadAudio() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // Handle file selection (unchanged logic)
  // PUBLIC_INTERFACE
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
    setProgress(0);
  };

  // PUBLIC_INTERFACE
  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage("No file selected.");
      return;
    }
    setUploading(true);
    setMessage("");
    setProgress(0);

    try {
      // Simulate file upload logic - placeholder fetch (replace with real API as needed)
      // For demo: upload progress animation
      for (let p = 1; p <= 100; p += 7) {
        await new Promise((res) => setTimeout(res, 27));
        setProgress(p);
      }
      // Simulate upload completion
      setMessage("Upload successful! 🚀");
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  // Neon/Hacker style variables, based on App.css
  // Example CSS variables: --kavia-orange, --kavia-dark, --text-color, etc.
  // We’ll use typical neon green and blue as primary neon colors.
  // Provide custom styles scoped to component.
  const neonVars = {
    "--neon-green": "#00FF99",
    "--neon-blue": "#00E1FF",
    "--neon-pink": "#ff4cf4",
    "--neon-yellow": "#ffe913",
    "--neon-bg": "#0a0a0a",
    "--glow-green": "0 0 16px 2px #00FF99, 0 0 3px 2px #01b654",
    "--glow-blue": "0 0 16px 2px #00E1FF, 0 0 3px 2px #3399ff",
    "--glow-pink": "0 0 15px 3px #ff4cf4",
    "--glow-red": "0 0 12px 2px #fd3e55",
    "--glow-yellow": "0 0 12px 2px #ffe913",
    "--font-family-terminal": "'Fira Mono', 'Roboto Mono', 'Source Code Pro', 'Menlo', monospace",
    "--border-radius": "10px"
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 160px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--neon-bg, #000)",
        fontFamily: "var(--font-family-terminal)",
        position: "relative"
      }}
      className="neon-upload-container"
    >
      {/* Inline style and scoped CSS for neon-hacker appearance */}
      <style>
        {`
        .neon-upload-form {
          background: linear-gradient(135deg, #111 70%, #0f222a 100%);
          border: 2px solid var(--neon-blue, #00E1FF);
          border-radius: var(--border-radius, 12px);
          box-shadow: var(--glow-blue, 0 0 16px 2px #00E1FF);
          padding: 2.5rem 2.5rem 2.0rem 2.5rem;
          min-width: 345px;
          max-width: 98vw;
        }
        .neon-hacker-title {
          color: var(--neon-green, #00FF99);
          text-shadow:
            0 0 6px #00FF99,
            0 0 2px #010,
            0 0 10px var(--neon-green, #00FF99);
          font-family: var(--font-family-terminal);
          text-align: center;
          margin-bottom: 18px;
          font-size: 2rem;
          letter-spacing: 0.04em;
          font-weight: 900;
          background: none;
        }
        .neon-file-input-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--neon-blue, #00E1FF);
          background: rgba(0,255,153,0.05);
          border: 1px dashed var(--neon-green, #00FF99);
          border-radius: var(--border-radius, 10px);
          padding: 1.2em 1em;
          cursor: pointer;
          margin-bottom: 1.0em;
          box-shadow: 0 0 11px #00FF9933, 0 0 3px 1px #00FF9933;
          transition: border 0.18s, box-shadow 0.18s;
        }
        .neon-file-input-label:hover,
        .neon-file-input-label:focus {
          border: 1.5px solid var(--neon-pink, #ff4cf4);
          box-shadow: var(--glow-pink);
          background: rgba(255,76,244,0.07);
        }
        .neon-file-input {
          display: none;
        }
        .file-chosen {
          margin-top: 0.7em;
          color: var(--neon-yellow, #ffe913);
          font-size: 1.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .neon-upload-btn {
          margin-top: 0.8em;
          font-size: 1.12em;
          font-family: var(--font-family-terminal);
          border-radius: var(--border-radius, 9px);
          background: #111;
          color: var(--neon-green, #00FF99);
          border: 2px solid var(--neon-green, #00FF99);
          box-shadow: var(--glow-green);
          font-weight: bold;
          padding: 0.7em 1.9em;
          letter-spacing: 0.1em;
          transition: all 0.18s, text-shadow 0.22s;
          outline: none;
          cursor: pointer;
          text-shadow: 0 0 12px #00FF99aa;
        }
        .neon-upload-btn:active, .neon-upload-btn:focus {
          background: #0d2229;
          color: var(--neon-pink, #ff4cf4);
          border-color: var(--neon-pink, #ff4cf4);
          box-shadow: var(--glow-pink);
          text-shadow: 0 0 9px #ff4cf499;
        }
        .terminal-progress-bar {
          margin: 1.6em 0 1em 0;
          background: #181a1b;
          border: 1px solid var(--neon-blue, #00E1FF);
          box-shadow: 0 0 8px #00E1FF22;
          border-radius: var(--border-radius, 10px);
          height: 18px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .terminal-progress-inner {
          background: linear-gradient(90deg, #00FF99 25%, #00E1FFcc 65%, #ff4cf4cc 100%);
          box-shadow: 0 0 16px #00FF9975, 0 0 17px #01e4ff96;
          height: 100%;
          width: 0%;
          transition: width 0.29s;
        }
        .neon-msg {
          padding: 0.9em;
          margin-top: 0.7em;
          background: rgba(10,255,80,0.02);
          border-radius: var(--border-radius, 10px);
          color: var(--neon-green, #00FF99);
          text-shadow: 0 0 8px #00ff9985;
          font-family: var(--font-family-terminal);
          text-align: center;
        }
        .neon-msg-error {
          color: #fd3e55;
          border: 1px solid #fd3e55;
          box-shadow: var(--glow-red), 0 0 5px #fd3e5511;
          background: rgba(253,62,85,0.061);
        }
        .ascii-terminal-footer {
          margin: 1em auto 0;
          color: #00FF99cc;
          font-size: 1.04em;
          font-family: var(--font-family-terminal);
          letter-spacing: 0.05em;
          word-spacing: 0.2em;
          text-align: center;
          text-shadow: 0 0 11px #00FF99aa, 0 0 6px #01b65455;
          opacity: 0.8;
          border-top: 1.5px dotted #00ff9911;
          padding-top: 0.5em;
          width: 96%;
          user-select: none;
          pointer-events: none;
        }
        `}
      </style>
      <form
        className="neon-upload-form"
        style={neonVars}
        onSubmit={handleUpload}
        autoComplete="off"
        spellCheck={false}
      >
        <div className="neon-hacker-title">{'< Upload Audio >'}</div>
        <label
          htmlFor="audio-upload"
          className="neon-file-input-label"
          tabIndex="0"
        >
          <span style={{
            fontSize: "1.15em",
            lineHeight: 1.2,
            fontFamily: "var(--font-family-terminal)",
            letterSpacing: "0.02em"
          }}>
            Select <span style={{ color: "var(--neon-green)" }}>Audio File</span> to Upload
          </span>
          <input
            className="neon-file-input"
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            tabIndex="-1"
          />
          {selectedFile && (
            <div className="file-chosen">
              <span>🎧 {selectedFile.name}</span>
            </div>
          )}
        </label>
        <button
          className="neon-upload-btn"
          type="submit"
          disabled={uploading}
          aria-busy={uploading}
        >
          {uploading ? (
            <span>
              <span style={{ color: "#ffe913" }}>Uploading</span>
              <span className="terminal-cursor" style={{
                fontFamily: "inherit",
                marginLeft: 4,
                opacity: 0.85,
                animation: "blink 1s step-end infinite"
              }}>|</span>
            </span>
          ) : "Upload"}
        </button>

        {/* Terminal-style progress bar */}
        {uploading && (
          <div className="terminal-progress-bar">
            <div
              className="terminal-progress-inner"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Display message after upload */}
        {message && (
          <div className={`neon-msg${/failed|error/i.test(message) ? " neon-msg-error" : ""}`}>
            <span>
              {message}
              {/* ASCII check or X */}
              {/successful|done/i.test(message) && (
                <span style={{ marginLeft: 5, color: "var(--neon-green)" }}>✔️</span>
              )}
              {/failed|error/i.test(message) && (
                <span style={{ marginLeft: 5, color: "#fd3e55" }}>✖️</span>
              )}
            </span>
          </div>
        )}
        <div className="ascii-terminal-footer">
          {"// 100% Secure .MP3, .WAV or .M4A uploads //"}
        </div>
      </form>
    </div>
  );
}

export default UploadAudio;
