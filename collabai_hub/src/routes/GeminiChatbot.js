import React, { useState, useRef, useEffect } from "react";

/**
 * Gemini AI Chatbot for per-repo Q&A.
 * Uses Gemini free API for contextual AI discussion about the current repository.
 * 
 * Props:
 *   repoInfo: {
 *     name: string,
 *     owner: { login: string },
 *     description: string,
 *     readme: string,
 *     recentCommits: array [{ message, author, date }]
 *   }
 */

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

// PUBLIC_INTERFACE
function GeminiChatbot({ repoInfo, style = {} }) {
  // Conversation state
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! 👋 I’m Gemini, your project AI—ready to answer questions about this repository (code, commits, usage, and more). Only free AI models (gemini-1.5-flash, or 2.0-flash if available) are supported.",
      meta: null,
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

    const userMsg = { from: "user", text: input, meta: null };
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
        { from: "ai", text: result.aiText, meta: { model: triedModels[0] } },
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
      className="dashboard-card fade-in"
      style={{
        marginTop: 18,
        borderLeft: "4px solid #00FF00",
        background: "#151c17",
        borderRadius: 10,
        boxShadow: "0 0 8px #00FF0045",
        ...style,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 19,
          color: "var(--accent-neon)",
          marginBottom: 7,
          letterSpacing: ".03em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span role="img" aria-label="Gemini" style={{ fontSize: 22 }}>
          💬
        </span>
        Ask Gemini (AI Chatbot about this repo)
        <button
          className="btn"
          type="button"
          title="Edit Gemini key"
          style={{
            color: "#b0ffbc",
            fontSize: 13,
            marginLeft: "auto",
            padding: "2px 7px",
            border: 0,
            background: "transparent"
          }}
          onClick={() => setKeyEditing(true)}
        >API Key</button>
      </div>
      <div
        style={{
          height: 220,
          maxHeight: 280,
          background: "#182017",
          borderRadius: 8,
          overflowY: "auto",
          marginBottom: 8,
          padding: "7px 9px 9px 7px",
          border: "1.3px solid var(--border-color)",
          fontSize: 15.1,
          boxShadow: "0 0 6px #00FF0022",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              padding: "6px 0",
              color: msg.from === "user" ? "#b5ffea" : "#00FF00",
              textAlign: msg.from === "user" ? "right" : "left",
              fontWeight: msg.from === "ai" ? 600 : 500,
              letterSpacing: ".01em",
              fontSize: msg.from === "ai" ? 15 : 14.9,
              marginBottom: 5,
              opacity: msg.from === "ai" ? 1 : 0.95,
              whiteSpace: "pre-line"
            }}
          >
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && (
          <div
            style={{
              color: "#00FF00",
              fontWeight: 700,
              padding: "6px 0",
              fontSize: 15,
            }}
          >
            Generating answer…
          </div>
        )}
      </div>
      <form
        ref={formRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 7,
        }}
        onSubmit={handleSend}
        autoComplete="off"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this repo…"
          aria-label="Ask Gemini"
          disabled={loading}
          style={{
            flex: 1,
            border: "1.8px solid #00FF00",
            borderRadius: 7,
            padding: "9px 12px",
            fontSize: 15.3,
            background: "#121c19",
            color: "#00FF00",
            outline: "none",
          }}
        />
        <button
          className="btn btn-large"
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: "var(--accent-neon)",
            color: "#0a1213",
            fontWeight: 700,
            border: 0,
            width: 77,
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
            padding: "7px 9px",
            border: "1px solid #ff4545",
            borderRadius: 6,
            marginTop: 7,
            fontSize: 13,
            whiteSpace: "pre-line"
          }}
        >
          {error} <br />
          <button
            className="btn"
            style={{ color: "#00FF00", fontSize: 14, padding: "4px 9px", border: 0, marginTop: 5 }}
            onClick={() => setKeyEditing(true)}
          >Check API Key</button>
          {apiKey && (
            <button
              className="btn"
              style={{ color: "#ff8984", fontSize: 13, padding: "4px 9px", border: 0, marginLeft: 4 }}
              type="button"
              onClick={clearApiKey}
            >Remove Key</button>
          )}
        </div>
      )}
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "#b0ffbc",
          opacity: 0.76,
        }}
      >
        <span>
          <b>AI answers use only free Gemini models:</b>{" "}
          <span style={{ color: "#00FF00", fontWeight: 700 }}>gemini-1.5-flash</span>
          {modelList.find((m) => (m.name || m.id) === GEMINI_FALLBACK_MODEL)
            ? <>{" and "}<span style={{ color: "#00FF00", fontWeight: 700 }}>gemini-2.0-flash</span></> : <></>}
          . <br />
          <span>
            Current model:{" "}
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
            Only <strong>'gemini-1.5-flash'</strong> and <strong>'gemini-2.0-flash'</strong> are supported for chat. Paid, pro, vision, and other models are not available.
          </span>
          {modelError && (
            <><br />
              <span style={{ color: "#ff8984", fontWeight: 700 }}>
                [API model access error: {modelError}]
              </span>
            </>
          )}
          <br />
          <a
            href="https://ai.google.dev/docs/models/gemini"
            style={{ color: "#00FF00", textDecoration: "underline" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini API models info
          </a>
        </span>
      </div>
    </div>
  );
}

export default GeminiChatbot;
