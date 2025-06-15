import React, { useState, useRef } from "react";
import "./AudioPdfTranscription.modern.css";

const DEFAULT_ASSEMBLYAI_KEY = "7cf47b6c50b84a339333ae4ae567f29d";
const DEFAULT_GEMINI_KEY = "AIzaSyD4Kusj3acrOMEaSdNRKxIMLvh5SRv8tMg";

const ASSEMBLY_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const ASSEMBLY_TRANSCRIPT_URL = "https://api.assemblyai.com/v2/transcript";
const ASSEMBLY_STATUS_URL = (id) => `https://api.assemblyai.com/v2/transcript/${id}`;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

function localGet(key, fallback) {
  try {
    const v = window.localStorage.getItem(key);
    return v ?? fallback;
  } catch (e) {
    return fallback;
  }
}

function localSet(key, val) {
  try {
    window.localStorage.setItem(key, val);
  } catch (e) { }
}

function UploadAudio() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [stage, setStage] = useState("ready");
  const [error, setError] = useState("");
  const [assemblyKey, setAssemblyKey] = useState(localGet("assemblyai_api_key", DEFAULT_ASSEMBLYAI_KEY));
  const [geminiKey, setGeminiKey] = useState(localGet("gemini_api_key", DEFAULT_GEMINI_KEY));
  const [showKeyEdit, setShowKeyEdit] = useState(false);
  const [curTranscriptId, setCurTranscriptId] = useState("");
  const [transcribeStatusMsg, setTranscribeStatusMsg] = useState("");
  const fileInputRef = useRef();

  // Handlers
  function handleFileSelected(e) {
    setTranscript("");
    setSummary("");
    setUploadProgress(null);
    setError("");
    setCurTranscriptId("");
    setStage("ready");
    setTranscribeStatusMsg("");
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  async function uploadAndTranscribe() {
    setError("");
    if (!file) {
      setError("Please select an audio or video file.");
      return;
    }
    if (!assemblyKey) {
      setError("Please provide AssemblyAI API Key.");
      return;
    }
    setStage("uploading");
    setUploadProgress(0);

    try {
      const uploadUrl = await uploadFileToAssembly(file, assemblyKey, setUploadProgress);
      setStage("transcribing");
      setTranscribeStatusMsg("Submitting file for transcription...");

      const transcriptID = await submitForTranscription(uploadUrl, assemblyKey);
      setCurTranscriptId(transcriptID);
      setTranscribeStatusMsg("Transcription started. Polling for completion...");
      setStage("polling");

      const fullTranscript = await pollForTranscript(transcriptID, assemblyKey, setTranscribeStatusMsg);
      setTranscript(fullTranscript);
      setStage("done");
      setTranscribeStatusMsg("Transcription complete!");
    } catch (err) {
      setError(err.message || String(err));
      setStage("error");
    }
  }

  async function summarizeTranscript() {
    setError("");
    setSummary("");
    if (!geminiKey) {
      setError("Please provide Gemini AI API Key.");
      return;
    }
    if (!transcript) {
      setError("Transcript is empty or not ready.");
      return;
    }
    setStage("summarizing");
    try {
      const summaryOut = await summarizeWithGemini(transcript, geminiKey);
      setSummary(summaryOut);
      setStage("done");
    } catch (err) {
      setError(err.message || String(err));
      setStage("done");
    }
  }

  function handleKeySubmit(e) {
    e.preventDefault();
    setShowKeyEdit(false);
    localSet("assemblyai_api_key", assemblyKey);
    localSet("gemini_api_key", geminiKey);
  }

  function resetPage() {
    setFile(null);
    setTranscript("");
    setSummary("");
    setUploadProgress(null);
    setError("");
    setStage("ready");
    setCurTranscriptId("");
    setShowKeyEdit(false);
    setTranscribeStatusMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="audio-transcription-container">
      <div className="header-section">
        <h2 className="title">Audio Transcription & Analysis</h2>
        <p className="subtitle">
          Upload audio/video to generate transcriptions and AI-powered summaries
          <span className="file-types">(Supports: mp3, wav, m4a, mp4, mov)</span>
        </p>
      </div>

      <div className="api-key-section">
        <div className="api-key-display">
          <div className="key-info">
            <span>AssemblyAI: <code>{assemblyKey ? maskKey(assemblyKey) : "not set"}</code></span>
            <span>Gemini: <code>{geminiKey ? maskKey(geminiKey) : "not set"}</code></span>
          </div>
          <button 
            className="toggle-key-btn"
            onClick={() => setShowKeyEdit((v) => !v)}
          >
            {showKeyEdit ? "Cancel" : "Edit API Keys"}
          </button>
        </div>

        {showKeyEdit && (
          <form onSubmit={handleKeySubmit} className="api-key-form">
            <div className="form-group">
              <label>AssemblyAI API Key:</label>
              <input 
                type="text" 
                value={assemblyKey} 
                onChange={(e) => setAssemblyKey(e.target.value)} 
                placeholder="Enter AssemblyAI key"
              />
            </div>
            <div className="form-group">
              <label>Gemini AI Key:</label>
              <input 
                type="text" 
                value={geminiKey} 
                onChange={(e) => setGeminiKey(e.target.value)} 
                placeholder="Enter Gemini key"
              />
            </div>
            <button type="submit" className="save-keys-btn">Save Keys</button>
          </form>
        )}
      </div>

      <div className="upload-section">
        <div className="file-upload-wrapper">
          <label className="file-upload-label">
            <input
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/m4a,video/mp4,video/quicktime"
              onChange={handleFileSelected}
              ref={fileInputRef}
              disabled={stage === "uploading" || stage === "transcribing" || stage === "polling"}
            />
            <div className="file-upload-display">
              {file ? (
                <div className="file-selected">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
              ) : (
                <div className="file-prompt">
                  <span className="upload-icon">⬆️</span>
                  <span>Select audio/video file</span>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="action-buttons">
          <button
            className={`primary-btn ${!file || ["uploading", "transcribing", "polling"].includes(stage) ? "disabled" : ""}`}
            disabled={!file || stage === "uploading" || stage === "transcribing" || stage === "polling"}
            onClick={uploadAndTranscribe}
          >
            {stage === "uploading" ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Uploading...
              </span>
            ) : stage === "transcribing" ? (
              "Starting Transcription..."
            ) : stage === "polling" ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Transcribing...
              </span>
            ) : (
              "Upload & Transcribe"
            )}
          </button>
          <button 
            className="secondary-btn" 
            onClick={resetPage}
          >
            Reset
          </button>
        </div>
      </div>

      {stage === "uploading" && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Upload Progress</span>
            <span>{uploadProgress !== null ? Math.round(uploadProgress * 100) + "%" : "Starting..."}</span>
          </div>
          <ProgressBar progress={uploadProgress} />
        </div>
      )}

      {(stage === "transcribing" || stage === "polling" || transcribeStatusMsg) && (
        <div className="status-message">
          <div className="status-indicator"></div>
          <span>{transcribeStatusMsg}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div>
            <div className="error-title">Error</div>
            <div className="error-text">{error}</div>
          </div>
        </div>
      )}

      {transcript && (
        <div className="result-section">
          <div className="result-header">
            <h3>Transcript</h3>
            <button 
              className="copy-btn"
              onClick={() => copyText(transcript)}
            >
              <span className="copy-icon">⎘</span>
              Copy
            </button>
          </div>
          <TextDisplayArea value={transcript} />
          
          <div className="summary-action">
            <button
              className={`primary-btn ${stage === "summarizing" ? "loading" : ""}`}
              onClick={summarizeTranscript}
            >
              {stage === "summarizing" ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Summarizing...
                </span>
              ) : (
                "Generate Summary with Gemini"
              )}
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="result-section summary-section">
          <div className="result-header">
            <h3>Summary</h3>
            <button 
              className="copy-btn"
              onClick={() => copyText(summary)}
            >
              <span className="copy-icon">⎘</span>
              Copy
            </button>
          </div>
          <TextDisplayArea value={summary} />
        </div>
      )}

      <div className="footer">
        {curTranscriptId && (
          <div className="transcript-id">
            <span>Transcript ID: </span>
            <code>{curTranscriptId}</code>
          </div>
        )}
        <div className="powered-by">
          <span>Powered by </span>
          <a href="https://www.assemblyai.com/docs" target="_blank" rel="noopener noreferrer">AssemblyAI</a>
          <span> & </span>
          <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Gemini AI</a>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill"
        style={{ width: `${Math.round((progress || 0) * 100)}%` }}
      />
    </div>
  );
}

function TextDisplayArea({ value }) {
  return (
    <div className="text-display">
      <pre>{value}</pre>
    </div>
  );
}

// Core logic functions remain the same as your original implementation
async function uploadFileToAssembly(file, apiKey, progressCb) {
  // ... (same as original)
}

async function submitForTranscription(uploadUrl, apiKey) {
  // ... (same as original)
}

async function pollForTranscript(transcriptId, apiKey, statusCb) {
  // ... (same as original)
}

async function summarizeWithGemini(text, apiKey) {
  // ... (same as original)
}

function copyText(val) {
  // ... (same as original)
}

function maskKey(key) {
  // ... (same as original)
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default UploadAudio;