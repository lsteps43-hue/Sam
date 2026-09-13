import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from "@google/genai";
import * as cheerio from "cheerio";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// ---------------- API Routes ----------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "Aion Autonomous AI Agent",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Multi-turn Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      model = "gemini-3.5-flash",
      systemInstruction = "You are Aion, an autonomous AI Agent orchestrator.",
      enableHighThinking = false,
    } = req.body;

    const ai = getGenAI();

    // Model selection rule:
    // When high thinking is requested, we MUST use gemini-3.1-pro-preview with ThinkingLevel.HIGH
    let targetModel = model;
    if (enableHighThinking) {
      targetModel = "gemini-3.1-pro-preview";
    }

    const config: any = {
      systemInstruction,
    };

    if (enableHighThinking && targetModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Note: As per instruction, do not set maxOutputTokens
    }

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    // If no contents provided, provide simple greeting prompt
    const contents = formattedContents.length > 0 ? formattedContents : [{ role: "user", parts: [{ text: "Hello" }] }];

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const reply = response.text || "";
    
    // Extract any thinking/reasoning part if available in candidate content parts
    let thoughtText: string | undefined = undefined;
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if ((part as any).thought) {
          thoughtText = (part as any).thought;
          break;
        }
      }
    }

    res.json({
      reply,
      thought: thoughtText,
      modelUsed: targetModel,
      groundingUrls: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || [],
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: error.message || "Failed to process chat message",
      details: error.toString(),
    });
  }
});

// Autonomous Goal Decomposition (AionUi + AiToEarn Planner)
app.post("/api/agent/decompose", async (req, res) => {
  try {
    const { goal, highThinking = true, model = "gemini-3.1-pro-preview" } = req.body;
    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "Goal is required" });
    }

    const ai = getGenAI();
    const targetModel = highThinking ? "gemini-3.1-pro-preview" : model;

    const config: any = {
      systemInstruction: `You are the Aion Autonomous Workflow Planner. Given an overarching goal, break it down into 3 to 5 realistic, executable autonomous sub-tasks for our multi-agent pipeline.
The available sub-task types are:
1. 'crawl' - Crawling relevant web documentation or sources (GPT-Crawler).
2. 'think' - Deep analysis and strategic planning (using High Thinking mode).
3. 'synthesize' - Structuring data, generating reports, or drafting code.
4. 'earn' - Estimating ROI, monetization pathways, or AiToEarn task completion validation.
5. 'veo_video' - Generating a creative prompt for Veo 3 promotional or conceptual video generation.

Respond STRICTLY in valid JSON matching this structure:
{
  "summary": "Brief explanation of execution strategy",
  "estimatedCredits": 150,
  "timeSavedMinutes": 45,
  "steps": [
    {
      "id": "step-1",
      "title": "Short title",
      "type": "crawl" | "think" | "synthesize" | "earn" | "veo_video",
      "description": "Specific instructions for what this step will autonomously execute",
      "targetUrl": "Optional URL if step is crawl"
    }
  ]
}`,
      responseMimeType: "application/json",
    };

    if (highThinking && targetModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const prompt = `Autonomous Goal: "${goal}". Formulate the optimal autonomous execution DAG plan with distinct sub-tasks, estimated AiToEarn credits, and deliverable specs.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config,
    });

    const rawText = response.text || "{}";
    const plan = JSON.parse(rawText);

    res.json({
      success: true,
      plan,
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Decomposition error:", error);
    res.status(500).json({
      error: error.message || "Failed to decompose goal",
    });
  }
});

// Autonomous Step Execution
app.post("/api/agent/execute-step", async (req, res) => {
  try {
    const { step, context = {}, highThinking = true } = req.body;
    const ai = getGenAI();
    const targetModel = highThinking ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    const config: any = {
      systemInstruction: "You are an autonomous AI Agent executing a specific step in an end-to-end autonomous pipeline. Output detailed markdown results, concrete data insights, and actionable next steps.",
    };

    if (highThinking && targetModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    let prompt = `Step: ${step.title} (${step.type})
Description: ${step.description}
Pipeline Context: ${JSON.stringify(context, null, 2)}

Autonomously execute this step. Provide a complete, highly insightful output.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config,
    });

    const output = response.text || "Step execution completed.";
    
    res.json({
      success: true,
      output,
      modelUsed: targetModel,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Execute step error:", error);
    res.status(500).json({
      error: error.message || "Failed to execute step",
    });
  }
});

