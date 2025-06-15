import React, { useState, useRef } from "react";
import "./AudioPdfTranscription.modern.css"; // use modern minimal styling

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

// PUBLIC_INTERFACE
function UploadAudio() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [stage, setStage] = useState("ready"); // 'ready', 'uploading', 'transcribing', 'polling', 'done', 'error', 'summarizing'
  const [error, setError] = useState("");
  const [assemblyKey, setAssemblyKey] = useState(localGet("assemblyai_api_key", DEFAULT_ASSEMBLYAI_KEY));
  const [geminiKey, setGeminiKey] = useState(localGet("gemini_api_key", DEFAULT_GEMINI_KEY));
  const [showKeyEdit, setShowKeyEdit] = useState(false);
  const [curTranscriptId, setCurTranscriptId] = useState("");
  const [transcribeStatusMsg, setTranscribeStatusMsg] = useState("");
  const fileInputRef = useRef();

  // Handlers

  // PUBLIC_INTERFACE
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

  // PUBLIC_INTERFACE
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

    // 1. Upload to AssemblyAI
    try {
      const uploadUrl = await uploadFileToAssembly(file, assemblyKey, setUploadProgress);

      setStage("transcribing");
      setTranscribeStatusMsg("Submitting file for transcription...");

      // 2. Submit transcription request
      const transcriptID = await submitForTranscription(uploadUrl, assemblyKey);

      setCurTranscriptId(transcriptID);
      setTranscribeStatusMsg("Transcription started. Polling for completion...");
      setStage("polling");

      // 3. Poll for result
      const fullTranscript = await pollForTranscript(transcriptID, assemblyKey, setTranscribeStatusMsg);

      setTranscript(fullTranscript);
      setStage("done");
      setTranscribeStatusMsg("Transcription complete!");

    } catch (err) {
      setError(err.message || String(err));
      setStage("error");
    }
  }

  // PUBLIC_INTERFACE
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

  // PUBLIC_INTERFACE
  function handleKeySubmit(e) {
    e.preventDefault();
    setShowKeyEdit(false);
    localSet("assemblyai_api_key", assemblyKey);
    localSet("gemini_api_key", geminiKey);
  }

  // PUBLIC_INTERFACE
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

  // UI Render

  return (
    <div className="container" style={{ maxWidth: 650, margin: "30px auto", background: "#232323", borderRadius: 12, padding: 32, boxShadow: "0 4px 18px #00000030" }}>
      <h2 className="title" style={{ marginBottom: 3 }}>Audio Upload & Transcription</h2>
      <p className="description" style={{ color: "var(--text-secondary)", marginBottom: 22 }}>
        Upload an audio/video file, transcribe it using AssemblyAI, and generate a summary using Gemini AI.<br />
        <span style={{ fontSize: 12, opacity: 0.75 }}>(Supported: mp3, wav, m4a, mp4, mov; 90 min max; privacy-respecting, done in-browser & direct to AI vendors)</span>
      </p>

      {/* API KEY Editor */}
      <div style={{ background: "#191919", borderRadius: 8, padding: "12px 16px", marginBottom: 20, border: "1px solid var(--border-color)" }}>
        <span>AssemblyAI Key: <code style={{ fontSize:13 }}>{assemblyKey ? maskKey(assemblyKey) : "not set"}</code></span>
        <br />
        <span>Gemini Key: <code style={{ fontSize:13 }}>{geminiKey ? maskKey(geminiKey) : "not set"}</code></span>
        <button className="btn" style={{ marginLeft: 16, background: "var(--kavia-orange)", color: "#fff", fontSize: 13 }} onClick={() => setShowKeyEdit((v) => !v)}>
          {showKeyEdit ? "Cancel" : "Edit API Keys"}
        </button>
        {showKeyEdit && (
          <form onSubmit={handleKeySubmit} style={{ marginTop: 13 }}>
            <label>
              AssemblyAI API Key:
              <input type="text" value={assemblyKey} onChange={(e) => setAssemblyKey(e.target.value)} style={{ marginLeft: 8, width: 260, background: "#222", color: "#fff", border: "1px solid #393939" }} autoFocus/>
            </label>
            <br />
            <label>
              Gemini AI Key:
              <input type="text" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ marginLeft: 8, width: 260, background: "#222", color: "#fff", border: "1px solid #393939" }} />
            </label>
            <br />
            <button type="submit" className="btn" style={{marginTop: 10, background: "var(--kavia-orange)", color: "#fff"}}>Save Keys</button>
          </form>
        )}
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: 30 }}>
        <input
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/m4a,video/mp4,video/quicktime"
          onChange={handleFileSelected}
          ref={fileInputRef}
          style={{ display: "block", marginBottom: 18 }}
          disabled={stage === "uploading" || stage === "transcribing" || stage === "polling"}
        />
        <button
          className="btn"
          disabled={!file || stage === "uploading" || stage === "transcribing" || stage === "polling"}
          onClick={uploadAndTranscribe}
          style={{ background: "var(--kavia-orange)", color: "#fff" }}
        >
          {stage === "uploading" ? "Uploading..." :
            stage === "transcribing" ? "Starting Transcription..." :
            stage === "polling" ? "Transcribing..." :
              "Upload & Transcribe"}
        </button>
        <button className="btn" onClick={resetPage} style={{marginLeft:14}}>Reset</button>
      </div>

      {/* Upload/Transcribe progress */}
      {stage === "uploading" && (
        <div style={{marginBottom: 14}}>
          <strong>Upload Progress:</strong> {uploadProgress !== null ? Math.round(uploadProgress * 100) + "%" : "Starting..."}
          <ProgressBar progress={uploadProgress}/>
        </div>
      )}

      {/* Transcription polling status */}
      {(stage === "transcribing" || stage === "polling" || transcribeStatusMsg) && (
        <div style={{marginBottom: 12, color: "#89f087" }}>
          <span style={{ fontWeight: 600 }}>{transcribeStatusMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ color: "var(--kavia-orange)", marginBottom: 18 }}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Transcript display and copy */}
      {transcript && (
        <section style={{ margin: "30px 0 10px 0", background: "#181818", padding: "18px 20px", borderRadius: 10, border: "1px solid #292929" }}>
          <h3 style={{marginTop: 0, fontWeight: 700, color: "#69d7ff"}}>Transcript</h3>
          <TextDisplayArea value={transcript} />
          <button className="btn" style={{ fontSize: 13, marginRight: 12, marginTop: 2 }} onClick={() => copyText(transcript)}>Copy Transcript</button>
        </section>
      )}

      {/* Summarize */}
      {transcript && (
        <div style={{margin: "16px 0"}}>
          <button className="btn" onClick={summarizeTranscript} style={{ fontWeight: 600, background: "var(--kavia-orange)", color: "#fff" }}>
            {stage === "summarizing" ? "Summarizing..." : "Summarize Transcript with Gemini"}
          </button>
        </div>
      )}

      {/* Summary display */}
      {summary && (
        <section style={{ margin: "10px 0 6px 0", background: "#181818", padding: "16px 20px", borderRadius: 10, border: "1px solid #292929" }}>
          <h3 style={{marginTop: 0, fontWeight: 700, color: "#ffe45e"}}>Summary</h3>
          <TextDisplayArea value={summary} />
          <button className="btn" style={{ fontSize: 13, marginTop: 2, marginRight:8 }} onClick={() => copyText(summary)}>Copy Summary</button>
        </section>
      )}

      <p style={{fontSize: 13, marginTop: 40, color: "#aaa", opacity: 0.8}}>
        {curTranscriptId && (
          <span>
            AssemblyAI Transcript ID: <code>{curTranscriptId}</code> &nbsp; |<br />
          </span>
        )}
        Powered by AssemblyAI & Gemini AI • <a style={{color: "#9cf"}} href="https://www.assemblyai.com/docs" target="_blank" rel="noopener noreferrer">Learn More</a>
      </p>
    </div>
  );
}

