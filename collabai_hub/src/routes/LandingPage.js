import React from "react";

// PUBLIC_INTERFACE
/**
 * CollabAI Hub LandingPage
 * Visually impressive home page shown after login; features neon branding, platform summary,
 * feature highlights, and a "How it Works"/Getting Started guided section.
 * Modern minimal dark design, neon accents.
 */
function LandingPage() {
  // Neon SVG decorative glow line
  const neonBar = (
    <svg width="110" height="10" viewBox="0 0 110 10" style={{display: "block"}} aria-hidden>
      <defs>
        <linearGradient id="neonBarGrad" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#00FF00" stopOpacity="1" offset="0%" />
          <stop stopColor="#00FF0040" stopOpacity="0.5" offset="100%" />
        </linearGradient>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="4" width="110" height="3" rx="1.6" fill="url(#neonBarGrad)" filter="url(#neonGlow)" />
    </svg>
  );

  // Feature highlight cards
  const features = [
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden style={{filter:'drop-shadow(0 0 7px #00FF0040)'}}>
          <circle cx="14" cy="14" r="13.3" fill="#101815" stroke="#00FF00" strokeWidth="2" />
          <path d="M8.2 14.6C8.55 17.53 10.82 19 14 19s5.45-1.47 5.8-4.4C19.81 15.228 18.057 16 14 16s-5.81-.772-5.8-1.4Z" fill="#00FF0055"/>
          <circle cx="14" cy="11.8" r="2.8" fill="#00FF00"/>
        </svg>
      ),
      title: "User Authentication",
      desc: "Secure sign-in with Clerk, ensuring safe access with single sign-on support."
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden style={{filter:'drop-shadow(0 0 7px #00FF0040)'}}>
          <rect x="3" y="5" width="22" height="18" rx="4" fill="#101815" stroke="#00FF00" strokeWidth="2"/>
          <path d="M12 11h4v2h-4z" fill="#00FF0055"/><rect x="10" y="15" width="8" height="2" rx="1" fill="#00FF00"/>
        </svg>
      ),
      title: "GitHub Integration",
      desc: "Connect repositories, fetch commits, and use AI-powered Q&A for code exploration."
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden style={{filter:'drop-shadow(0 0 7px #00ff00a0)'}}>
          <circle cx="14" cy="14" r="12" fill="#101815" stroke="#00FF00" strokeWidth="2"/>
          <ellipse cx="14" cy="14" rx="6" ry="4" fill="#00FF00" style={{opacity:0.18}}/>
          <rect x="11" y="5" width="6" height="13" rx="3" fill="#00FF0078"/>
          <rect x="15" y="16" width="5" height="8" rx="2.5" fill="#00FF005a"/>
        </svg>
      ),
      title: "Audio Transcription & Summarization",
      desc: "Upload audio, transcribe meetings, and get summaries via Assembly AI & Gemini."
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden style={{filter:'drop-shadow(0 0 8px #00FF0044)'}}>
          <circle cx="14" cy="14" r="12" fill="#101815" stroke="#00FF00" strokeWidth="2"/>
          <path d="M8.5,18 Q12,14 19.5,19" stroke="#00FF00" strokeWidth="1.5" fill="none"/>
          <ellipse cx="10" cy="11" rx="2.2" ry="2.5" fill="#00FF00"/><ellipse cx="18" cy="13" rx="2.2" ry="2.5" fill="#00FF00"/>
        </svg>
      ),
      title: "Team Collaboration",
      desc: "Invite users, manage shared projects, exchange feedback—AI-powered teamwork."
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" aria-hidden style={{filter:'drop-shadow(0 0 8px #00ff0070)'}}>
          <circle cx="14" cy="14" r="12" fill="#101815" stroke="#00FF00" strokeWidth="2"/>
          <rect x="11" y="8" width="6" height="12" rx="3" fill="#00FF0090"/>
          <rect x="7" y="18" width="14" height="3" rx="1.2" fill="#00FF00"/>
        </svg>
      ),
      title: "Pricing & Credits System",
      desc: "Transparent credit usage & flexible upgrades—manage credits with ease."
    }
  ];

  // How it Works steps
  const steps = [
    {
      icon: <span style={{fontSize:22, color:"#00FF00"}}>1️⃣</span>,
      title: "Sign Up / Login",
      desc: "Register or log in securely with Clerk. Your data is protected at every step."
    },
    {
      icon: <span style={{fontSize:22, color:"#00FF00"}}>2️⃣</span>,
      title: "Connect GitHub & Projects",
      desc: "Link your GitHub, view your repositories, and add projects for collaboration."
    },
    {
      icon: <span style={{fontSize:22, color:"#00FF00"}}>3️⃣</span>,
      title: "Transcribe & Summarize",
      desc: "Upload audio to transcribe meetings, generate AI-powered summaries for quick review."
    },
    {
      icon: <span style={{fontSize:22, color:"#00FF00"}}>4️⃣</span>,
      title: "Collaborate & Grow",
      desc: "Invite teammates, assign tasks, discuss code, and track credits and billing."
    }
  ];

  return (
    <div className="container fade-in" style={{ paddingTop: 122, paddingBottom: 48, minHeight: "80vh" }}>
      {/* Hero / Branding Section */}
      <section style={{ border: 0, background: "none", marginBottom: 0, padding: 0, textAlign: "center" }}>
        <span style={{
          color: "var(--accent-neon)",
          fontWeight: 700,
          fontSize: "1.18rem",
          letterSpacing: ".04em",
          textShadow: "0 0 8px #00FF0045"
        }} className="subtitle">
          Welcome to
        </span>
        <div className="title" style={{
          marginTop: 3,
          fontSize: "2.6rem",
          fontWeight: "700",
          color: "#ffffff",
          letterSpacing: "-0.03em",
          lineHeight: 1.12,
          textShadow: "0 0 19px #00ff0025"
        }}>
          <span className="logo-symbol" style={{
            color: "#00FF00",
            fontSize: "2rem",
            filter: "drop-shadow(0 0 7px #00FF0085)",
            marginRight: 3,
            verticalAlign: "middle"
          }}>*</span>
          CollabAI Hub
        </div>
        {neonBar}
        <div className="description" style={{
          margin: "13px auto 2px auto",
          color: "#b0ffbc",
          fontWeight: 500,
          fontSize: "1.17rem",
          letterSpacing: ".001em",
          maxWidth: 650
        }}>
          All-in-one AI-powered platform for seamless project collaboration, code management, audio transcription, and team workflows—integrated natively with GitHub, Clerk, Assembly AI, and Gemini.
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        margin: "44px auto 26px auto",
        background: "#1a201d",
        borderLeft: "3.5px solid #00FF00",
        padding: "20px 22px 15px 22px",
        borderRadius: 12,
        boxShadow: "0 0 30px #00FF0024",
        maxWidth: 900
      }}>
        <div style={{
          fontWeight: 650,
          fontSize: "1.24rem",
          color: "var(--accent-neon)",
          marginBottom: 18,
          letterSpacing: ".035em",
          textShadow: "0 0 7px #00FF0040"
        }}>
          Main Features
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "23px 20px",
          justifyContent: "space-between",
          alignItems: "stretch"
        }}>
          {features.map((f,i) => (
            <div key={i} style={{
              flex: "1 0 220px",
              minWidth: 210,
              maxWidth: 320,
              background: "#132117",
              border: "1.6px solid #00FF002c",
              borderRadius: 10,
              padding: "17px 14px 13px 14px",
              margin: "0 0 8px 0",
              boxShadow: "0 0 11px #00FF0032",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 13
            }}>
              <div style={{
                border: "2.2px solid #00FF00",
                borderRadius: 9,
                background: "#081007",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 43,
                height: 43,
                marginRight: 8,
                boxShadow: "0 0 6px #00FF0035",
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{
                  color: "#00FF00",
                  fontWeight: 700,
                  fontSize: "1.09rem",
                  letterSpacing: ".023em",
                  textShadow: "0 0 7px #00FF0035"
                }}>{f.title}</div>
                <div style={{
                  color: "#b0ffbc",
                  fontSize: "0.97rem",
                  fontWeight: 500,
                  opacity: 0.87
                }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / Getting Started Section */}
      <section style={{
        background: "#151a14",
        borderLeft: "3.5px solid #00FF00",
        padding: "22px 20px 20px 20px",
        borderRadius: 12,
        maxWidth: 870,
        margin: "36px auto 0 auto",
        boxShadow: "0 0 20px #00FF0012"
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: "1.18rem",
          color: "#00FF00",
          marginBottom: 5,
          letterSpacing: ".03em",
          textShadow: "0 0 7px #00FF0042"
        }}>
          How It Works
        </div>
        <div className="description" style={{
          color: "#ccffec",
          marginBottom: 18,
          fontWeight: 500,
          fontSize: "1.07rem"
        }}>
          Get started in a few simple steps—empowering you with seamless, AI-driven project collaboration:
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 0",
          justifyContent: "space-between"
        }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{
              flex: "1 0 190px",
              minWidth: 190,
              maxWidth: 252,
              margin: "6px 10px 8px 0",
              background: "#191f1a",
              border: "1.5px solid #00FF0019",
              borderRadius: 8,
              padding: "12px 16px 12px 16px",
              display: "flex",
              alignItems: "flex-start",
              boxShadow: "0 0 7px #00FF0025"
            }}>
              <div style={{ marginRight: 12 }}>{step.icon}</div>
              <div>
                <div style={{
                  color: "#00FF00",
                  fontWeight: 700,
                  fontSize: "1.045rem"
                }}>{step.title}</div>
                <div style={{
                  color: "#b0ffbc",
                  fontSize: "0.98rem",
                  opacity: 0.82,
                  fontWeight: 500
                }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign: "right", marginTop: 12, opacity: 0.59, color: "#00FF00", fontSize: 12.7}}>
          Need help? See <a href="/auth" style={{color:"#00FF00", textDecoration:"underline"}}>Auth</a>, <a href="/projects" style={{color:"#00FF00", textDecoration:"underline"}}>Projects</a>, or <a href="/dashboard" style={{color:"#00FF00", textDecoration:"underline"}}>Dashboard</a>.
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
