import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User } from "../types";
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Code2,
  Atom,
  Binary,
  GraduationCap,
  Share2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AiDoubtChatbotProps {
  currentUser: User;
  onShareToCommunity?: (title: string, content: string, category: string) => void;
  initialPrompt?: string;
  initialSubject?: string;
  onClearInitialPrompt?: () => void;
}

const SUBJECT_OPTIONS = [
  "General Academic",
  "Mathematics & Calculus",
  "Physics & Quantum Mechanics",
  "Computer Science & Algorithms",
  "Chemistry & Molecular Science",
  "Biology & Life Sciences",
  "Humanities & Literature",
  "Research Methods & Thesis",
  "Exam & Finals Prep",
];

const MODES = [
  { id: "step_by_step", name: "Step-by-Step Solution", icon: Binary, desc: "Detailed derivations and proof chains" },
  { id: "concept_explainer", name: "Concept Intuition", icon: Lightbulb, desc: "Physical meaning, analogies & core intuition" },
  { id: "code_reviewer", name: "Code & Algorithm Debugger", icon: Code2, desc: "Complexity analysis, recursion & data structures" },
  { id: "writing_coach", name: "Academic Writing & Thesis", icon: BookOpen, desc: "Rhetorical strength, citations & clarity" },
];

const QUICK_PROMPTS = [
  {
    title: "Taylor Series Derivation",
    subject: "Mathematics & Calculus",
    prompt: "Can you derive the Taylor Series expansion of f(x) = e^x and cos(x) around x = 0 with step-by-step mathematical reasoning and residual convergence bounds?",
  },
  {
    title: "Schrodinger Wave Equation",
    subject: "Physics & Quantum Mechanics",
    prompt: "Explain the physical meaning of the time-dependent Schrodinger wave equation and how probability density normalization guarantees conservation of quantum state vectors.",
  },
  {
    title: "Dijkstra vs A* Algorithm",
    subject: "Computer Science & Algorithms",
    prompt: "Compare Dijkstra's shortest path algorithm with A* Search. What makes an admissible heuristic function, and what is the Big-O time and space complexity with a Fibonacci heap?",
  },
  {
    title: "Organic Reaction Mechanisms",
    subject: "Chemistry & Molecular Science",
    prompt: "Break down the SN1 vs SN2 nucleophilic substitution mechanisms: carbocation stability, solvent polarities, stereochemical inversion vs racemization.",
  },
];

export const AiDoubtChatbot: React.FC<AiDoubtChatbotProps> = ({
  currentUser,
  onShareToCommunity,
  initialPrompt,
  initialSubject,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello **${currentUser.name}**! I am **ScholarBot**, your dedicated AI Academic Mentor. 

I can help you:
- Solve and derive complex **Math, Physics, and Chemistry** problems step-by-step
- Debug **Algorithms, Data Structures, and Proofs** with time/space complexity
- Critique **Research Papers, Essay Theses, and Literature Reviews**
- Formulate personalized **Study Schedules & Exam Prep Plans**

Select your academic subject and pedagogical mode below, or ask any doubt directly!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || SUBJECT_OPTIONS[0]);
  const [selectedMode, setSelectedMode] = useState("step_by_step");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming initial prompt
  useEffect(() => {
    if (initialPrompt) {
      if (initialSubject) {
        setSelectedSubject(initialSubject);
      }
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      subject: selectedSubject,
      mode: selectedMode,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Send conversation history to backend Gemini endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          subject: selectedSubject,
          mode: selectedMode,
        }),
      });

      const data = await response.json();

      const assistantReply =
        data.reply ||
        "I have processed your query. Let me know if you would like me to break down any step further.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject: selectedSubject,
        mode: selectedMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: `I encountered an issue processing your request: "${err.message || "Network error"}". Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Conversation reset. Ready for your next academic question or derivation!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg">
            <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                ScholarBot Academic Doubt Solver
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                Gemini 3.7 Powered
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Step-by-step derivations, code analysis, concept intuitions, and thesis reviews for students and educators.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition"
          title="Clear Conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Control Bar: Subject & Pedagogical Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        
        {/* Subject Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Academic Field
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pedagogical Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition text-left truncate ${
                    selectedMode === m.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750"
                  }`}
                  title={m.desc}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Quick Academic Test Prompts (shown when only few messages) */}
      {messages.length <= 2 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            Quick Academic Test Inquiries:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSubject(qp.subject);
                  handleSendMessage(qp.prompt);
                }}
                className="text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition group"
              >
                <div className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200 flex items-center justify-between">
                  <span>{qp.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{qp.subject}</span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {qp.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl min-h-[420px] max-h-[600px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              {isAssistant && (
                <div className="h-8 w-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md transition ${
                  isAssistant
                    ? "bg-slate-800/90 border border-slate-700/80 text-slate-100"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {/* Header for message */}
                <div className="flex items-center justify-between gap-4 mb-2 text-[11px] opacity-80 border-b border-white/10 pb-1.5">
                  <span className="font-semibold">
                    {isAssistant ? "ScholarBot AI" : currentUser.name}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Markdown Content */}
                <div className="text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Footer Actions for Assistant Messages */}
                {isAssistant && msg.id !== "welcome" && (
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-700/80 text-[11px]">
                    <span className="text-[10px] text-slate-400">
                      Verified Academic Guidance
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Copy response */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-700 transition"
                        title="Copy Answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Share to Community Forum */}
                      {onShareToCommunity && (
                        <button
                          onClick={() => {
                            const snippet = msg.content.slice(0, 100).replace(/[#*`]/g, "");
                            onShareToCommunity(
                              `Academic Insight: ${snippet}...`,
                              `### AI Academic Reference & Derivation\n\n${msg.content}\n\n*Generated via ScholarBot AI for academic collaboration.*`,
                              selectedSubject
                            );
                          }}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded hover:bg-slate-700 transition font-medium"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>Share to Community</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-indigo-400 shrink-0 mt-0.5"
                />
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-slate-300 text-xs flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>ScholarBot is formulating pedagogical derivation and verifying mathematical steps...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl flex items-end gap-2"
      >
        <textarea
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Ask ScholarBot your academic doubt in ${selectedSubject}... (Shift + Enter for new line)`}
          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none p-2 resize-none"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white p-3 rounded-xl shadow-lg transition flex items-center justify-center shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

    </div>
  );
};
