import React from 'react';
import { 
  Bot, 
  Brain, 
  Sparkles, 
  Globe, 
  Video, 
  Coins, 
  Activity, 
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'workbench' | 'chat' | 'crawler' | 'veo' | 'aitoearn';
  setActiveTab: (tab: 'workbench' | 'chat' | 'crawler' | 'veo' | 'aitoearn') => void;
  earnedCredits: number;
  highThinkingEnabled: boolean;
  agentStatus: 'idle' | 'running' | 'thinking';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  earnedCredits,
  highThinkingEnabled,
  agentStatus,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                AION // AGENT
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                v2.5 Autonomous
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AiToEarn • AionUi • GPT-Crawler Orchestrator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
          <button
            id="nav-tab-workbench"
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workbench'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Autonomous Workbench</span>
          </button>

          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Gemini Chat</span>
          </button>

          <button
            id="nav-tab-crawler"
            onClick={() => setActiveTab('crawler')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'crawler'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GPT-Crawler</span>
          </button>

          <button
            id="nav-tab-veo"
            onClick={() => setActiveTab('veo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'veo'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Veo 3 Studio</span>
          </button>

          <button
            id="nav-tab-aitoearn"
            onClick={() => setActiveTab('aitoearn')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'aitoearn'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>AiToEarn Bounties</span>
          </button>
        </nav>

        {/* Status Indicators & Credits */}
        <div className="flex items-center gap-3">
          {/* Agent status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                agentStatus === 'thinking'
                  ? 'bg-purple-400 animate-ping'
                  : agentStatus === 'running'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-mono capitalize text-slate-300">
              {agentStatus === 'thinking' ? 'Deep Thinking' : agentStatus === 'running' ? 'Executing' : 'Agent Ready'}
            </span>
          </div>

          {/* High Thinking Badge */}
          {highThinkingEnabled && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-medium">
              <Brain className="w-3.5 h-3.5" />
              <span className="text-[11px]">Thinking.HIGH</span>
            </div>
          )}

          {/* AiToEarn Credits */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs">{earnedCredits.toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-mono">Credits</span>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-2 py-1.5 gap-1 bg-slate-900/90 scrollbar-none">
        <button
          onClick={() => setActiveTab('workbench')}
          className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === 'workbench' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Workbench
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === 'chat' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Gemini Chat
        </button>
        <button
          onClick={() => setActiveTab('crawler')}
          className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === 'crawler' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          GPT-Crawler
        </button>
        <button
          onClick={() => setActiveTab('veo')}
          className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === 'veo' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Veo 3 Video
        </button>
        <button
          onClick={() => setActiveTab('aitoearn')}
          className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === 'aitoearn' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          AiToEarn
        </button>
      </div>
    </header>
  );
};
