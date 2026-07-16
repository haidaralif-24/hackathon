import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/client";
import type { ChatTurn, Message } from "../types";
import { Send, Loader2 } from "lucide-react";

function renderTurn(turn: ChatTurn, onOptionClick: (opt: string) => void) {
  switch (turn.type) {
    case "answer":
      return <p className="text-sm">{turn.text}</p>;
    case "question":
      return (
        <div>
          <p className="text-sm mb-2">{turn.text}</p>
          <div className="flex flex-wrap gap-2">
            {turn.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onOptionClick(opt)}
                className="px-3 py-1 text-xs font-medium border border-blue-300 text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
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
          <p className="text-sm font-medium">
            Urgency: <span className="uppercase">{turn.urgency}</span>
          </p>
          <p className="text-sm mt-1">{turn.explanation}</p>
          {turn.specialist && (
            <p className="text-sm mt-1 text-blue-600">Recommendation: {turn.specialist}</p>
          )}
        </div>
      );
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const turn: ChatTurn = await sendChatMessage(text, history);
      const assistantMsg: Message = {
        role: "assistant",
        content: turn.type === "answer" ? turn.text : turn.type === "question" ? turn.text : turn.explanation,
        turn,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-20">
            Describe your symptoms or ask a health question to start.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.role === "assistant" && msg.turn
                ? renderTurn(msg.turn, (opt) => handleSend(opt))
                : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
