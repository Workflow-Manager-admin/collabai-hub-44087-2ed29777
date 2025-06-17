import React from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0d0d0d",
        color: "#00ff9f",
        padding: "30px 0",
        textAlign: "center",
        borderTop: "1px solid #00ff9f33",
        fontFamily: "monospace",
        marginTop: 60
      }}
    >
      <div style={{ marginBottom: 14 }}>
  <a
    href="https://github.com/Cyb3rHash"
    target="_blank"
    rel="noreferrer"
    style={iconStyle}
  >
    <FaGithub />
  </a>
  <a
    href="https://www.instagram.com/liberosist_007/"
    target="_blank"
    rel="noreferrer"
    style={iconStyle}
  >
    <FaInstagram />
  </a>
  <a
    href="https://www.linkedin.com/in/harish-v-500249360"
    target="_blank"
    rel="noreferrer"
    style={iconStyle}
  >
    <FaLinkedin />
  </a>
  <a
    href="https://x.com/Cyber__Hash"
    target="_blank"
    rel="noreferrer"
    style={iconStyle}
  >
    <FaXTwitter />
  </a>
</div>
<div style={{ fontSize: 13, opacity: 0.75 }}>
  Built by <span style={{ color: "#00ffcc", fontWeight: "bold" }}>CyberHash</span> ⚡ Powered by{" "}
  <span style={{ color: "#39ff14", fontWeight: "bold" }}>Kavia AI</span>
</div>

    </footer>
  );
}

const iconStyle = {
  color: "#00ff9f",
  margin: "0 12px",
  fontSize: 24,
  transition: "transform 0.2s, color 0.2s",
  textDecoration: "none",
  display: "inline-block"
};

export default Footer;
