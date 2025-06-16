import React, { useState, useRef } from "react";
import "./AudioPdfTranscription.modern.css";

// API endpoint stubs (replace with actual API endpoints or SDK calls)
const ASSEMBLY_AI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const ASSEMBLY_AI_TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Helper for sleep (fake progress/prototype)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PUBLIC_INTERFACE
export default function AudioPdfTranscription() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "audio" or "pdf"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const fileInputRef = useRef();

  // Handles both audio and PDF file selection
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setSelectedFile(file);
    if (file.type.startsWith("audio")) setFileType("audio");
    else if (file.type === "application/pdf") setFileType("pdf");
    else {
      setError("Please select an audio (mp3, wav, etc) or PDF file.");
      setSelectedFile(null);
      setFileType(null);
    }
    setTranscript("");
    setSummary("");
    setShowResult(false);
  }

  // PUBLIC_INTERFACE
  async function handleUploadAndTranscribe() {
    setError("");
    setUploadProgress(0);
    setIsUploading(true);
    setIsTranscribing(false);
    setTranscript("");
    setSummary("");
    setShowResult(false);

    try {
      let uploadUrl = "";
      let transcriptText = "";

      // Upload file to Assembly AI
      uploadUrl = await uploadToAssemblyAI(selectedFile);

      setIsUploading(false);
      setIsTranscribing(true);
      setUploadProgress(100);

      // Request transcription
      transcriptText = await transcribeWithAssemblyAI(uploadUrl);

      setTranscript(transcriptText);
      setIsTranscribing(false);

      // If it's a PDF, extract text as "transcript" (simulate, real-world would parse here)
      if (fileType === "pdf" && !transcriptText) {
        transcriptText = await pdfToText(selectedFile);
        setTranscript(transcriptText);
      }

      // Analyze/summarize with Gemini
      setIsAnalyzing(true);
      const analysis = await analyzeWithGemini(transcriptText);
      setSummary(analysis);
      setIsAnalyzing(false);
      setShowResult(true);
    } catch (err) {
      setError("Processing failed: " + (err?.message || err?.toString()));
      setIsUploading(false);
      setIsTranscribing(false);
      setIsAnalyzing(false);
    }
  }

  // Simulated PDF -> text function (replace with proper parsing)
  async function pdfToText(file) {
    const fakeText = "[Extracted PDF content for summarization...]";
    await sleep(1200);
    return fakeText;
  }

  // PUBLIC_INTERFACE
  async function uploadToAssemblyAI(file) {
    // Actual AssemblyAI integration would use the API key and chunked upload.
    // This stub simulates progress/UI only.
    let progress = 0;
    setUploadProgress(progress);
    for (let i = 0; i <= 100; i += 20) {
      await sleep(160);
      setUploadProgress(i);
    }
    // Return fake "upload_url"
    return "https://fake.assemblyai/upload/url";
  }

  // PUBLIC_INTERFACE
  async function transcribeWithAssemblyAI(uploadUrl) {
    // Simulates waiting for transcription. In production, poll for job status.
    for (let i = 0; i <= 100; i += 20) {
      await sleep(300);
      setUploadProgress(100);
    }
    // Return fake transcript
    return (
      "This is a simulated transcript of your audio or PDF file. " +
      "Replace this with the actual API response in production."
    );
  }

  // PUBLIC_INTERFACE
  async function analyzeWithGemini(text) {
    // Replace with real Gemini API call for summary and analysis
    await sleep(900);
    return `**Summary:**\n${text.slice(0, 80)}... (summarized)\n\n**Key Points:**\n- Insight 1\n- Insight 2\n\n**Action Items:**\n- Export or copy the results below.`;
  }

  // PUBLIC_INTERFACE
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 1200);
    } catch {
      setCopyStatus("Copy failed");
      setTimeout(() => setCopyStatus(""), 1600);
    }
  };

  // PUBLIC_INTERFACE
  const handleExport = (content, type = "txt") => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const filename = type === "txt" ? "result.txt" : "result.md";
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI rendering
  return (
    <div className="audio-pdf-upload-root">
      <div className="ap-container">
        <h2 className="ap-title">Upload Audio or PDF for AI Transcription & Analysis</h2>
        <p className="ap-desc">
          Select an audio file (MP3/WAV) or PDF document, then transcribe and analyze it using AI.<br />
          <span style={{ color: "var(--text-secondary)" }}>We use AssemblyAI for transcription and Gemini AI for summaries.</span>
        </p>
        <div className="ap-upload-box">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,application/pdf"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            aria-label="File Upload"
          />
          <button
            className="ap-upload-btn"
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading || isTranscribing || isAnalyzing}
            aria-label="Select file for upload"
          >
            {selectedFile ? "Change File" : "Select File"}
          </button>
          <span
            role="status"
            aria-live="polite"
            className="ap-upload-filename"
            style={{
              marginLeft: selectedFile ? 16 : 0,
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {selectedFile ? selectedFile.name : "No file selected"}
          </span>
        </div>
        {(isUploading || isTranscribing || isAnalyzing) && (
          <div className="ap-progress-bar-outer" aria-label="File Processing Progress">
            <div className="ap-progress-bar-inner" style={{ width: `${uploadProgress}%` }} />
            <div className="ap-progress-label">
              {isUploading && "Uploading..."}
              {isTranscribing && !isUploading && "Transcribing..."}
              {isAnalyzing && !isUploading && !isTranscribing && "Analyzing..."}
            </div>
          </div>
        )}
        {error && (
          <div className="ap-error" tabIndex={0} aria-live="assertive">{error}</div>
        )}

        <button
          className="ap-start-btn"
          type="button"
          disabled={
            !selectedFile ||
            !!error ||
            isUploading ||
            isTranscribing ||
            isAnalyzing
          }
          onClick={handleUploadAndTranscribe}
          aria-busy={isUploading || isTranscribing || isAnalyzing}
        >
          {isUploading
            ? "Uploading..."
            : isTranscribing
              ? "Transcribing..."
              : isAnalyzing
                ? "Analyzing..."
                : "Transcribe & Analyze"}
        </button>

        {showResult && (
          <div className="ap-result">
            <h3 className="ap-section-heading">Transcript</h3>
            <pre className="ap-result-box">{transcript}</pre>
            <div className="ap-result-btn-row">
              <button className="ap-copy-btn" onClick={() => handleCopy(transcript)} aria-label="Copy Transcript">Copy</button>
              <button className="ap-export-btn" onClick={() => handleExport(transcript, "txt")} aria-label="Export Transcript">Export TXT</button>
            </div>

            <h3 className="ap-section-heading">Summary & Analysis</h3>
            <pre className="ap-result-box ap-result-markdown">{summary}</pre>
            <div className="ap-result-btn-row">
              <button className="ap-copy-btn" onClick={() => handleCopy(summary)} aria-label="Copy Summary">Copy</button>
              <button className="ap-export-btn" onClick={() => handleExport(summary, "md")} aria-label="Export Analysis">Export Markdown</button>
              {copyStatus && <span className="ap-copy-status">{copyStatus}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
