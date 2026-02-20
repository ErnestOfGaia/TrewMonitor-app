'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { TerminalBox, TerminalButton, TerminalSelect, LoadingSpinner, AsciiDivider } from '@/components/terminal-box';
import { ChevronLeft, ChevronRight, Lightbulb, BookOpen, Eye } from 'lucide-react';
import { getTipsByLevel, type RiskTip } from '@/lib/tips-data';

export default function EducationalPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tips, setTips] = useState<RiskTip[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router?.replace?.('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const levelTips = getTipsByLevel(selectedLevel);
    setTips(levelTips);
    setCurrentIndex(0);
  }, [selectedLevel]);

  const currentTip = tips?.[currentIndex] ?? null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, (prev ?? 0) - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min((tips?.length ?? 1) - 1, (prev ?? 0) + 1));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <LoadingSpinner text="Loading tips..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-terminal-dim">[</span>
              RISK MANAGEMENT TIPS
              <span className="text-terminal-dim">]</span>
            </h1>
            <p className="text-sm text-terminal-dim">
              63 tips across 3 levels • Test and review before deployment
            </p>
          </div>
          
          {/* Level Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-terminal-dim">LEVEL:</label>
            <TerminalSelect
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(parseInt(val, 10))}
              options={[
                { value: 1, label: 'Level 1 - Beginner' },
                { value: 2, label: 'Level 2 - Intermediate' },
                { value: 3, label: 'Level 3 - Advanced' },
              ]}
            />
          </div>
        </div>

        <AsciiDivider />

        {/* Current Tip Display */}
        <div className="my-6">
          <TerminalBox title={`TIP ${(currentIndex ?? 0) + 1} OF ${tips?.length ?? 0} - LEVEL ${selectedLevel}`}>
            {currentTip ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-10 h-10 text-terminal-amber flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-terminal-amber mb-3">
                      {currentTip?.title ?? 'Tip'}
                    </h2>
                    <p className="text-lg leading-relaxed">
                      {currentTip?.content ?? ''}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-terminal-dim">
                  <TerminalButton
                    onClick={handlePrevious}
                    disabled={(currentIndex ?? 0) === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    PREVIOUS
                  </TerminalButton>
                  
                  <span className="text-terminal-dim text-sm">
                    Tip #{currentTip?.tipNumber ?? 1} • Level {currentTip?.level ?? 1}
                  </span>
                  
                  <TerminalButton
                    onClick={handleNext}
                    disabled={(currentIndex ?? 0) >= (tips?.length ?? 1) - 1}
                    className="flex items-center gap-2"
                  >
                    NEXT
                    <ChevronRight className="w-4 h-4" />
                  </TerminalButton>
                </div>
              </div>
            ) : (
              <p className="text-terminal-dim">No tips available for this level.</p>
            )}
          </TerminalBox>
        </div>

        {/* Home Page Preview */}
        <div className="my-6">
          <TerminalButton
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 mb-4"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'HIDE' : 'SHOW'} HOME PAGE PREVIEW
          </TerminalButton>
          
          {showPreview && currentTip && (
            <div className="p-4 border border-dashed border-terminal-dim">
              <p className="text-xs text-terminal-dim mb-2">[ Preview: How tip appears on Dashboard ]</p>
              <div className="tip-box">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-8 h-8 text-terminal-amber flex-shrink-0" />
                  <div>
                    <h3 className="text-terminal-amber font-bold mb-2">
                      {currentTip?.title ?? 'Tip'}
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {currentTip?.content ?? ''}
                    </p>
                    <p className="text-xs text-terminal-dim mt-3">
                      Tip #{currentTip?.tipNumber ?? 1} of 21 • Level {currentTip?.level ?? 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AsciiDivider />

        {/* All Tips List */}
        <div className="my-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-terminal-dim">▸</span>
            ALL LEVEL {selectedLevel} TIPS
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(tips ?? [])?.map?.((tip, idx) => (
              <div
                key={`${tip?.level}-${tip?.tipNumber}`}
                onClick={() => setCurrentIndex(idx)}
                className={`p-3 border cursor-pointer transition-all ${
                  idx === currentIndex
                    ? 'border-terminal-green bg-terminal-green bg-opacity-10'
                    : 'border-terminal-dim hover:border-terminal-green'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-terminal-amber text-sm">#{tip?.tipNumber ?? 0}</span>
                    <span className="font-bold">{tip?.title ?? ''}</span>
                  </div>
                  {idx === currentIndex && (
                    <span className="text-xs text-terminal-green">VIEWING</span>
                  )}
                </div>
                <p className="text-sm text-terminal-dim mt-1 line-clamp-1">
                  {tip?.content ?? ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
