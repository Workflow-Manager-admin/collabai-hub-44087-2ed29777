import React from "react";

const glitchStyle = {
  position: "relative",
  color: "#00ff9f",
  fontSize: "3rem",
  fontWeight: "bold",
  letterSpacing: 2,
  textAlign: "center",
  textShadow: "0 0 4px #00ff9f88",
  animation: "glitch 1.5s infinite"
};

const NotFound = () => {
  return (
    <div style={{
      background: "#000",
      color: "#00ff9f",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "monospace",
      textAlign: "center",
      padding: "0 24px"
    }}>
      <h1 style={glitchStyle} className="glitch">404 - Not Found</h1>
      <p style={{ color: "#88ffcc", fontSize: "1rem", marginTop: 16 }}>
        The page you were looking for does not exist or has been abducted by aliens.
      </p>
      <p style={{ color: "#55ffaa88", fontSize: "0.9rem", marginTop: 8 }}>
        <a href="/" style={{ color: "#00ff9f", textDecoration: "underline" }}>Return to Homepage</a>
      </p>

      {/* Glitch keyframes */}
      <style>{`
        @keyframes glitch {
          0% {
            text-shadow: 2px 0 #00ff9f, -2px 0 #0f0, 0 0 6px #00ff9f88;
          }
          20% {
            text-shadow: -2px -2px #0f0, 2px 2px #00ff9f, 0 0 6px #00ff9f;
          }
          40% {
            text-shadow: 2px 2px #00ff9f, -2px -2px #0f0;
          }
          60% {
            text-shadow: -2px 2px #0f0, 2px -2px #00ff9f;
          }
          80% {
            text-shadow: 2px 0 #0f0, -2px 0 #00ff9f;
          }
          100% {
            text-shadow: 2px 0 #00ff9f, -2px 0 #0f0;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
