import { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const API_BASE = "http://localhost:8000";

// ── Animations ──────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`to{transform:rotate(360deg)}`;

// ── Layout ───────────────────────────────────────────────────
const Shell = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  gap: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h1 { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; }
  span { color: var(--accent); }
`;

const LogoIcon = styled.div`
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-radius: 8px;
  display: grid; place-items: center;
  font-size: 1.1rem;
`;

const SectionLabel = styled.p`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
`;

const RepoInput = styled.input`
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text);
  font-family: var(--font-code);
  font-size: 0.75rem;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: var(--accent2); }
  &::placeholder { color: var(--muted); }
`;

const LoadBtn = styled.button`
  width: 100%;
  background: ${p => p.loading ? "transparent" : "linear-gradient(135deg, var(--accent), var(--accent2))"};
  border: ${p => p.loading ? "1px solid var(--border)" : "none"};
  color: ${p => p.loading ? "var(--muted)" : "#0a0d12"};
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  cursor: ${p => p.loading ? "not-allowed" : "pointer"};
  margin-top: 8px;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
`;

const Spinner = styled.div`
  width: 14px; height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const StatusBadge = styled.div`
  font-size: 0.72rem;
  font-family: var(--font-code);
  color: ${p => p.ok ? "var(--accent)" : "var(--muted)"};
  background: ${p => p.ok ? "rgba(79,255,176,0.08)" : "rgba(100,116,139,0.08)"};
  border: 1px solid ${p => p.ok ? "rgba(79,255,176,0.2)" : "var(--border)"};
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`;

const SuggestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
`;

const SuggestionBtn = styled.button`
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 0.75rem;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  &:hover {
    border-color: var(--accent2);
    background: rgba(79,159,255,0.06);
  }
`;

// ── Chat area ────────────────────────────────────────────────
const ChatArea = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ChatHeader = styled.div`
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--muted);
  font-family: var(--font-code);
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EmptyState = styled.div`
  margin: auto;
  text-align: center;
  animation: ${fadeUp} 0.6s ease both;
  h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
  p { color: var(--muted); font-size: 0.9rem; }
  .highlight { color: var(--accent); }
`;

const Bubble = styled.div`
  max-width: 780px;
  animation: ${fadeUp} 0.3s ease both;
  align-self: ${p => p.role === "user" ? "flex-end" : "flex-start"};
`;

const BubbleHeader = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.role === "user" ? "var(--accent2)" : "var(--accent)"};
  margin-bottom: 6px;
