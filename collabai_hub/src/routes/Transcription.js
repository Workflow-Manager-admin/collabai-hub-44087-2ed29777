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
      <header style={{ marginBottom: 24 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>Audio Transcription &amp; Summarization</h2>
        <p className="description">
          This page allows users to quickly transcribe meeting notes or voice recordings and generate AI summaries using Gemini AI and Assembly AI.<br /><br />
          <strong>Key Sections:</strong> audio upload area, in-progress transcription lists, and summary displays.<br />
          <strong>User flow:</strong> Drag and drop or select audio files, monitor live transcription progress, and then review or export the AI-generated summary for easy sharing.
        </p>
      </header>
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
