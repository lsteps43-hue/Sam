import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  FileCode, 
  FileText, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { CrawledPage } from '../types';

interface GptCrawlerStudioProps {
  onSendToChat: (markdown: string) => void;
  onSendToPlanner: (url: string, contextSummary: string) => void;
}

export const GptCrawlerStudio: React.FC<GptCrawlerStudioProps> = ({
  onSendToChat,
  onSendToPlanner,
}) => {
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [matchPattern, setMatchPattern] = useState('**');
  const [selector, setSelector] = useState('main, article, .content, #content, tr.athing, p');
  const [maxPages, setMaxPages] = useState(2);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [activeView, setActiveView] = useState<'markdown' | 'json' | 'analysis'>('markdown');
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartCrawl = async () => {
    if (!url.trim() || isCrawling) return;

    setIsCrawling(true);
    setAiAnalysis(null);

    try {
      const res = await fetch('/api/crawler/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          matchPattern,
          selector,
          maxPages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Crawl failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setCrawledPages(data.pages || []);
      setTotalWords(data.totalWords || 0);
      setSelectedPageIndex(0);
    } catch (err: any) {
      alert(`Crawler Error: ${err.message || 'Failed to crawl target'}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (crawledPages.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    setActiveView('analysis');

    try {
      const res = await fetch('/api/crawler/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: crawledPages,
          prompt: 'Synthesize the extracted knowledge into structured entity profiles, technical concepts, monetization potentials, and actionable takeaways for an autonomous AI agent.',
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAiAnalysis(data.analysis || 'No analysis generated');
    } catch (err: any) {
      setAiAnalysis(`Failed to run AI analysis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentPage = crawledPages[selectedPageIndex];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(crawledPages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `gpt-crawler-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  GPT-Crawler Ingestion Studio
                  <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                    BuilderIO Spec
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Crawl live web targets, filter with CSS selectors, and transform messy DOMs into vector-ready LLM knowledge chunks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUrl('https://news.ycombinator.com');
                setSelector('tr.athing, .titleline, .subtext');
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Preset: HackerNews
            </button>
            <button
              onClick={() => {
                setUrl('https://react.dev');
                setSelector('main, article, h1, h2, p, code');
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Preset: React Docs
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Target URL
            </label>
            <div className="relative">
              <input
                id="crawler-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Match Pattern
            </label>
            <input
              id="crawler-pattern-input"
              type="text"
              value={matchPattern}
              onChange={(e) => setMatchPattern(e.target.value)}
              placeholder="** (e.g. /docs/**)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Max Pages
            </label>
            <select
              id="crawler-max-pages"
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={1}>1 Page (Fast)</option>
              <option value={2}>2 Pages</option>
              <option value={3}>3 Pages</option>
              <option value={5}>5 Pages (Deep)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              id="btn-start-crawl"
              onClick={handleStartCrawl}
              disabled={isCrawling || !url}
              className="w-full h-9 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCrawling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Crawling...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Start Crawl</span>
                </>
              )}
            </button>
          </div>

          <div className="md:col-span-12">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              CSS Selector Filter
            </label>
            <input
              id="crawler-selector-input"
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder="article, main, .content, p"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Crawl Results Section */}
      {crawledPages.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">Pages Crawled: </span>
                <span className="font-bold text-cyan-400 font-mono">{crawledPages.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Words Extracted: </span>
                <span className="font-bold text-emerald-400 font-mono">{totalWords.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 border border-purple-800 text-purple-300 hover:bg-purple-900/70 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Synthesize Knowledge'}</span>
              </button>

              <button
                onClick={() => {
                  const combined = crawledPages.map((p) => `# ${p.title} (${p.url})\n\n${p.markdownContent}`).join('\n\n---\n\n');
                  onSendToChat(combined);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/70 text-xs font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Send to Chatbot</span>
              </button>

              <button
                onClick={() => {
                  const summary = `Extracted ${totalWords} words across ${crawledPages.length} pages from ${url}`;
                  onSendToPlanner(url, summary);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-300 hover:bg-blue-900/70 text-xs font-medium transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Plan Autonomous Workflow</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Download JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {crawledPages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPageIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono truncate max-w-[200px] transition-all ${
                  selectedPageIndex === idx
                    ? 'bg-cyan-900/80 border border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {page.title || `Page ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* View switcher (Markdown / JSON / AI Analysis) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveView('markdown')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeView === 'markdown' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Markdown View
              </button>
              <button
                onClick={() => setActiveView('json')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeView === 'json' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                JSON Output (GPT-Crawler)
              </button>
              {aiAnalysis && (
                <button
                  onClick={() => setActiveView('analysis')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeView === 'analysis' ? 'bg-purple-900/60 text-purple-200 font-semibold' : 'text-slate-400'
                  }`}
                >
                  AI Synthesis
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const text =
                  activeView === 'markdown'
                    ? currentPage?.markdownContent || ''
                    : activeView === 'json'
                    ? JSON.stringify(currentPage, null, 2)
                    : aiAnalysis || '';
                handleCopy(text);
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy View</span>
                </>
              )}
            </button>
          </div>

          {/* Content Viewer */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-[500px] overflow-y-auto font-mono text-xs">
            {activeView === 'markdown' && (
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {currentPage?.markdownContent}
              </div>
            )}

            {activeView === 'json' && (
              <pre className="text-cyan-300">
                {JSON.stringify(currentPage, null, 2)}
              </pre>
            )}

            {activeView === 'analysis' && (
              <div className="text-purple-200 whitespace-pre-wrap leading-relaxed font-sans text-sm">
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
