import React from "react";

// PUBLIC_INTERFACE
function UploadAudio() {
  /** Audio upload & transcription placeholder page */
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <header style={{ marginBottom: 20 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>Audio Upload &amp; Transcription</h2>
        <p className="description">
          Use this page to upload voice notes, meetings, or any audio content for instant transcription and analysis.<br /><br />
          <strong>Key areas:</strong> audio upload control, progress bar/status, transcription result display.<br />
          <strong>User flow:</strong> Select/upload an audio file, wait for processing to complete, and copy or use the generated transcript as needed.
        </p>
      </header>
      <div className="description">Upload audio and transcribe using Assembly AI.</div>
    </div>
  );
}

export default UploadAudio;