// --- Helper UI Components ---
function ProgressBar({ progress }) {
  return (
    <div style={{ background: "#242424", borderRadius: 6, height: 16, marginTop: 7, marginBottom: 7, width: 230, boxShadow: "0 2px 4px #0002" }}>
      <div style={{
        width: `${Math.round((progress || 0) * 100)}%`,
        background: "linear-gradient(90deg, #4df1b6 50%, #50dbeb 90%)",
        height: "100%",
        borderRadius: 6,
        transition: "width 0.35s"
      }} />
    </div>
  );
}

function TextDisplayArea({ value }) {
  return (
    <pre style={{
      background: "#191919",
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      marginBottom: 7,
      maxWidth: 550,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word"
    }}>{value}</pre>
  );
}

// --- Core Logic Functions ---

// PUBLIC_INTERFACE
async function uploadFileToAssembly(file, apiKey, progressCb) {
  // Upload directly to AssemblyAI /upload endpoint in small chunks for progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ASSEMBLY_UPLOAD_URL, true);
    xhr.setRequestHeader("authorization", apiKey);
    xhr.responseType = "json";
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && progressCb)
        progressCb(evt.loaded / evt.total);
    };
    xhr.onload = () => {
      if (xhr.status === 200 && xhr.response && xhr.response.upload_url) {
        progressCb && progressCb(1);
        resolve(xhr.response.upload_url);
      } else {
        reject(new Error("Upload failed: " + (xhr.response ? JSON.stringify(xhr.response) : `status ${xhr.status}`)));
      }
    };
    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };
    xhr.send(file);
  });
}

