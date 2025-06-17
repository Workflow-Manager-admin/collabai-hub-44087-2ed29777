import React, { useState } from "react";

// PUBLIC_INTERFACE
function UploadAudio() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  // PUBLIC_INTERFACE
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setStatus(null);
  };

  // PUBLIC_INTERFACE
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setStatus(null);

    // *** DO NOT CHANGE: Simulate upload logic ***
    try {
      // Demo async imitation of upload
      await new Promise((resolve) => setTimeout(resolve, 1300));
      setStatus("success");
    } catch (err) {
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: 480,
        margin: "60px auto 0 auto",
        background: "#0a0a0f",
        borderRadius: "18px",
        boxShadow: "0 0 30px 8px #00ffd044",
        padding: "40px 32px",
        fontFamily: "'Fira Mono', 'JetBrains Mono', 'Courier New', monospace",
        border: "1.5px solid #00f0ff",
        position: "relative",
        overflow: "hidden",
        minHeight: "500px",
      }}
    >
      <div style={{
        position: "absolute",
        top: -41,
        left: -48,
        width: 180,
        height: 180,
        filter: "blur(36px)",
        background: "radial-gradient(circle at 0 0, #00fff9cc 60%, transparent 95%)",
        zIndex: 0,
        pointerEvents: "none"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: -41,
        right: -48,
        width: 180,
        height: 180,
        filter: "blur(42px)",
        background: "radial-gradient(circle at 100% 100%, #00ff80cc 60%, transparent 95%)",
        zIndex: 0,
        pointerEvents: "none"
      }}></div>
      <header
        style={{
          textAlign: "center",
          marginBottom: 32,
          zIndex: 1,
          position: "relative",
        }}
      >
        <h1
          className="title"
          style={{
            fontSize: "2.44rem",
            color: "#00ffc6",
            fontFamily: "'Fira Mono', 'JetBrains Mono', 'Courier New', monospace",
            textShadow:
              "0 0 8px #00ffd5, 0 0 16px #00ffd5, 0 0 2px #00ffd5, 0 0 1px #0ff",
            letterSpacing: "1px",
            margin: 0
          }}
        >
          <span style={{
            background: "linear-gradient(90deg, #00faad 20%, #00ccff 75%, #0ff 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Upload Audio
          </span>
        </h1>
        <p
          style={{
            marginTop: 14,
            color: "#90ffef",
            opacity: 0.74,
            letterSpacing: 0.5,
            fontFamily: "inherit",
            fontSize: "1.15rem",
            textShadow: "0 0 4px #0ff"
          }}
        >
          <span
            style={{
              background: "rgba(0,255,128,0.07)",
              borderRadius: 4,
              padding: "2px 10px",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Accepted: MP3, WAV, M4A &middot; Max 25MB
          </span>
        </p>
      </header>

      <form
        onSubmit={handleUpload}
        className="upload-form"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          zIndex: 1,
          position: "relative",
        }}
        autoComplete="off"
      >
        <label
          htmlFor="audioInput"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              color: "#18ffe0",
              fontWeight: 600,
              fontSize: "1.08rem",
              textShadow: "0 0 8px #00ffeb",
              fontFamily: "inherit",
              marginBottom: 7
            }}
          >
            Select your audio file
          </span>
          <input
            type="file"
            id="audioInput"
            style={{
              display: "none",
            }}
            accept=".mp3,.wav,.m4a"
            onChange={handleFileChange}
          />
          <span
            style={{
              marginTop: 8,
              minHeight: 18,
              fontSize: "1.04rem",
              color: selectedFile ? "#38ffe6" : "#444",
              textShadow: selectedFile
                ? "0 0 7px #25ffb9"
                : "0 0 4px #013d37",
              letterSpacing: 1.1,
              fontFamily: "inherit",
              transition: "color 0.2s",
              borderBottom: selectedFile ? "1px solid #26eed6" : "1px solid #333",
              padding: "1px 6px"
            }}
          >
            {selectedFile ? selectedFile.name : "No file chosen."}
          </span>
          <span
            className="btn"
            style={{
              display: "inline-block",
              marginTop: 18,
              padding: "11px 38px",
              fontSize: "1.1rem",
              borderRadius: "9px",
              fontFamily: "inherit",
              background:
                "linear-gradient(92deg, #021d1b 60%, #063e36 100%)",
              color: "#36f7d6",
              border: "2px solid #25ffd9",
              boxShadow: "0 0 18px #00ffd7, 0 0 6px #25ffd988;",
              cursor: "pointer",
              fontWeight: 600,
              transition:
                "background 0.19s, box-shadow 0.18s, transform 0.14s",
              filter: "drop-shadow(0 0 6px #21c1d5cc)",
              textShadow: "0 0 8px #38dac9, 0 0 6px #11c8a3",
              outline: "none"
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("audioInput").click();
            }}
            tabIndex={-1}
          >
            Choose File
          </span>
        </label>

        <button
          className="btn"
          type="submit"
          disabled={!selectedFile || uploading}
          style={{
            margin: "0 auto",
            padding: "13px 58px",
            fontFamily: "inherit",
            borderRadius: 10,
            background:
              uploading
                ? "linear-gradient(90deg, #181823 60%, #024b38 100%)"
                : "linear-gradient(90deg, #021d1b 60%, #063e36 100%)",
            color: uploading ? "#21e5b0" : "#00ffc7",
            border: "2.5px solid #00ffd7",
            boxShadow: uploading
              ? "0 0 14px #018e75, 0 0 2px #13a396"
              : "0 0 25px #00ffd7, 0 0 7px #38dac9",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.74 : 1,
            fontWeight: 700,
            fontSize: "1.17rem",
            letterSpacing: "1.6px",
            textShadow:
              "0 0 8px #14f5cf, 0 0 4px #0f0, 0 0 2px #17f8b8",
            transition:
              "background 0.15s, box-shadow 0.18s, transform 0.14s, color 0.11s"
          }}
        >
          {uploading ? (
            <span>
              <span className="neon-flicker" style={{
                color: "#0ff",
                filter: "drop-shadow(0 0 40px #00ffd4)",
                position: "relative",
                fontFamily: "inherit"
              }}>
                Uploading...
              </span>
            </span>
          ) : (
            <span>Upload</span>
          )}
        </button>
      </form>

      {status === "success" && (
        <div
          className="success-msg"
          style={{
            margin: "30px auto 0",
            padding: "19px 18px 12px 18px",
            borderRadius: 7,
            background:
              "linear-gradient(95deg, #013228 47%, #091d1c 100%)",
            color: "#00ffd1",
            fontWeight: 600,
            fontFamily: "inherit",
            boxShadow: "0 0 8px #13ffef60, 0 0 11px #00ffd624",
            textShadow: "0 0 8px #13ffef, 0 0 12px #1affcd",
            fontSize: "1.18rem",
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          <span style={{
            marginRight: 6,
            fontWeight: 700,
            filter: "drop-shadow(0 0 7px #0ff)",
            fontFamily: "inherit"
          }}>✓</span>
          File uploaded! (Simulated)
        </div>
      )}
      {status === "error" && (
        <div
          className="error-msg"
          style={{
            margin: "30px auto 0",
            padding: "15px 14px 8px 14px",
            borderRadius: 6,
            background:
              "linear-gradient(96deg, #310012 50%, #0a0a0f 100%)",
            color: "#f85996",
            fontWeight: 600,
            fontFamily: "inherit",
            boxShadow: "0 0 8px #e5276433, 0 0 13px #ba00479c",
            textShadow: "0 0 2px #fa378e, 0 0 12px #670028",
            fontSize: "1.13rem",
            textAlign: "center",
            maxWidth: 220,
          }}
        >
          <span style={{
            marginRight: 5,
            fontWeight: 700,
            filter: "drop-shadow(0 0 5px #f04)",
            fontFamily: "inherit"
          }}>✕</span>
          Error uploading. Try again.
        </div>
      )}
    </div>
  );
}

export default UploadAudio;