// GPT-Crawler Engine (Inspired by BuilderIO/gpt-crawler)
app.post("/api/crawler/crawl", async (req, res) => {
  try {
    const {
      url,
      matchPattern = "**",
      selector = "article, main, .content, #content, body",
      maxPages = 3,
    } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    let parsedStartUrl: URL;
    try {
      parsedStartUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    const visitedUrls = new Set<string>();
    const queue: string[] = [parsedStartUrl.href];
    const pages: any[] = [];
    const limit = Math.min(Math.max(1, Number(maxPages) || 3), 5);

    while (queue.length > 0 && visitedUrls.size < limit) {
      const currentUrl = queue.shift()!;
      if (visitedUrls.has(currentUrl)) continue;
      visitedUrls.add(currentUrl);

      try {
        const fetchController = new AbortController();
        const timeout = setTimeout(() => fetchController.abort(), 8000);

        const response = await fetch(currentUrl, {
          signal: fetchController.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AionCrawler/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        clearTimeout(timeout);

        if (!response.ok) {
          pages.push({
            url: currentUrl,
            title: `HTTP ${response.status}`,
            htmlLength: 0,
            textLength: 0,
            markdownContent: `Failed to fetch page: HTTP status ${response.status}`,
            timestamp: new Date().toISOString(),
            status: "failed",
            error: `HTTP ${response.status}`,
          });
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, iframes, and svg to keep text clean
        $("script, style, noscript, iframe, svg").remove();

        const pageTitle = $("title").text().trim() || $("h1").first().text().trim() || currentUrl;
        
        // Extract content according to selector
        let selectedEl = $(selector);
        if (!selectedEl.length) {
          selectedEl = $("main, article, body");
        }

        // Clean up whitespace and format simple markdown
        const textParts: string[] = [];
        selectedEl.find("h1, h2, h3, h4, p, li, blockquote, pre").each((_, el) => {
          const tagName = el.tagName.toLowerCase();
          const text = $(el).text().trim().replace(/\s+/g, " ");
          if (text) {
            if (tagName === "h1") textParts.push(`\n# ${text}\n`);
            else if (tagName === "h2") textParts.push(`\n## ${text}\n`);
            else if (tagName === "h3") textParts.push(`\n### ${text}\n`);
            else if (tagName === "li") textParts.push(`* ${text}`);
            else textParts.push(text);
          }
        });

        const markdownContent = textParts.join("\n\n").slice(0, 8000);

        pages.push({
          url: currentUrl,
          title: pageTitle,
          htmlLength: html.length,
          textLength: markdownContent.length,
          markdownContent: markdownContent || "No text content extracted with current selector.",
          timestamp: new Date().toISOString(),
          status: "success",
        });

        // Find internal links for multi-page crawl if limit not reached
        if (visitedUrls.size < limit) {
          $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (href) {
              try {
                const resolvedUrl = new URL(href, currentUrl);
                // Keep to same host
                if (resolvedUrl.hostname === parsedStartUrl.hostname && !visitedUrls.has(resolvedUrl.href)) {
                  // check matchPattern if specified
                  if (matchPattern === "**" || resolvedUrl.pathname.includes(matchPattern.replace(/\*/g, ""))) {
                    if (!queue.includes(resolvedUrl.href)) {
                      queue.push(resolvedUrl.href);
                    }
                  }
                }
              } catch {
                // ignore invalid urls
              }
            }
          });
        }
      } catch (err: any) {
        pages.push({
          url: currentUrl,
          title: "Crawl Error",
          htmlLength: 0,
          textLength: 0,
          markdownContent: `Crawl error: ${err.message}`,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: err.message,
        });
      }
    }

    const totalWords = pages.reduce((acc, p) => acc + (p.markdownContent ? p.markdownContent.split(/\s+/).length : 0), 0);

    res.json({
      success: true,
      url,
      pages,
      totalWords,
      crawledCount: pages.length,
    });
  } catch (error: any) {
    console.error("Crawler error:", error);
    res.status(500).json({ error: error.message || "Crawler execution failed" });
  }
});

// Synthesize crawled data with Gemini
app.post("/api/crawler/analyze", async (req, res) => {
  try {
    const { pages = [], prompt = "Summarize the key knowledge and extract structured entities." } = req.body;
    const ai = getGenAI();

    const combinedText = pages
      .map((p: any) => `### Source: ${p.title} (${p.url})\n\n${p.markdownContent}`)
      .join("\n\n---\n\n")
      .slice(0, 15000);

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the GPT-Crawler Knowledge Synthesizer. Analyze this extracted web content:\n\n${combinedText}\n\nTask: ${prompt}`,
      config: {
        systemInstruction: "You are an expert technical intelligence analyst extracting structured knowledge from crawled websites.",
      },
    });

    res.json({
      success: true,
      analysis: aiResponse.text,
    });
  } catch (error: any) {
    console.error("Crawl analysis error:", error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
});

// ---------------- Veo 3 Video Generation Endpoints ----------------
// MUST use veo-3.1-fast-generate-preview and aspect ratio 16:9 or 9:16 as requested

app.post("/api/veo/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required for video generation" });
    }

    const validAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";
    const ai = getGenAI();

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: validAspectRatio,
      },
    });

    res.json({
      success: true,
      operationName: operation.name,
      aspectRatio: validAspectRatio,
      prompt,
    });
  } catch (error: any) {
    console.error("Veo video generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to start video generation",
      details: error.toString(),
    });
  }
});

app.post("/api/veo/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      success: true,
      done: Boolean(updated.done),
      error: updated.error || null,
      videoUri: updated.response?.generatedVideos?.[0]?.video?.uri || null,
    });
  } catch (error: any) {
    console.error("Veo status check error:", error);
    res.status(500).json({
      error: error.message || "Failed to check video status",
    });
  }
});

app.post("/api/veo/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: "Video URI not found or video not finished" });
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: `Failed to fetch video: ${videoRes.statusText}` });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `inline; filename="veo3-generation-${Date.now()}.mp4"`);

    if (videoRes.body) {
      // Stream chunks to express res
      const reader = videoRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) res.write(value);
      }
      res.end();
    } else {
      res.status(500).json({ error: "No video body stream available" });
    }
  } catch (error: any) {
    console.error("Veo download error:", error);
    res.status(500).json({ error: error.message || "Failed to download video" });
  }
});

// ---------------- Vite Middleware / Production Server ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
