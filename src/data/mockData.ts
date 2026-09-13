import { AiToEarnBounty } from '../types';

export const SYSTEM_ROLES = {
  autonomous_orchestrator: {
    name: 'Autonomous Orchestrator',
    description: 'Decomposes high-level missions, invokes web tools, and plans multi-step pipelines.',
    instruction: `You are Aion, an autonomous AI Agent Orchestrator. Your objective is to understand user goals, break them down into rigorous autonomous actions, evaluate the economic value and accuracy of deliverables, and coordinate sub-agents for web crawling, deep thinking, and multimedia generation.`,
  },
  crawler_specialist: {
    name: 'GPT-Crawler Ingestion Lead',
    description: 'Extracts clean structured markdown, selectors, and documentation from the web.',
    instruction: `You are the GPT-Crawler Ingestion Specialist. You analyze web schemas, extract relevant DOM structures, clean noise, and summarize web content into high-density knowledge bases ready for LLM processing.`,
  },
  earning_analyst: {
    name: 'AiToEarn Monetization Strategist',
    description: 'Assesses ROI, task value generation, market arbitrage, and productivity bounties.',
    instruction: `You are the AiToEarn Monetization Strategist. You evaluate tasks for autonomous execution efficiency, compute economic value created, analyze cost vs return, and verify milestone completion.`,
  },
  veo_creative: {
    name: 'Veo 3 Video Director',
    description: 'Formulates cinematic, highly descriptive visual prompts optimized for Veo 3 video generation.',
    instruction: `You are the Veo 3 Video Creative Director. You craft vivid, cinematic visual prompts specifying camera motion, lighting, atmosphere, style, and temporal coherence for the veo-3.1-fast-generate-preview video generation model.`,
  },
};

export const PRESET_BOUNTIES: AiToEarnBounty[] = [
  {
    id: 'bounty-1',
    title: 'Autonomous Tech Radar & Competitor Intelligence',
    category: 'Market Scout',
    rewardCredits: 350,
    estimatedTime: '2.5 mins',
    difficulty: 'Deep',
    description: 'Crawl open-source repository documentation, extract architecture patterns, analyze competitive differentiation, and generate an executive brief.',
    promptGoal: 'Crawl https://github.com and tech docs to extract autonomous agent architectures, evaluate competitive differentiation, and summarize actionable insights.',
    suggestedUrl: 'https://news.ycombinator.com',
  },
  {
    id: 'bounty-2',
    title: 'GPT-Crawler Documentation to Knowledge Base',
    category: 'Knowledge Extraction',
    rewardCredits: 200,
    estimatedTime: '1.2 mins',
    difficulty: 'Quick',
    description: 'Scrape web documentation using CSS selectors and transform raw web pages into clean, vector-ready markdown chunks.',
    promptGoal: 'Use GPT-Crawler on technical documentation, extract core API references, and synthesize a clean structured knowledge base.',
    suggestedUrl: 'https://react.dev',
  },
  {
    id: 'bounty-3',
    title: 'Autonomous Veo 3 Promotional Video Concept',
    category: 'Content Creation',
    rewardCredits: 400,
    estimatedTime: '3.0 mins',
    difficulty: 'Medium',
    description: 'Synthesize product value proposition and autonomously generate a cinematic 16:9 Veo 3 video generation prompt and preview.',
    promptGoal: 'Synthesize product value proposition and generate a cinematic Veo 3 promotional video prompt depicting futuristic autonomous agent collaboration.',
  },
  {
    id: 'bounty-4',
    title: 'High Thinking Deep Logic & Strategy Audit',
    category: 'Deep Research',
    rewardCredits: 500,
    estimatedTime: '4.0 mins',
    difficulty: 'Deep',
    description: 'Execute deep multi-step reasoning with ThinkingLevel.HIGH on gemini-3.1-pro-preview to discover hidden edge cases and monetization vectors.',
    promptGoal: 'Perform a high thinking strategic audit on scaling autonomous agent networks with zero human intervention and optimal token ROI.',
  },
];

export const VEO_PROMPT_PRESETS = [
  {
    title: 'Cybernetic Autonomous Agent Core',
    prompt: 'Cinematic 3D render of a luminous quantum neural core pulsing with glowing blue and gold circuits, intricate mechanical gears revolving autonomously, depth of field, 8k quality, cinematic lighting',
    ratio: '16:9' as const,
  },
  {
    title: 'Mobile Tech Vertical Teaser',
    prompt: 'Vertical portrait shot of a holographic smartphone floating in a sleek dark minimalist studio, displaying live financial data streams and AI agent progress nodes, smooth slow rotation, studio rim light',
    ratio: '9:16' as const,
  },
  {
    title: 'Autonomous Web Crawler Visualizer',
    prompt: 'Hyper-detailed futuristic digital spider crawling across webs of glowing data nodes, fiber optic threads weaving together structured knowledge, ambient volumetric mist, cinematic macro shot',
    ratio: '16:9' as const,
  },
];
