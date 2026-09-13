export type GeminiModelType = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export type AgentRole = 'autonomous_orchestrator' | 'crawler_specialist' | 'earning_analyst' | 'veo_creative';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  thought?: string;
  modelUsed?: string;
  timestamp: number;
  groundingUrls?: Array<{ uri: string; title: string }>;
  isThinking?: boolean;
}

export interface CrawledPage {
  url: string;
  title: string;
  htmlLength: number;
  textLength: number;
  markdownContent: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface CrawlJob {
  id: string;
  url: string;
  matchPattern: string;
  selector: string;
  maxPages: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  pages: CrawledPage[];
  totalWords: number;
  createdAt: number;
}

export interface AgentStep {
  id: string;
  title: string;
  type: 'crawl' | 'think' | 'synthesize' | 'earn' | 'veo_video';
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  output?: string;
  artifacts?: {
    type: 'json' | 'markdown' | 'video' | 'data';
    name: string;
    content: string;
  }[];
  durationMs?: number;
  error?: string;
}

export interface AutonomousWorkflow {
  id: string;
  goal: string;
  status: 'idle' | 'planning' | 'running' | 'completed' | 'failed';
  highThinking: boolean;
  model: GeminiModelType;
  steps: AgentStep[];
  earnedCredits: number;
  timeSavedMinutes: number;
  createdAt: number;
  completedAt?: number;
}

export interface AiToEarnBounty {
  id: string;
  title: string;
  category: 'Knowledge Extraction' | 'Market Scout' | 'Content Creation' | 'Deep Research';
  rewardCredits: number;
  estimatedTime: string;
  description: string;
  promptGoal: string;
  suggestedUrl?: string;
  difficulty: 'Quick' | 'Medium' | 'Deep';
}

export interface VeoGenerationState {
  operationName?: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  status: 'idle' | 'generating' | 'ready' | 'error';
  progressMessage: string;
  videoUrl?: string;
  errorMessage?: string;
}
