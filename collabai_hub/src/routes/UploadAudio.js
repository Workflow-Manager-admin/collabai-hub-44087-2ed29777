import React, { useState } from "react";

// PUBLIC_INTERFACE
function UploadAudio() {
  // Upload state logic (intact from original)
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  // PUBLIC_INTERFACE
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError("");
    setSuccess(false);
  };

  // Handle upload logic
  // PUBLIC_INTERFACE
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select an audio file.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setSuccess(false);

    try {
      // Simulated upload handler
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setSuccess(true);
    } catch (err) {
      setUploadError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  return (
    <div className="upload-audio-hacker-bg">
      <div className="neon-border upload-audio-container">
        <h1 className="neon-title">
          <span className="code-angled">&lt;</span>
          Upload Audio File
          <span className="code-angled">&gt;</span>
        </h1>
        <p className="neon-desc">
          Drop your <span className="neon-green">.mp3</span>, <span className="neon-blue">.wav</span> or <span className="neon-red">.m4a</span> files. No size limits.
        </p>

        <form onSubmit={handleUpload} className="upload-form-neon" autoComplete="off">
          <label htmlFor="audio-upload" className="neon-label">
            Select Audio File
          </label>
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="neon-input"
            disabled={uploading}
            style={{ fontFamily: "inherit" }}
          />
          <button
            type="submit"
            className={`neon-btn ${uploading ? "btn-disabled" : ""}`}
            disabled={uploading}
          >
            {uploading ? (
              <span>
                <span className="glow-dot" /> Uploading...
              </span>
            ) : (
              <>
                <span className="terminal-cursor">▶</span> Upload
              </>
            )}
          </button>
        </form>
        {uploadError && <div className="neon-error">{uploadError}</div>}
        {success && (
          <div className="neon-success">Upload complete! <span className="blinking-cursor">█</span></div>
        )}
        <div className="neon-hint-row">
          <div className="neon-mini-box neon-green-glow" />
          <div className="neon-mini-box neon-blue-glow" />
          <div className="neon-mini-box neon-red-glow" />
          <span className="neon-hint">
            Tip: Transcriptions are powered by ultra-fast AI.
          </span>
        </div>
      </div>
      <style>{`
.upload-audio-hacker-bg {
  min-height: 100vh;
  background: #010101;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 56px;
  font-family: 'Fira Mono', 'Consolas', 'Menlo', 'monospace';
}

.upload-audio-container {
  background: rgba(10,22,15,0.97);
  border-radius: 18px;
  margin-top: 36px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 0 24px 4px #00ff8880, 0 0 3px #000;
  border: 2.5px solid #00fff9;
  padding: 38px 32px 32px 32px;
  position: relative;
}

.neon-title {
  color: #0fff95;
  text-shadow:
    0 0 6px #00ffc0,
    0 0 14px #00f6ff,
    0 0 30px #0ff;
  font-size: 2.2rem;
  font-family: 'Fira Mono', 'Consolas', 'monospace';
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 1.3px;
}

.code-angled {
  color: #fa1fff;
  text-shadow: 0 0 6px #d700a4, 0 0 10px #ff00e6;
  font-size: 1.6rem;
  margin: 0 6px;
  font-family: inherit;
}

.neon-desc {
  color: #8affea;
  font-family: 'Fira Mono', 'Consolas', 'monospace';
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.1rem;
  text-shadow: 0 0 7px #1e4856;
}

.neon-green {
  color: #00ff6e;
  text-shadow: 0 0 6px #2fff66, 0 0 14px #77ffb0;
  font-weight: bold;
}
.neon-blue {
  color: #06e7ff;
  text-shadow: 0 0 8px #00d9ff, 0 0 13px #00eaff;
  font-weight: bold;
}
.neon-red {
  color: #ff176b;
  text-shadow: 0 0 7px #e84797, 0 0 13px #ff61a6;
  font-weight: bold;
}

.upload-form-neon {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.neon-label {
  font-size: 1.02rem;
  letter-spacing: 1px;
  margin-bottom: 4px;
  font-family: inherit;
  color: #00fff9;
  text-shadow:
    0 0 7px #00ffa6,
    0 0 16px #06e7ff;
  background: transparent;
}

.neon-input {
  padding: 10px 16px;
  background: #101718;
  border: none;
  border-radius: 8px;
  color: #e0ffe5;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  box-shadow: 0 0 12px #00fff960;
  border: 1.7px solid #2be0d2;
  margin-bottom: 3px;
  transition: border 0.18s, box-shadow 0.16s;
}
.neon-input:focus {
  border: 2.2px solid #00ffc8;
  box-shadow: 0 0 20px #00ffcc;
  background: #101c18;
  color: #ffffff;
}

.neon-btn {
  padding: 13px 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  background: #000b1a;
  color: #05ff91;
  border: 2.2px solid #09fff6;
  border-radius: 9px;
  box-shadow: 0 0 16px #06e7ff;
  cursor: pointer;
  text-shadow: 0 0 6px #0affc0;
  transition: all 0.15s cubic-bezier(0.7,0,0.4,1);
  position: relative;
  user-select: none;
}
.neon-btn:hover:enabled {
  background: #001b12;
  color: #0affbc;
  box-shadow: 0 0 28px #00ffac, 0 0 14px #00fff9;
  border-color: #24fae4;
  text-shadow: 0 0 14px #09ff96;
}
.neon-btn:active:enabled {
  background: #070830;
  border-color: #ffea00;
  color: #fff800;
  box-shadow: 0 0 30px #e6e600;
}
.btn-disabled, .neon-btn:disabled {
  opacity: 0.54;
  pointer-events: none;
  box-shadow: none;
}

.terminal-cursor {
  color: #39ff14;
  margin-right: 8px;
  font-weight: 900;
  text-shadow: 0 0 6px #39ff14cc, 0 0 20px #0f0;
  font-size: 1.1em;
}

.glow-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 10px;
  border-radius: 50%;
  background: #0ff;
  box-shadow: 0 0 8px #00ffbc;
  animation: dot-pulse 1.2s infinite alternate;
}
@keyframes dot-pulse {
  to { background: #00e0a2; box-shadow: 0 0 17px #00ffbc, 0 0 7px #00fff2a0; }
}

.neon-error {
  color: #ff1c83;
  text-shadow: 0 0 7px #ff00a6cc, 0 0 18px #bb54a8;
  background: #2b0819;
  border: 1.7px solid #ff1c83;
  border-radius: 7px;
  margin-top: 13px;
  font-family: inherit;
  padding: 9px 0 9px 15px;
  font-size: 1.04rem;
  letter-spacing: 0.6px;
  word-break: break-word;
}
.neon-success {
  color: #08ffc7;
  text-shadow: 0 0 7px #21ffd6cc, 0 0 23px #66eeb4;
  background: #102720;
  border: 1.4px solid #13ffd2;
  border-radius: 7px;
  margin-top: 13px;
  font-family: inherit;
  padding: 10px 0 10px 15px;
  font-size: 1.07rem;
  letter-spacing: 0.6px;
  word-break: break-word;
}

/* Fancy blinking terminal cursor for success */
.blinking-cursor {
  color: #0ff;
  animation: blink-cursor 1.1s steps(2, start) infinite;
  font-family: 'Fira Mono', 'Consolas', 'monospace';
}
@keyframes blink-cursor {
  0% { opacity: 1; }
  49% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 0; }
}

.neon-hint-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.neon-mini-box {
  width: 20px;
  height: 7px;
  border-radius: 4px;
  box-shadow: 0 0 6px;
}
.neon-green-glow { background: #00ff6e; box-shadow: 0 0 10px #00ff6e, 0 0 2px #000; }
.neon-blue-glow { background: #06e7ff; box-shadow: 0 0 10px #06e7ff, 0 0 2px #000; }
.neon-red-glow { background: #ff176b; box-shadow: 0 0 13px #ff176b, 0 0 2px #000; }
.neon-hint {
  color: #27fffa;
  font-size: 0.97rem;
  letter-spacing: 0.09em;
  font-family: inherit;
  margin-left: 8px;
  text-shadow: 0 0 4px #11ffd055;
}

/* NEON BORDER GLOW */
.neon-border {
  box-shadow:
    0 0 0 3px #00fff5 inset,
    0 0 18px 3px #00fff550,
    0 0 42px 4px #03e2e8bb;
}

/* Scrollbar styling for terminal chic */
.upload-audio-container ::-webkit-scrollbar {
  width: 9px;
  background: #01040a;
}
.upload-audio-container ::-webkit-scrollbar-thumb {
  background: #08e6c1;
  border-radius: 9px;
  box-shadow: 0 0 12px #01fabc;
}

    `}
      </style>
    </div>
  );
}

export default UploadAudio;
