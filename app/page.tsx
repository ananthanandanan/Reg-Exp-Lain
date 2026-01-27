'use client';

import EditorPane from '@/components/EditorPane';
import SandboxPane from '@/components/SandboxPane';
import VisualizerCanvas from '@/components/VisualizerCanvas';
import ExplanationPanel from '@/components/ExplanationPanel';
import { useRegexStore } from '@/lib/store/useRegexStore';

export default function Home() {
  const { explanationNodeId } = useRegexStore();
  const isExplanationOpen = !!explanationNodeId;

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Column - 30% width */}
      <div className="w-[30%] flex flex-col border-r border-slate-800">
        {/* Top Half - Editor */}
        <div className="h-1/2 overflow-hidden">
          <EditorPane />
        </div>
        {/* Bottom Half - Sandbox */}
        <div className="h-1/2 overflow-hidden">
          <SandboxPane />
        </div>
      </div>

      {/* Right Column - 70% width, adjust for explanation panel */}
      <div 
        className="flex-1 relative transition-all duration-300"
        style={{ 
          marginRight: isExplanationOpen ? '384px' : '0' 
        }}
      >
        <VisualizerCanvas />
      </div>

      {/* Explanation Panel - Overlay/Slide-out */}
      <ExplanationPanel />
    </div>
  );
}