`;

const BubbleBody = styled.div`
  background: ${p => p.role === "user" ? "rgba(79,159,255,0.08)" : "var(--surface)"};
  border: 1px solid ${p => p.role === "user" ? "rgba(79,159,255,0.2)" : "var(--border)"};
  border-radius: ${p => p.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
  padding: 14px 18px;
  font-size: 0.88rem;
  line-height: 1.7;
  white-space: pre-wrap;
  font-family: ${p => p.role === "assistant" ? "var(--font-ui)" : "var(--font-code)"};
`;

const SourceTags = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
`;

const SourceTag = styled.span`
  font-family: var(--font-code);
  font-size: 0.65rem;
  background: rgba(79,255,176,0.07);
  border: 1px solid rgba(79,255,176,0.15);
  color: var(--accent);
  border-radius: 4px;
  padding: 2px 7px;
`;

const ThinkingDots = styled.div`
  display: flex; gap: 4px; align-items: center; padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px 16px 16px 4px;
  width: fit-content;
  span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--muted);
    animation: ${pulse} 1.2s ease infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

// ── Input bar ────────────────────────────────────────────────
const InputBar = styled.div`
  padding: 16px 28px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
`;

const QueryInput = styled.textarea`
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 0.88rem;
  resize: none;
  height: 52px;
  max-height: 160px;
  outline: none;
  transition: border-color 0.2s;
  line-height: 1.5;
  &:focus { border-color: var(--accent2); }
  &::placeholder { color: var(--muted); }
`;

const SendBtn = styled.button`
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border: none;
  border-radius: 12px;
  color: #0a0d12;
  font-size: 1.2rem;
  width: 52px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

// ── Suggestions ──────────────────────────────────────────────
const SUGGESTIONS = [
  "What does this project do?",
  "Explain the main entry point",
  "List all API endpoints",
  "What libraries are used?",
  "How is the database connected?",
  "What are the main classes/modules?",
  "Explain the authentication flow",
];

// ── Component ────────────────────────────────────────────────
export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoStatus, setRepoStatus] = useState(null); // {name, files} | null
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleLoadRepo = async () => {
    if (!repoUrl.trim()) return;
    setLoadingRepo(true);
    setError("");
    setRepoStatus(null);
    setMessages([]);
    try {
      const res = await fetch(`${API_BASE}/load-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: repoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load repo");
      setRepoStatus({ name: data.repo_name, files: data.files_processed });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingRepo(false);
    }
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || thinking || !repoStatus) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: question }]);
    setThinking(true);
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query failed");
      setMessages(m => [...m, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: `Error: ${e.message}`, sources: [] }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <Shell>
      {/* ── Sidebar ── */}
      <Sidebar>
        <Logo>
          <LogoIcon>⬡</LogoIcon>
          <h1>Repo<span>Guide</span></h1>
        </Logo>

        <div>
          <SectionLabel>GitHub Repository</SectionLabel>
          <RepoInput
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLoadRepo()}
          />
          <LoadBtn loading={loadingRepo} onClick={handleLoadRepo} disabled={loadingRepo}>
            {loadingRepo ? <><Spinner /> Cloning…</> : "▶ Load Repository"}
          </LoadBtn>
          {error && <StatusBadge style={{ marginTop: 10, color: "var(--error)", borderColor: "rgba(255,79,107,0.2)", background: "rgba(255,79,107,0.06)" }}>⚠ {error}</StatusBadge>}
          {repoStatus && (
            <StatusBadge ok style={{ marginTop: 10 }}>
              ✓ {repoStatus.name}<br />
              {repoStatus.files} files indexed
            </StatusBadge>
          )}
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <SectionLabel>Quick Questions</SectionLabel>
          <SuggestionList>
            {SUGGESTIONS.map(s => (
              <SuggestionBtn key={s} onClick={() => sendMessage(s)} disabled={!repoStatus}>
                {s}
              </SuggestionBtn>
            ))}
          </SuggestionList>
        </div>
      </Sidebar>

      {/* ── Chat ── */}
      <ChatArea>
        <ChatHeader>
          {repoStatus
            ? `🔎 Querying · ${repoStatus.name}`
            : "← Load a repository to begin"}
        </ChatHeader>

        <Messages>
          {messages.length === 0 && !thinking && (
            <EmptyState>
              <h2>Ask anything about<br /><span className="highlight">your codebase</span></h2>
              <p>Load a GitHub repo, then chat with it using natural language.</p>
            </EmptyState>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              <BubbleHeader role={m.role}>{m.role === "user" ? "You" : "RepoGuide"}</BubbleHeader>
              <BubbleBody role={m.role}>{m.content}</BubbleBody>
              {m.sources?.length > 0 && (
                <SourceTags>{m.sources.map(s => <SourceTag key={s}>{s}</SourceTag>)}</SourceTags>
              )}
            </Bubble>
          ))}

          {thinking && (
            <Bubble role="assistant">
              <BubbleHeader role="assistant">RepoGuide</BubbleHeader>
              <ThinkingDots><span /><span /><span /></ThinkingDots>
            </Bubble>
          )}
          <div ref={bottomRef} />
        </Messages>

        <InputBar>
          <QueryInput
            placeholder={repoStatus ? "Ask about the codebase…" : "Load a repository first"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!repoStatus || thinking}
          />
          <SendBtn onClick={() => sendMessage()} disabled={!repoStatus || thinking || !input.trim()}>
            ↑
          </SendBtn>
        </InputBar>
      </ChatArea>
    </Shell>
  );
}
