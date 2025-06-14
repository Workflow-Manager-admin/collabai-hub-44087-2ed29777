import React from "react";

// PUBLIC_INTERFACE
/** 
 * Audio Transcription & Summarization Stub Page
 * - Upload audio
 * - Transcribe with Assembly AI
 * - Summarize with Gemini AI
 */
function Transcription() {
  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <h2 className="title">Audio Transcription &amp; Summarization</h2>
      <div className="description">
        <ul style={{ marginLeft: 20 }}>
          <li><strong>Audio Upload:</strong> File drop/select, in-progress uploads (TBD)</li>
          <li><strong>Transcription:</strong> Integration with Assembly AI (TBD)</li>
          <li><strong>Summarization:</strong> Summarize transcript using Gemini AI (TBD)</li>
        </ul>
        <div style={{ marginTop: 32, opacity: 0.6 }}>Feature page under construction</div>
      </div>
    </div>
  );
}

export default Transcription;
