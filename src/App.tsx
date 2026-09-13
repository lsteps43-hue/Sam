/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { AutonomousWorkbench } from './components/AutonomousWorkbench';
import { GeminiChat } from './components/GeminiChat';
import { GptCrawlerStudio } from './components/GptCrawlerStudio';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { AiToEarnBoard } from './components/AiToEarnBoard';
import { AiToEarnBounty } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'chat' | 'crawler' | 'veo' | 'aitoearn'>('workbench');
  const [earnedCredits, setEarnedCredits] = useState(1250);
  const [completedTasksCount, setCompletedTasksCount] = useState(4);
  const [timeSavedMinutes, setTimeSavedMinutes] = useState(140);
  const [crawledContextText, setCrawledContextText] = useState<string>('');
  const [workbenchGoal, setWorkbenchGoal] = useState<string>(
    'Crawl tech documentation using GPT-Crawler, synthesize competitive advantage with High Thinking, and generate a 16:9 Veo 3 promotional video prompt.'
  );

  const handleEarnCredits = (amount: number, minutes: number) => {
    setEarnedCredits((prev) => prev + amount);
    setCompletedTasksCount((prev) => prev + 1);
    setTimeSavedMinutes((prev) => prev + minutes);
  };

  const handleDispatchBounty = (bounty: AiToEarnBounty) => {
    setWorkbenchGoal(bounty.promptGoal);
    setActiveTab('workbench');
  };

  const handleSendCrawlerToChat = (markdown: string) => {
    setCrawledContextText(markdown);
    setActiveTab('chat');
  };

  const handleSendCrawlerToPlanner = (url: string, summary: string) => {
    setWorkbenchGoal(`Ingest web knowledge from ${url} (${summary}), analyze strategic differentiation with High Thinking, and prepare actionable deliverables.`);
    setActiveTab('workbench');
  };

  const handleSendChatToPlanner = (text: string) => {
    setWorkbenchGoal(text.slice(0, 240));
    setActiveTab('workbench');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        earnedCredits={earnedCredits}
        highThinkingEnabled={true}
        agentStatus="idle"
      />

      <main className="flex-1 w-full pb-10">
        <AnimatePresence mode="wait">
          {activeTab === 'workbench' && (
            <motion.div
              key="workbench"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AutonomousWorkbench
                initialGoal={workbenchGoal}
                onEarnCredits={handleEarnCredits}
                onNavigateToCrawler={() => setActiveTab('crawler')}
                onNavigateToVeo={() => setActiveTab('veo')}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <GeminiChat
                crawledContextText={crawledContextText}
                onSendToPlanner={handleSendChatToPlanner}
              />
            </motion.div>
          )}

          {activeTab === 'crawler' && (
            <motion.div
              key="crawler"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <GptCrawlerStudio
                onSendToChat={handleSendCrawlerToChat}
                onSendToPlanner={handleSendCrawlerToPlanner}
              />
            </motion.div>
          )}

          {activeTab === 'veo' && (
            <motion.div
              key="veo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <VeoVideoStudio />
            </motion.div>
          )}

          {activeTab === 'aitoearn' && (
            <motion.div
              key="aitoearn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AiToEarnBoard
                earnedCredits={earnedCredits}
                completedTasksCount={completedTasksCount}
                timeSavedMinutes={timeSavedMinutes}
                onDispatchBounty={handleDispatchBounty}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
