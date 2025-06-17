import React, { useState } from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function Footer() {
  const [hovered, setHovered] = useState(null);

  const icons = [
    {
      id: "github",
      href: "https://github.com/Cyb3rHash",
      icon: <FaGithub />,
      color: "#6e5494",
    },
    {
      id: "instagram",
      href: "https://www.instagram.com/liberosist_007/",
      icon: <FaInstagram />,
      color: "#e1306c",
    },
    {
      id: "linkedin",
      href: "https://www.linkedin.com/in/harish-v-500249360",
      icon: <FaLinkedin />,
      color: "#0077b5",
    },
    {
      id: "twitter",
      href: "https://x.com/Cyber__Hash",
      icon: <FaXTwitter />,
      color: "#1DA1F2",
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: "#0d0d0d",
        color: "#00ff9f",
        padding: "30px 0",
        textAlign: "center",
        borderTop: "1px solid #00ff9f33",
        fontFamily: "monospace",
        marginTop: 60,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        {icons.map(({ id, href, icon, color }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              color: hovered === id ? color : "#00ff9f",
              margin: "0 12px",
              fontSize: 24,
              transition: "transform 0.2s, color 0.2s",
              textDecoration: "none",
              display: "inline-block",
              transform: hovered === id ? "scale(1.2)" : "scale(1)",
            }}
          >
            {icon}
          </a>
        ))}
      </div>
      <div style={{ fontSize: 13, opacity: 0.75 }}>
        Built by{" "}
        <span style={{ color: "#00ffcc", fontWeight: "bold" }}>CyberHash</span>{" "}
        ⚡ Powered by{" "}
        <span style={{ color: "#39ff14", fontWeight: "bold" }}>Kavia AI</span>
      </div>
    </footer>
  );
}

export default Footer;
