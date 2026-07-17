import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  sendChatMessage,
  listSessions,
  deleteSession,
  getSessionMessages,
} from "../api/client";
import type { ChatSession, ChatTurn, Message } from "../types";
import {
  Send,
  Loader2,
  ChevronDown,
  Plus,
  X,
  MessageCircle,
} from "lucide-react";
import MapMessage from "../components/MapMessage";
import { useLanguage } from "../contexts/LanguageContext";

function now(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string, t: (key: string) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) return t("chat_today");
  if (diff < 172800000 && d.getDate() === now.getDate() - 1) return t("chat_yesterday");
  return d.toLocaleDateString();
}

function ChatBubbleUser({
  content,
  time,
  avatar,
  name,
}: {
  content: string;
  time: string;
  avatar?: string;
  name?: string;
}) {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[70%]">
        <div className="bg-[#EAF1FE] text-[#111827] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
          {content}
        </div>
        <p className="text-[11px] text-[#6B7280] mt-1 text-right">{time}</p>
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
        {avatar ? (
          <img src={avatar} alt="You" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-[#2F6FED] flex items-center justify-center text-white text-xs font-semibold">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubbleAssistant({
  content,
  time,
  turn,
  onOptionClick,
}: {
  content: string;
  time: string;
  turn?: ChatTurn;
  onOptionClick: (opt: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
        <img
          src="/BenHealthy.png"
          alt="Ben"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-[70%]">
        <div className="bg-white border border-[#E5E7EB] text-[#111827] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed shadow-sm">
          {turn ? renderTurnContent(turn, onOptionClick) : content}
        </div>
        <p className="text-[11px] text-[#6B7280] mt-1">{time}</p>
      </div>
    </div>
  );
}

function renderTurnContent(
  turn: ChatTurn,
  onOptionClick: (opt: string) => void,
) {
  switch (turn.type) {
    case "answer":
      return <p>{turn.text}</p>;
    case "question":
      return (
        <div>
          <p className="mb-2">{turn.text}</p>
          <div className="flex flex-wrap gap-2">
            {turn.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onOptionClick(opt)}
                className="px-3 py-1 text-xs font-medium border border-[#2F6FED] text-[#2F6FED] rounded-full hover:bg-[#EAF1FE] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    case "result":
      return (
        <div>
          <p className="font-medium text-sm">
            Urgency: <span className="uppercase">{turn.urgency}</span>
          </p>
          <p className="mt-1">{turn.explanation}</p>
          {turn.specialist && (
            <p className="mt-1 text-[#2F6FED] font-medium">
              Recommendation: {turn.specialist}
            </p>
          )}
        </div>
      );
  }
}

interface ChatProps {
  userName?: string;
  userAvatar?: string;
}

export default function Chat({ userName, userAvatar }: ChatProps) {
  const { t } = useLanguage()
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [tone, setTone] = useState(() => localStorage.getItem("chat_tone") || "Clinical");
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const [lastUrgency, setLastUrgency] = useState<{
    urgency: "emergency" | "monitor" | "24h";
    explanation: string;
  } | null>(null);

  const [sessionSidebarOpen, setSessionSidebarOpen] = useState(false);
  const sessionSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sessionSidebarRef.current &&
        !sessionSidebarRef.current.contains(e.target as Node)
      ) {
        setSessionSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSent = useRef(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (lastUrgency) {
      mapPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [lastUrgency]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !initialSent.current) {
      initialSent.current = true;
      setSearchParams({}, { replace: true });
      handleNewChat(q);
    }
  }, []);

  const persona = tone === t("tone_custom")
    ? `${localStorage.getItem("custom_persona_name") || t("tone_custom")}: ${localStorage.getItem("custom_persona_desc") || ""}`
    : tone;

  async function loadSessions() {
    try {
      const s = await listSessions();
      setSessions(s);
      if (s.length > 0 && !activeSessionId) {
        await selectSession(s[0].id);
      }
    } catch {
      // supabase not configured — sessions disabled
    }
  }

  async function selectSession(id: string) {
    setActiveSessionId(id);
    setMessages([]);
    setLastUrgency(null);
    setLoadingMsgs(true);
    try {
      const msgs = await getSessionMessages(id);
      let foundUrgency: typeof lastUrgency = null;
      const loaded = msgs.map((m) => {
        let turn: ChatTurn | undefined;
        let content = m.content;
        if (m.role === "assistant") {
          try {
            const parsed = JSON.parse(m.content);
            if (parsed.type) {
              turn = parsed as ChatTurn;
              content =
                turn.type === "answer"
                  ? turn.text
                  : turn.type === "question"
                    ? turn.text
                    : turn.explanation;
              if (turn.type === "result") {
                foundUrgency = {
                  urgency: turn.urgency,
                  explanation: turn.explanation,
                };
              }
            }
          } catch {}
        }
        return {
          role: m.role as "user" | "assistant",
          content,
          turn,
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
      setMessages(loaded);
      setLastUrgency(foundUrgency);
    } catch (e) {
      console.error("Failed to load session messages:", e);
      setMessages([
        {
          role: "assistant",
          content: "Gagal memuat pesan. Coba refresh atau pilih sesi lain.",
          timestamp: now(),
        },
      ]);
    } finally {
      setLoadingMsgs(false);
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  async function handleNewChat(initialMessage?: string) {
    setActiveSessionId(null);
    setMessages([]);
    setLastUrgency(null);
    inputRef.current?.focus({ preventScroll: true });
    if (initialMessage) {
      await handleSend(initialMessage);
    }
  }

  async function handleDelete(sessionId: string) {
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
        setLastUrgency(null);
      }
    } catch {
      // silent fail
    }
  }

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;
    const ts = now();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: ts },
    ]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { session_id, turn } = await sendChatMessage(
        text,
        history,
        persona,
        activeSessionId || undefined,
      );
      setActiveSessionId(session_id);
      const content =
        turn.type === "answer"
          ? turn.text
          : turn.type === "question"
            ? turn.text
            : turn.explanation;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content, turn, timestamp: now() },
      ]);
      if (turn.type === "result") {
        setLastUrgency({
          urgency: turn.urgency,
          explanation: turn.explanation,
        });
      }
      if (!activeSessionId) {
        const s = await listSessions();
        setSessions(s);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("chat_error"),
          timestamp: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg:flex h-[calc(100vh-4rem)] bg-[#F5F7FB] relative">
      {/* Session sidebar — overlay on tablet, inline on desktop */}
      {sessionSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSessionSidebarOpen(false)}
        />
      )}
      <div
        ref={sessionSidebarRef}
        className={`fixed top-16 left-0 md:left-16 z-30 w-[280px] h-[calc(100vh-4rem)] bg-white border-r border-[#E5E7EB] flex flex-col transition-transform duration-200 ease-in-out -translate-x-full lg:static lg:translate-x-0 lg:w-[220px] lg:shrink-0 lg:z-auto lg:h-auto ${
          sessionSidebarOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="p-3 border-b border-[#E5E7EB]">
          <button
            onClick={() => {
              handleNewChat();
              setSessionSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2F6FED] text-white rounded-lg hover:bg-[#1E4FBE] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("chat_new")}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                selectSession(s.id);
                setSessionSidebarOpen(false);
              }}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                s.id === activeSessionId ? "bg-[#EAF1FE]" : "hover:bg-gray-50"
              }`}
            >
              <MessageCircle
                className={`w-4 h-4 shrink-0 ${s.id === activeSessionId ? "text-[#2F6FED]" : "text-gray-400"}`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] truncate ${s.id === activeSessionId ? "text-[#2F6FED] font-medium" : "text-[#111827]"}`}
                >
                  {s.title}
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  {formatDate(s.updated_at, t)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s.id);
                }}
                className="shrink-0 p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={t("chat_delete_session")}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tone row */}
        <div className="flex items-center justify-between lg:justify-end px-6 py-3 bg-white border-b border-[#E5E7EB]">
          <button
            onClick={() => setSessionSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2F6FED] hover:bg-[#EAF1FE] rounded-lg transition-colors cursor-pointer"
            aria-label={t("chat_sessions")}
          >
            <MessageCircle className="w-4 h-4" />
            {t("chat_sessions")}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-[#6B7280] font-medium">{t("chat_tone")}</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer"
              >
                <option>{t("tone_clinical")}</option>
                <option>{t("tone_empathetic")}</option>
                <option>{t("tone_straightforward")}</option>
                <option>{t("tone_custom")}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="lg:h-full h-[50vh] overflow-y-auto px-6 py-4 space-y-4"
        >
          {loadingMsgs && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-[#2F6FED]" />
            </div>
          )}
          {!loadingMsgs && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#6B7280] text-center max-w-md">
                {activeSessionId
                  ? t("chat_no_messages")
                  : t("chat_empty")}
                <br />
                {t("chat_empty_sub")}
              </p>
            </div>
          )}
          {!loadingMsgs &&
            messages.map((msg, i) =>
              msg.role === "user" ? (
                <ChatBubbleUser
                  key={i}
                  content={msg.content}
                  time={msg.timestamp}
                  avatar={userAvatar}
                  name={userName}
                />
              ) : (
                <ChatBubbleAssistant
                  key={i}
                  content={msg.content}
                  time={msg.timestamp}
                  turn={msg.turn}
                  onOptionClick={(opt) => handleSend(opt)}
                />
              ),
            )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <img
                  src="/BenHealthy.png"
                  alt="Ben"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#2F6FED]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-6 py-3 bg-white border-t border-[#E5E7EB]">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder={t("chat_placeholder")}
              className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#2F6FED] text-white rounded-full flex items-center justify-center hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2 text-center">
            {t("chat_disclaimer")}
          </p>
        </div>
      </div>

      {/* Right panel — MapMessage */}
      <div
        ref={mapPanelRef}
        className="lg:w-[380px] lg:xl:w-[420px] lg:shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto"
      >
        <MapMessage
          collapsed={mapCollapsed}
          onToggle={() => setMapCollapsed(!mapCollapsed)}
          urgency={lastUrgency?.urgency ?? null}
          explanation={lastUrgency?.explanation ?? ""}
        />
      </div>
    </div>
  );
}
