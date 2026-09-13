import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Terminal, 
  Globe, 
  Brain, 
  Coins, 
  Video, 
  Layers, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  FileCode,
  Check
} from 'lucide-react';
import { AgentStep, AutonomousWorkflow, GeminiModelType } from '../types';

interface AutonomousWorkbenchProps {
  onEarnCredits: (amount: number, minutesSaved: number) => void;
  onNavigateToCrawler?: () => void;
  onNavigateToVeo?: () => void;
  initialGoal?: string;
}

export const AutonomousWorkbench: React.FC<AutonomousWorkbenchProps> = ({
  onEarnCredits,
  onNavigateToCrawler,
  onNavigateToVeo,
  initialGoal = '',
}) => {
  const [goal, setGoal] = useState(
    initialGoal ||
      'Crawl tech documentation using GPT-Crawler, synthesize competitive advantage with High Thinking, and generate a 16:9 Veo 3 promotional video prompt.'
  );

  const [highThinking, setHighThinking] = useState(true);
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.1-pro-preview');
  const [workflow, setWorkflow] = useState<AutonomousWorkflow | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [selectedStepOutput, setSelectedStepOutput] = useState<AgentStep | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    '[Aion Kernel]: Autonomous agent engine initialized.',
    '[Aion Kernel]: Ready to formulate and execute multi-agent plans.',
  ]);

  useEffect(() => {
    if (initialGoal) {
      setGoal(initialGoal);
    }
  }, [initialGoal]);

  const addLog = (log: string) => {
    setAgentLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // Plan autonomous goal decomposition
  const handleDecomposeGoal = async () => {
    if (!goal.trim() || isPlanning) return;

    setIsPlanning(true);
    addLog(`Initiating goal decomposition with ${highThinking ? 'High Thinking (gemini-3.1-pro-preview)' : selectedModel}...`);

    try {
      const res = await fetch('/api/agent/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal.trim(),
          highThinking,
          model: highThinking ? 'gemini-3.1-pro-preview' : selectedModel,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const plan = data.plan;

      const formattedSteps: AgentStep[] = (plan.steps || []).map((s: any, idx: number) => ({
        id: s.id || `step-${idx + 1}`,
        title: s.title || `Subtask ${idx + 1}`,
        type: s.type || 'think',
        status: 'pending',
        description: s.description || '',
      }));

      const newWorkflow: AutonomousWorkflow = {
        id: `wf-${Date.now()}`,
        goal,
        status: 'idle',
        highThinking,
        model: highThinking ? 'gemini-3.1-pro-preview' : selectedModel,
        steps: formattedSteps,
        earnedCredits: plan.estimatedCredits || 250,
        timeSavedMinutes: plan.timeSavedMinutes || 35,
        createdAt: Date.now(),
      };

      setWorkflow(newWorkflow);
      addLog(`Plan generated: ${formattedSteps.length} autonomous steps scheduled.`);
      addLog(`AiToEarn bounty value calculated: +${newWorkflow.earnedCredits} credits.`);
      if (formattedSteps.length > 0) {
        setSelectedStepOutput(formattedSteps[0]);
      }
    } catch (err: any) {
      addLog(`Plan generation failed: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  // Execute the autonomous pipeline sequentially
  const handleExecuteWorkflow = async () => {
    if (!workflow || isExecuting || workflow.steps.length === 0) return;

    setIsExecuting(true);
    addLog('Starting autonomous pipeline execution sequence...');

    const updatedSteps = [...workflow.steps];

    for (let i = 0; i < updatedSteps.length; i++) {
      setActiveStepIndex(i);
      const step = updatedSteps[i];
      step.status = 'running';
      setWorkflow({ ...workflow, steps: [...updatedSteps], status: 'running' });
      addLog(`Executing Step ${i + 1}/${updatedSteps.length}: "${step.title}" (${step.type})...`);

      const startTime = Date.now();

      try {
        const res = await fetch('/api/agent/execute-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step,
            context: {
              overallGoal: workflow.goal,
              previousOutputs: updatedSteps.slice(0, i).map((s) => ({ title: s.title, output: s.output })),
            },
            highThinking: workflow.highThinking,
          }),
        });

        if (!res.ok) throw new Error(`Execution error on ${step.title}`);

        const data = await res.json();
        step.status = 'completed';
        step.output = data.output;
        step.durationMs = Date.now() - startTime;
        addLog(`Step ${i + 1} completed successfully in ${(step.durationMs / 1000).toFixed(1)}s.`);
      } catch (err: any) {
        step.status = 'failed';
        step.error = err.message;
        addLog(`Step ${i + 1} encountered error: ${err.message}`);
      }

      setWorkflow({ ...workflow, steps: [...updatedSteps] });
      setSelectedStepOutput(step);
    }

    setIsExecuting(false);
    setActiveStepIndex(-1);

    const allSuccessful = updatedSteps.every((s) => s.status === 'completed');
    if (allSuccessful) {
      setWorkflow((prev) => (prev ? { ...prev, status: 'completed', completedAt: Date.now() } : null));
      addLog(`Autonomous workflow finished! Awarding +${workflow.earnedCredits} AiToEarn Credits.`);
      onEarnCredits(workflow.earnedCredits, workflow.timeSavedMinutes);
    } else {
      setWorkflow((prev) => (prev ? { ...prev, status: 'failed' } : null));
      addLog('Autonomous pipeline halted with errors.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Goal Planner Header (AionUi Style) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/40">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100">Autonomous Agent Workbench</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  AionUi Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formulate, decompose, and execute multi-agent task DAGs combining GPT-Crawler, High Thinking, and Veo 3.
              </p>
            </div>
          </div>

          {/* Model & Thinking Toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = !highThinking;
                setHighThinking(next);
                if (next) setSelectedModel('gemini-3.1-pro-preview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                highThinking
                  ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-md shadow-purple-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>High Thinking Mode</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/80 text-white">
                {highThinking ? 'HIGH' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Goal input bar */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase text-slate-400">
            Define Autonomous Mission / High-Level Goal
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="workbench-goal-input"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Crawl AI documentation, extract core concepts with high thinking, and formulate Veo 3 promotional prompt..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              id="btn-plan-workflow"
              onClick={handleDecomposeGoal}
              disabled={isPlanning || !goal.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {isPlanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decomposing Goal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Decompose & Plan DAG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workbench Grid: DAG Plan on left, Step Execution & Terminal on right */}
      {workflow && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Autonomous Execution Plan & DAG */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Autonomous Execution DAG</span>
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {workflow.steps.length} Phases Planned
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-bold">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>+{workflow.earnedCredits} Credits</span>
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-2.5">
                {workflow.steps.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx;
                  const isSelected = selectedStepOutput?.id === step.id;

                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepOutput(step)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-slate-800/80 shadow-md shadow-cyan-950/40'
                          : 'border-slate-800/90 bg-slate-950/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : step.status === 'running' ? (
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                          ) : step.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-400">
                              {idx + 1}
                            </div>
                          )}

                          <span className="text-xs font-semibold text-slate-200">
                            {step.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-slate-900 border border-slate-700 text-slate-400">
                          {step.type}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1.5 pl-6 line-clamp-2">
                        {step.description}
                      </p>

                      {step.durationMs && (
                        <div className="mt-2 pl-6 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Duration: {(step.durationMs / 1000).toFixed(1)}s</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Execution Action Button */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  id="btn-execute-workflow"
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting || workflow.status === 'completed'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Pipeline Step {activeStepIndex + 1}...</span>
                    </>
                  ) : workflow.status === 'completed' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pipeline Completed (+{workflow.earnedCredits} Credits Awarded)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Full Autonomous Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick action bridges */}
            <div className="grid grid-cols-2 gap-3">
              {onNavigateToCrawler && (
                <button
                  onClick={onNavigateToCrawler}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>GPT-Crawler</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Scrape live target web data</p>
                </button>
              )}

              {onNavigateToVeo && (
                <button
                  onClick={onNavigateToVeo}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Veo 3 Studio</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Render 16:9 / 9:16 AI video</p>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Step Output Inspection & Real-Time Agent Logs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step Output Viewer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100">
                    Step Output: {selectedStepOutput?.title || 'Inspect Step'}
                  </h2>
                </div>

                {selectedStepOutput?.status && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      selectedStepOutput.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : selectedStepOutput.status === 'running'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedStepOutput.status}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[220px] max-h-[360px] overflow-y-auto text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
                {selectedStepOutput?.output ? (
                  selectedStepOutput.output
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                    <Clock className="w-6 h-6 mb-2 stroke-1" />
                    <span>Step has not yet executed. Click "Execute Full Autonomous Pipeline" above.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Agent Logs (AionUi Terminal) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Aion Autonomous Execution Logs</span>
                </div>
                <span className="text-[10px] text-slate-500">Live Agent Telemetry</span>
              </div>

              <div className="bg-black rounded-xl p-3.5 border border-slate-800 h-44 overflow-y-auto space-y-1 text-slate-400 text-[11px] scrollbar-thin">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="text-emerald-400">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