// PUBLIC_INTERFACE
async function submitForTranscription(uploadUrl, apiKey) {
  const body = JSON.stringify({
    audio_url: uploadUrl,
    speaker_labels: false,
    language_detection: true,
    auto_highlights: true
  });
  const resp = await fetch(ASSEMBLY_TRANSCRIPT_URL, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/json",
    },
    body
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Transcription submit error: ${err}`);
  }
  const data = await resp.json();
  return data.id;
}

// PUBLIC_INTERFACE
async function pollForTranscript(transcriptId, apiKey, statusCb) {
  let attempts = 0;
  let lastStatus = "--";
  return new Promise((resolve, reject) => {
    async function poll() {
      attempts += 1;
      const resp = await fetch(ASSEMBLY_STATUS_URL(transcriptId), {
        headers: { authorization: apiKey },
      });
      const data = await resp.json();
      lastStatus = data.status;
      if (statusCb) statusCb("Transcription status: " + (data.status || "--"));
      if (data.status === "completed") {
        resolve(data.text);
      } else if (data.status === "failed") {
        reject(new Error("Transcription failed: " + (data.error || "unknown error")));
      } else if (attempts > 120) {
        reject(new Error("Transcription timed out (over 5 minutes)."));
      } else {
        setTimeout(poll, attempts < 10 ? 2300 : 5000); // first fast then slower
      }
    }
    poll();
  });
}

// PUBLIC_INTERFACE
async function summarizeWithGemini(text, apiKey) {
  // call Google's Gemini API (client-side CORS is supported)
  const prompt = [
    {
      role: "user",
      parts: [
        { text: "Summarize the following transcript into key points and a paragraph. Transcript:\n" + text }
      ]
    }
  ];
  const resp = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: prompt })
  });
  if (!resp.ok) {
    throw new Error("Gemini call failed: " + await resp.text());
  }
  const data = await resp.json();
  let output = "";
  if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    output = data.candidates[0].content.parts.map(p => p.text).join("\n");
    return output.trim();
  }
  throw new Error("Gemini response parse error.");
}

// PUBLIC_INTERFACE
function copyText(val) {
  if (!val) return;
  navigator.clipboard.writeText(val);
}

// PUBLIC_INTERFACE
function maskKey(key) {
  if (!key) return "";
  if (key.length < 7) return "******";
  return key.slice(0, 3) + "****" + key.slice(key.length - 3);
}

export default UploadAudio;
