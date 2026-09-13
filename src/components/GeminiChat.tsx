import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Zap,
  ShieldAlert,
  ArrowDown
} from 'lucide-react';
import { ChatMessage, GeminiModelType, AgentRole } from '../types';
import { SYSTEM_ROLES } from '../data/mockData';

interface GeminiChatProps {
  crawledContextText?: string;
  onSendToPlanner?: (prompt: string) => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({
  crawledContextText,
  onSendToPlanner,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      content: `Hello! I am your **Aion Autonomous Assistant**. 

I combine:
- **Autonomous Task Planning & Execution** (AionUi + AiToEarn)
- **Real-Time Web Scraping** (GPT-Crawler)
- **High Thinking Reasoning** with \`gemini-3.1-pro-preview\`
- **Veo 3 Video Generation** (\`veo-3.1-fast-generate-preview\`)

How can I assist your mission today?`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<AgentRole>('autonomous_orchestrator');
  const [enableHighThinking, setEnableHighThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When High Thinking is toggled, auto-switch to gemini-3.1-pro-preview as per guidelines
  const handleToggleHighThinking = () => {
    const nextState = !enableHighThinking;
    setEnableHighThinking(nextState);
    if (nextState) {
      setSelectedModel('gemini-3.1-pro-preview');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const activeRoleConfig = SYSTEM_ROLES[selectedRole];
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: enableHighThinking ? 'gemini-3.1-pro-preview' : selectedModel,
        systemInstruction: activeRoleConfig.instruction,
        enableHighThinking,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response generated.',
        thought: data.thought,
        modelUsed: data.modelUsed || selectedModel,
        groundingUrls: data.groundingUrls,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Execution Error**: ${err.message || 'Failed to generate response'}.\n\n*Tip: Check that GEMINI_API_KEY is properly set or try switching to another Gemini model.*`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed. Agent active in **${SYSTEM_ROLES[selectedRole].name}** role with **${selectedModel}**.`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      },
    ]);
  };

  const injectCrawlerData = () => {
    if (!crawledContextText) return;
    setInputPrompt((prev) => {
      const snippet = `Here is the extracted GPT-Crawler web data:\n\n"""\n${crawledContextText.slice(0, 3000)}\n"""\n\nPlease analyze this structured data, extract key insights, and formulate actionable next steps.`;
      return prev ? `${prev}\n\n${snippet}` : snippet;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-6xl mx-auto p-4 md:p-6 gap-4">
      {/* Control bar: Model switcher, Role selector, High Thinking toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 md:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Role selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AgentRole)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="autonomous_orchestrator">Autonomous Orchestrator</option>
              <option value="crawler_specialist">GPT-Crawler Specialist</option>
              <option value="earning_analyst">AiToEarn Strategist</option>
              <option value="veo_creative">Veo 3 Video Director</option>
            </select>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Model:</span>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => {
                const model = e.target.value as GeminiModelType;
                setSelectedModel(model);
                if (model !== 'gemini-3.1-pro-preview' && enableHighThinking) {
                  setEnableHighThinking(false);
                }
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex / Reasoning)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* High Thinking Toggle (MUST use gemini-3.1-pro-preview and ThinkingLevel.HIGH) */}
          <button
            id="btn-high-thinking-toggle"
            type="button"
            onClick={handleToggleHighThinking}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              enableHighThinking
                ? 'bg-purple-900/60 border-purple-500 text-purple-200 shadow-sm shadow-purple-900/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="High Thinking Mode: Uses gemini-3.1-pro-preview with ThinkingLevel.HIGH for complex queries"
          >
            <Brain className={`w-4 h-4 ${enableHighThinking ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span>High Thinking</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${enableHighThinking ? 'bg-purple-800/80 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {enableHighThinking ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Reset Chat */}
          <button
            id="btn-clear-chat"
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role explanation banner */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">{SYSTEM_ROLES[selectedRole].name}:</span>
          <span className="truncate">{SYSTEM_ROLES[selectedRole].description}</span>
        </div>
        {enableHighThinking && (
          <span className="text-purple-400 font-mono text-[11px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/70 shrink-0">
            ThinkingLevel.HIGH Active
          </span>
        )}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 md:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-slate-300">Aion Agent</span>
                  {msg.modelUsed && (
                    <span className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                      {msg.modelUsed}
                    </span>
                  )}
                </>
              )}
            </div>

            <div
              className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed transition-all shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
              }`}
            >
              {/* Collapsible High Thinking / Thoughts view */}
              {msg.thought && (
                <div className="mb-3 border border-purple-900/70 bg-purple-950/40 rounded-xl p-3 text-xs text-purple-200">
                  <button
                    onClick={() =>
                      setExpandedThoughtId(expandedThoughtId === msg.id ? null : msg.id)
                    }
                    className="flex items-center justify-between w-full font-mono text-[11px] text-purple-300 hover:text-purple-100"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Brain className="w-3.5 h-3.5 text-purple-400" />
                      Agent Deep Reasoning Trace
                    </span>
                    {expandedThoughtId === msg.id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {expandedThoughtId === msg.id && (
                    <div className="mt-2 pt-2 border-t border-purple-900/50 whitespace-pre-wrap font-mono text-[11px] text-purple-300/90 max-h-60 overflow-y-auto">
                      {msg.thought}
                    </div>
                  )}
                </div>
              )}

              {/* Message text content */}
              <div className="whitespace-pre-wrap font-sans break-words space-y-2">
                {msg.content}
              </div>

              {/* Grounding web sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1">Referenced Sources:</span>
                  <ul className="space-y-1">
                    {msg.groundingUrls.map((g, idx) => (
                      <li key={idx}>
                        <a
                          href={g.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                        >
                          • {g.title || g.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons (Copy, Send to Planner) */}
              {msg.role === 'model' && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="flex items-center gap-1 hover:text-slate-200"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {onSendToPlanner && (
                    <button
                      onClick={() => onSendToPlanner(msg.content)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      <span>Create Autonomous Plan</span>
                      <Zap className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 text-sm text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-300 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>
                {enableHighThinking
                  ? 'Aion is reasoning deeply (ThinkingLevel.HIGH on gemini-3.1-pro-preview)...'
                  : 'Aion is formulating autonomous response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts / Context injection buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {crawledContextText && (
          <button
            id="btn-inject-crawler-data"
            onClick={injectCrawlerData}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs hover:bg-cyan-900/60 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inject Extracted GPT-Crawler Data</span>
          </button>
        )}

        <button
          onClick={() =>
            handleSendMessage(
              'Formulate an autonomous AiToEarn execution plan to scout competitive landscape for AI agents and estimate reward credits.'
            )
          }
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
        >
          💡 Plan AiToEarn Mission
        </button>

        <button
          onClick={() =>
            handleSendMessage(
              'Draft an ultra-detailed Veo 3 video generation prompt for a futuristic AI autonomous agent control room with 16:9 aspect ratio.'
            )
          }
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
        >
          🎬 Formulate Veo 3 Prompt
        </button>
      </div>

      {/* Message Input Box */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2 md:p-3 focus-within:border-cyan-500/80 transition-all shadow-xl">
        <textarea
          id="chat-input-textarea"
          ref={inputRef}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            enableHighThinking
              ? 'Ask a complex multi-step reasoning question (High Thinking active)...'
              : 'Instruct Aion agent, ask for web analysis, or formulate autonomous workflows...'
          }
          rows={2}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1 font-sans"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Press <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">Enter</kbd> to send, <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">Shift + Enter</kbd> for new line
          </span>

          <button
            id="btn-send-message"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-md shadow-cyan-900/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all ml-auto"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
