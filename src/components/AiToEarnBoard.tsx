import React from 'react';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Award,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { AiToEarnBounty } from '../types';
import { PRESET_BOUNTIES } from '../data/mockData';

interface AiToEarnBoardProps {
  earnedCredits: number;
  completedTasksCount: number;
  timeSavedMinutes: number;
  onDispatchBounty: (bounty: AiToEarnBounty) => void;
}

export const AiToEarnBoard: React.FC<AiToEarnBoardProps> = ({
  earnedCredits,
  completedTasksCount,
  timeSavedMinutes,
  onDispatchBounty,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Value Earned</span>
            <div className="text-xl font-bold font-mono text-amber-300">
              {earnedCredits.toLocaleString()} <span className="text-xs font-normal text-amber-400/80">CREDITS</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Tasks Executed</span>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {completedTasksCount} <span className="text-xs font-normal text-cyan-400/80">COMPLETED</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80 text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Human Time Saved</span>
            <div className="text-xl font-bold font-mono text-blue-300">
              {(timeSavedMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-blue-400/80">HOURS</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Autonomous ROI</span>
            <div className="text-xl font-bold font-mono text-purple-300">
              98.4% <span className="text-xs font-normal text-purple-400/80">EFFICIENCY</span>
            </div>
          </div>
        </div>
      </div>

      {/* AiToEarn Explanation Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold text-slate-100">AiToEarn Autonomous Bounties</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
              Active Protocol
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch autonomous agents to fulfill real digital bounties: market scouting, documentation ingestion via GPT-Crawler, deep reasoning audits, and Veo 3 promotional assets.
          </p>
        </div>
      </div>

      {/* Bounties Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_BOUNTIES.map((bounty) => (
          <div
            key={bounty.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {bounty.category}
                </span>

                <div className="flex items-center gap-1.5 text-amber-300 font-mono text-xs font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{bounty.rewardCredits} Credits</span>
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-100">{bounty.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{bounty.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {bounty.estimatedTime}
                </span>
                <span>•</span>
                <span>{bounty.difficulty} Complexity</span>
              </div>

              <button
                id={`btn-dispatch-${bounty.id}`}
                onClick={() => onDispatchBounty(bounty)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all"
              >
                <span>Dispatch Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
