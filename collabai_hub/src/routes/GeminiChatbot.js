import React, { useState, useRef, useEffect } from "react";

// -- CollabAI Assistant persona/profile
const ASSISTANT_NAME = "Colby, your CollabAI Assistant";
const ASSISTANT_AVATAR = (
  <span
    className="assistant-avatar"
    role="img"
    aria-label="Assistant Avatar"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #151e13 70%, #00FF00 100%)',
      borderRadius: '50%',
      width: 38,
      height: 38,
      boxShadow: "0 0 8px #00FF0060, 0 1px 4px #000a",
      border: "2.5px solid #00FF00",
      fontSize: 21
    }}
  >
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#191e14" />
      <ellipse cx="16" cy="13.5" rx="7" ry="7" fill="#00FF00"/>
      <ellipse cx="13" cy="12.5" rx="1.6" ry="2" fill="#151c13"/>
      <ellipse cx="19" cy="12.5" rx="1.6" ry="2" fill="#151c13"/>
      <rect x="12" y="17" width="8" height="3" rx="1.3" fill="#1a361a"/>
      <ellipse cx="16" cy="19.6" rx="3" ry="1.2" fill="#0f3"/>
    </svg>
  </span>
);

// Returns a formatted timestamp for each message
function formatTime(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- Gemini API Constants: Restrict to current free, non-deprecated chat models ---
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";
const GEMINI_MODEL_LIST_URL = `${GEMINI_BASE_URL}/models`;
const GEMINI_DEFAULT_MODEL = "models/gemini-1.5-flash";
const GEMINI_FALLBACK_MODEL = "models/gemini-2.0-flash";
const GEMINI_ALLOWED_MODELS = [GEMINI_DEFAULT_MODEL, GEMINI_FALLBACK_MODEL];
const GEMINI_API_URL = (model) =>
  `${GEMINI_BASE_URL}/${model}:generateContent`;

// Helper to fetch available Gemini models for API key
async function fetchGeminiModels(apiKey) {
  try {
    const res = await fetch(`${GEMINI_MODEL_LIST_URL}?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.models) ? data.models : [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Picks the allowed free Gemini model:
 * - Prefers 'gemini-1.5-flash'
 * - If not, uses 'gemini-2.0-flash' if supported
 */
async function pickSupportedGeminiModel(apiKey) {
  const models = await fetchGeminiModels(apiKey);

  // Only consider explicitly allowed free models
  const freeModels = models
    .filter((m) => {
      const id = m.name || m.id || "";
      if (!GEMINI_ALLOWED_MODELS.includes(id)) return false;
      if (
        !Array.isArray(m.supportedGenerationMethods) ||
        !m.supportedGenerationMethods.includes("generateContent")
      )
        return false;
      return true;
    });

  // Prioritize 1.5-flash, then 2.0-flash
  const found15 = freeModels.find((m) => (m.name || m.id) === GEMINI_DEFAULT_MODEL);
  if (found15) {
    // If 2.0-flash is also available, allow as fallback
    const has20 = freeModels.find((m) => (m.name || m.id) === GEMINI_FALLBACK_MODEL);
    return {
      selected: GEMINI_DEFAULT_MODEL,
      candidates: has20
        ? [GEMINI_DEFAULT_MODEL, GEMINI_FALLBACK_MODEL]
        : [GEMINI_DEFAULT_MODEL],
      modelList: freeModels,
    };
  }
  const found20 = freeModels.find((m) => (m.name || m.id) === GEMINI_FALLBACK_MODEL);
  if (found20) {
    return {
      selected: GEMINI_FALLBACK_MODEL,
      candidates: [GEMINI_FALLBACK_MODEL],
      modelList: freeModels,
    };
  }
  // Neither available: just return default, UI will error
  return {
    selected: GEMINI_DEFAULT_MODEL,
    candidates: [GEMINI_DEFAULT_MODEL],
    modelList: [],
  };
}

// Loads the Gemini API key from localStorage or (temporarily) from field
function useGeminiApiKey() {
  const [apiKey, setApiKey] = useState(() =>
    localStorage.getItem("GEMINI_API_KEY") || ""
  );
  function saveKey(key) {
    localStorage.setItem("GEMINI_API_KEY", key);
    setApiKey(key);
  }
  function clearKey() {
    localStorage.removeItem("GEMINI_API_KEY");
    setApiKey("");
  }
  return [apiKey, saveKey, clearKey];
}

/**
 * PUBLIC_INTERFACE
 * Modern, professional, CollabAI-branded chatbot UI.
*/
function GeminiChatbot({ repoInfo, style = {} }) {
  // Conversation state
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: `Hello! I’m ${ASSISTANT_NAME} 🤖, here to assist with your project. Ask me anything about this repo (commits, code, etc) and I’ll help using Gemini’s free AI. Tip: Your questions are private & model runs only use included context.`,
      meta: null,
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef();

  // API key logic
  const [apiKey, saveApiKey, clearApiKey] = useGeminiApiKey();
  const [keyEditing, setKeyEditing] = useState(false);
  const [manualKey, setManualKey] = useState("");

  // Model selection state
  const [selectedModel, setSelectedModel] = useState(GEMINI_DEFAULT_MODEL);
  const [modelError, setModelError] = useState("");
  const [modelList, setModelList] = useState([]);
  const [modelDisplay, setModelDisplay] = useState(null);

  // On API key change/set, refresh allowed model list and select best
  useEffect(() => {
    let active = true;
    async function refreshModelList() {
      setModelList([]);
      setModelError("");
      setModelDisplay(null);
      if (!apiKey) return;
      try {
        const { selected, candidates, modelList } = await pickSupportedGeminiModel(apiKey);
        if (active) {
          setSelectedModel(selected);
          setModelList(modelList);
          setModelDisplay(
            modelList.find((m) => (m.name || m.id) === selected)?.displayName || selected
          );
          if (modelList.length === 0) {
            setModelError(
              "No supported Gemini free models ('gemini-1.5-flash' or 'gemini-2.0-flash') found or enabled for your API key."
            );
          }
        }
      } catch (_e) {
        if (active) {
          setModelError("Could not refresh Gemini free model list.");
          setModelList([]);
        }
      }
    }
    refreshModelList();
    return () => { active = false; };
  }, [apiKey]);

  // Construct repo context for Gemini
  function buildContextPrompt() {
    let prompt = `You are an expert AI assistant helping answer questions about the following GitHub repository.
Repository Name: ${repoInfo?.name}
Owner: ${repoInfo?.owner?.login}
Description: ${repoInfo?.description || "No description."}
README (may be truncated):
${repoInfo?.readme ? repoInfo.readme.slice(0, 3500) : "None available."}

Recent Commits:
`;
    if (repoInfo?.recentCommits?.length > 0) {
      prompt += repoInfo.recentCommits
        .slice(0, 8)
        .map(
          (c, idx) =>
            `Commit #${idx + 1}:
Message: ${c.message}
Author: ${c.author}
Date: ${c.date}`
        )
        .join("\n") + "\n";
    }
    prompt +=
      "Respond conversationally and accurately based on this repository context.";
    return prompt;
  }

  // Helper to send Gemini request, only supports the allowed models (no paid/pro/deprecated)
  async function sendGeminiRequest({ prompt, model, apiKey, retryModels = [] }) {
    try {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        let aiText = "";
        if (
          data?.candidates?.[0]?.content?.parts?.[0]?.text
        ) {
          aiText = data.candidates[0].content.parts[0].text.trim();
        } else {
          aiText = "[Sorry, the AI did not return a valid response.]";
        }
        return { success: true, aiText, raw: data };
      } else {
        // Get Gemini error for fallback
        let geminiErr = null;
        try {
          geminiErr = await res.json();
        } catch { }
        // Retry only if allowed model fallback is available
        if (
          geminiErr?.error?.message &&
          retryModels.length > 0 &&
          (
            geminiErr.error.message.includes("does not exist") ||
            geminiErr.error.message.toLowerCase().includes("permission") ||
            geminiErr.error.message.toLowerCase().includes("not authorized")
          )
        ) {
          const nextModel = retryModels.shift();
          return await sendGeminiRequest({ prompt, model: nextModel, apiKey, retryModels });
        }
        throw new Error(
          geminiErr?.error?.message ||
          "Failed to query Gemini API"
        );
      }
    } catch (err) {
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading || !apiKey) return;
    setError(null);
    setLoading(true);
    setModelError("");

    const tsNow = new Date();
    const userMsg = { from: "user", text: input, meta: null, ts: tsNow };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    // Build prompt: repo context + chat history + question
    const contextMsg = buildContextPrompt();
    const chatHistory = messages
      .slice(1) // skip intro message
      .map((msg) =>
        msg.from === "user"
          ? `User: ${msg.text}`
          : `AI: ${msg.text}`
      )
      .concat([`User: ${input}`])
      .join("\n---\n");
    const finalPrompt =
      contextMsg + "\n---\n" + chatHistory + "\n---\nAI:";

    let triedModels = [selectedModel];

    // Limit fallback only to allowed models present
    if (modelList.length > 0) {
      const allowedFallbacks = GEMINI_ALLOWED_MODELS;
      triedModels = allowedFallbacks.filter((m) =>
        modelList.some((mod) => (mod.name || mod.id) === m)
      );
      if (!triedModels.includes(selectedModel)) triedModels.unshift(selectedModel);
      triedModels = Array.from(new Set(triedModels));
      if (triedModels.length === 0)
        triedModels = [selectedModel];
    }

    try {
      const result = await sendGeminiRequest({
        prompt: finalPrompt,
        model: triedModels[0],
        apiKey,
        retryModels: triedModels.slice(1),
      });
      setMessages((msgs) => [
        ...msgs,
        { from: "ai", text: result.aiText, meta: { model: triedModels[0] }, ts: new Date() },
      ]);
      setModelDisplay(triedModels[0]);
    } catch (err) {
      setError(
        err?.message ||
        "Failed to contact Gemini AI. Please check your API key/network or try again."
      );
      setMessages((msgs) => [
        ...msgs,
        {
          from: "ai",
          text: "[Error: Could not contact Gemini AI or received invalid answer.]",
          meta: null,
          ts: new Date(),
        },
      ]);
      if (
        err?.message &&
        (err.message.includes("does not exist") || err.message.toLowerCase().includes("permission"))
      ) {
        setModelError(
          "Your Gemini API key may not have access to the supported free models. Only 'gemini-1.5-flash' and 'gemini-2.0-flash' are supported. Get a free-tier key from Google AI Studio."
        );
      }
    }
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      formRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
      e.preventDefault();
    }
  }

  // API key setup / editor
  if (!apiKey || keyEditing) {
    return (
      <div
        className="dashboard-card fade-in"
        style={{
          marginTop: 18,
          borderLeft: "4px solid #00FF00",
          background: "#181d1a",
          borderRadius: 10,
          boxShadow: "0 0 9px #00FF0049",
          ...style,
        }}
      >
        <div style={{
          fontWeight: 700,
          fontSize: 17,
          color: "var(--accent-neon)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 7
        }}>
          <span role="img" aria-label="Gemini key" style={{ fontSize: 21 }}>🔑</span>
          Gemini API Key Required
        </div>
        <div style={{ color: "#cfffec", fontSize: 15, marginBottom: 7 }}>
          To enable AI Q&amp;A, enter your <b>Gemini API key</b>.<br />
          <span style={{ opacity: 0.82, fontSize: 13.2 }}>
            Get a free API key at{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#00FF00", textDecoration: "underline", fontWeight: 600 }}
            >
              Google AI Studio
            </a>
            .
          </span>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (manualKey.length > 16) {
              saveApiKey(manualKey);
              setManualKey("");
              setKeyEditing(false);
            }
          }}
          style={{ marginTop: 7, display: "flex", gap: 9, alignItems: "center" }}
        >
          <input
            type="password"
            autoFocus
            minLength={16}
            maxLength={128}
            value={manualKey}
            onChange={e => setManualKey(e.target.value)}
            placeholder="Paste Gemini API key…"
            style={{
              flex: 1,
              background: "#191e17",
              border: "1.6px solid #00FF00",
              borderRadius: 8,
              color: "#00FF00",
              fontWeight: 500,
              fontSize: 15.3,
              padding: "9px 14px",
            }}
            aria-label="Gemini API Key"
          />
          <button
            className="btn btn-large"
            style={{
              background: "var(--accent-neon)",
              color: "#0a1213",
              fontWeight: 700,
              border: 0
            }}
            disabled={manualKey.length < 16}
            type="submit"
          >Save</button>
          {apiKey && (
            <button
              className="btn"
              style={{
                color: "#ccffec",
                background: "transparent",
                border: 0,
                marginLeft: 8
              }}
              type="button"
              onClick={() => setKeyEditing(false)}
            >
              Cancel
            </button>
          )}
        </form>
        <div style={{ fontSize: 12.5, marginTop: 8, color: "#b0ffbc" }}>
          Your key is stored locally in your browser.
        </div>
      </div>
    );
  }

  return (
    <div
      className="collabai-assistant-chatbot-panel fade-in"
      style={{
        marginTop: 18,
        marginBottom: 24,
        background: "#12191c",
        borderRadius: 14,
        border: "2px solid var(--accent-neon)",
        maxWidth: 555,
        width: "100%",
        boxShadow: "0 0 16px #00FF0060, 0 2px 20px 0 #202",
        ...style,
      }}
      aria-label={`${ASSISTANT_NAME} Chat Assistant`}
      tabIndex={0}
    >
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "20px 18px 7px 18px",
      }}>
        {ASSISTANT_AVATAR}
        <div>
          <div style={{
            fontWeight: 700,
            color: "var(--accent-neon)",
            fontSize: "1.15rem",
            letterSpacing: ".03em",
            textShadow: "0 0 11px #00FF0040"
          }}>{ASSISTANT_NAME}</div>
          <div style={{
            fontSize: ".94rem",
            color: "#b0ffbc",
            opacity: 0.79,
            lineHeight: 1.23,
            fontWeight: 500
          }}>
            Your AI-powered chat assistant for project collaboration.
          </div>
        </div>
        <button
          className="btn"
          type="button"
          title="Edit Gemini key"
          style={{
            color: "#b0ffbc",
            fontSize: 13,
            marginLeft: "auto",
            padding: "3px 13px",
            border: 0,
            background: "transparent",
            fontWeight: 600
          }}
          onClick={() => setKeyEditing(true)}
          aria-label="Edit Gemini API Key"
        >API Key</button>
      </header>
      {/* Chat conversation bubble area */}
      <section
        className="collabai-chat-window"
        style={{
          background: "#161c1d",
          borderRadius: 11,
          minHeight: 180,
          maxHeight: 340,
          overflowY: "auto",
          margin: "0 12px 0 12px",
          padding: "17px 6px 10px 6px",
          border: "1.4px solid var(--border-color)",
          boxShadow: "0 0 8px #00FF0018",
          fontSize: 15.3,
        }}
        aria-live="polite"
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          {messages.map((msg, idx) => {
            const isAssistant = msg.from === "ai";
            const isUser = msg.from === "user";
            return (
              <div
                key={idx}
                className={`chat-message-row ${isAssistant ? "assistant-msg" : "user-msg"}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: isAssistant ? "flex-start" : "flex-end",
                  marginBottom: 2,
                  marginTop: 0,
                }}
              >
                {/* Avatar (assistant) */}
                {isAssistant && (
                  <div
                    style={{
                      marginRight: 8,
                      alignSelf: "flex-end"
                    }}
                  >
                    {ASSISTANT_AVATAR}
                  </div>
                )}
                <div
                  className="chat-bubble"
                  style={{
                    minWidth: 0,
                    maxWidth: "81vw",
                    width: "max-content",
                    background: isAssistant
                      ? "linear-gradient(135deg, #112211 65%, #00FF0023 100%)"
                      : "linear-gradient(135deg, #15253c 78%, #00FF0014 100%)",
                    color: isAssistant ? "#00FF00" : "#bbe9ff",
                    border: "1.7px solid " + (isAssistant ? "#00FF00" : "#257cffBB"),
                    boxShadow: isAssistant
                      ? "0 0 14px #00FF0065"
                      : "0 0 7px #00cbff55",
                    borderRadius: isAssistant
                      ? "13px 13px 13px 2.8px"
                      : "13px 13px 2.8px 13px",
                    padding: "12px 15px 10px 13px",
                    fontSize: "1.03rem",
                    fontWeight: isAssistant ? 600 : 500,
                    marginLeft: isAssistant ? 0 : "auto",
                    marginRight: isAssistant ? "auto" : 0,
                    position: "relative",
                    letterSpacing: ".01em",
                    wordBreak: "break-word",
                    transition: "background .14s, color .10s",
                    outline: idx === messages.length - 1 && isAssistant
                      ? "1.5px solid #00FF00AA"
                      : "none",
                  }}
                  tabIndex={0}
                  aria-label={isAssistant ? `Message from ${ASSISTANT_NAME}` : "Your message"}
                >
                  <span style={{ whiteSpace: "pre-line" }}>{msg.text}</span>
                  {/* Timestamp */}
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      bottom: 6,
                      fontSize: "0.78em",
                      color: isAssistant ? "#63ffa9a5" : "#a3cce9a1",
                      marginLeft: 7,
                      letterSpacing: ".01em",
                      fontWeight: 400,
                      opacity: 0.69
                    }}
                  >
                    {msg.ts ? formatTime(msg.ts) : ""}
                  </span>
                </div>
                {/* User avatar (optional, placeholder or blank for now) */}
                {isUser && (
                  <div
                    style={{
                      marginLeft: 8,
                      alignSelf: "flex-end",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(125deg,#00FF0034 60%,#142c47 100%)",
                      border: "2px solid #257cffBB",
                      boxShadow: "0 0 8px #00cbff54",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "#bde2ff"
                    }}
                    aria-label="You"
                  >
                    <svg width="18" height="18" fill="#257cffBB" viewBox="0 0 20 20">
                      <circle cx="10" cy="7" r="5" />
                      <ellipse cx="10" cy="16" rx="7.2" ry="4" fill="#257cff40"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                marginBottom: 0,
                gap: 7,
                marginLeft: 0
              }}
              className="assistant-msg"
            >
              {ASSISTANT_AVATAR}
              <div className="chat-bubble"
                style={{
                  background: "linear-gradient(135deg, #112211 67%, #00FF0017 100%)",
                  color: "#00FF00",
                  border: "1.7px solid #00FF00",
                  borderRadius: "13px 13px 13px 2.8px",
                  boxShadow: "0 0 14px #00FF0040",
                  padding: "12px 15px 9px 13px",
                  fontSize: "1.03rem",
                  fontWeight: 600,
                  minWidth: 60,
                  marginTop: 2,
                }}
              >
                Generating answer…
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Input area, visually separated */}
      <form
        ref={formRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "13px 14px 15px 18px",
          background: "#181e24",
          borderRadius: "0 0 11px 11px",
          marginTop: 6,
          borderTop: "1.5px solid var(--border-color)"
        }}
        onSubmit={handleSend}
        autoComplete="off"
        aria-label="Chatbot message input"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Colby about this repo…"
          aria-label="Ask Colby, CollabAI Assistant"
          disabled={loading}
          style={{
            flex: 1,
            border: "2.2px solid var(--accent-neon)",
            borderRadius: "9px",
            padding: "13px 16px",
            fontSize: "1.08em",
            background: "#111a19",
            color: "#00FF00",
            outline: "none",
            boxShadow: "0 0 6px #00FF0025",
            fontWeight: 500
          }}
        />
        <button
          className="btn btn-large"
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{
            background: "var(--accent-neon)",
            color: "#120f19",
            fontWeight: 700,
            border: 0,
            width: 74,
            fontSize: "1.09em",
            borderRadius: "9px",
            alignSelf: "stretch",
            boxShadow: "0 0 11px #00ff009f"
          }}
        >
          Send
        </button>
      </form>
      {error && (
        <div
          style={{
            color: "#ff8984",
            background: "#1a120f",
            padding: "10px 14px",
            border: "1.7px solid #ff4545",
            borderRadius: 7,
            margin: "16px 16px 0px 16px",
            fontSize: 13.2,
            whiteSpace: "pre-line"
          }}
          tabIndex={0}
          role="alert"
        >
          {error} <br />
          <button
            className="btn"
            style={{ color: "#00FF00", fontSize: 14, padding: "4px 9px", border: 0, marginTop: 5, borderRadius: 7 }}
            onClick={() => setKeyEditing(true)}
          >Check API Key</button>
          {apiKey && (
            <button
              className="btn"
              style={{ color: "#ff8984", fontSize: 13, padding: "4px 9px", border: 0, marginLeft: 4, borderRadius: 7 }}
              type="button"
              onClick={clearApiKey}
            >Remove Key</button>
          )}
        </div>
      )}
      <div
        className="chatbot-model-note"
        style={{
          margin: "13px 0 9px 18px",
          fontSize: 12.3,
          color: "#b0ffbc",
          opacity: 0.76
        }}
      >
        <span>
          <b>Answers powered by Gemini API (free models only):</b>{" "}
          <span style={{ color: "#00FF00", fontWeight: 700 }}>gemini-1.5-flash</span>
          {modelList.find((m) => (m.name || m.id) === GEMINI_FALLBACK_MODEL)
            ? <>{" and "}<span style={{ color: "#00FF00", fontWeight: 700 }}>gemini-2.0-flash</span></> : <></>}
          . <br />
          <span>
            Model now:{" "}
            <span style={{ color: "#00FF00", fontWeight: 600, marginLeft: 4 }}>
              {modelDisplay || selectedModel}
            </span>
            {modelList.length > 1 && (
              <span style={{
                color: "#b0ffbc", marginLeft: 8, fontStyle: "italic", opacity: 0.7
              }}>
                (fallback:{" "}
                {modelList
                  .filter(
                    m =>
                      (m.name || m.id) !== (modelDisplay || selectedModel) &&
                      (m.name === GEMINI_FALLBACK_MODEL || m.id === GEMINI_FALLBACK_MODEL)
                  )
                  .map(m => m.displayName || m.name || m.id)
                  .join(", ")})
              </span>
            )}
          </span>
          <br />
          <span style={{ color: "#ff8684", fontWeight: 600 }}>
            Only <strong>'gemini-1.5-flash'</strong> and <strong>'gemini-2.0-flash'</strong> supported for chat.
          </span>
          {modelError && (
            <><br />
              <span style={{ color: "#ff8984", fontWeight: 700 }}>
                [API model access error: {modelError}]
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export default GeminiChatbot;
