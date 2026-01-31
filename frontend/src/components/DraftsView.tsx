import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Scale, X, Send, FileText, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const DraftsView: React.FC = () => {
  const { drafts, setDrafts, userInfo, setAppState } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingDrafts = drafts.filter(d => d.status === 'pending');
  const sentCount = drafts.filter(d => d.status === 'sent').length;
  const skippedCount = drafts.filter(d => d.status === 'deleted').length;
  const currentDraft = pendingDrafts[0];

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    if (!currentDraft) return;

    setDirection(swipeDirection);

    setTimeout(() => {
      setDrafts(prev => prev.map(d =>
        d.id === currentDraft.id
          ? { ...d, status: swipeDirection === 'right' ? 'sent' : 'deleted' }
          : d
      ));
      setDirection(null);
      setIsExpanded(false);
    }, 300);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Data Broker Removal': return 'bg-red-50 text-red-600 border-red-200';
      case 'Legal Claim': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Privacy Request': return 'bg-sky-50 text-sky-600 border-sky-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  const isComplete = pendingDrafts.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-medium">LitiGate</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-emerald-600 font-medium">{sentCount} sent</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{skippedCount} skipped</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {!isComplete ? (
          <>
            {/* Progress */}
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                {pendingDrafts.length} document{pendingDrafts.length !== 1 ? 's' : ''} remaining
              </p>
            </div>

            {/* Card Stack */}
            <div className="relative w-full max-w-md h-[480px]">
              {/* Background cards for stack effect */}
              {pendingDrafts.slice(1, 3).map((draft, index) => (
                <div
                  key={draft.id}
                  className="absolute inset-0 bg-white rounded-3xl border border-border"
                  style={{
                    transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 12}px)`,
                    zIndex: -index - 1,
                    opacity: 1 - (index + 1) * 0.2,
                  }}
                />
              ))}

              {/* Main Card */}
              <AnimatePresence mode="wait">
                {currentDraft && (
                  <motion.div
                    key={currentDraft.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: direction === 'left' ? -400 : direction === 'right' ? 400 : 0,
                      rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                    }}
                    exit={{
                      x: direction === 'left' ? -400 : 400,
                      rotate: direction === 'left' ? -20 : 20,
                      opacity: 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-3xl border border-border shadow-lg cursor-grab active:cursor-grabbing overflow-hidden flex flex-col"
                  >
                    {/* Swipe Indicators */}
                    <motion.div
                      className="absolute top-6 left-6 px-4 py-2 rounded-xl border-2 border-red-400 text-red-500 font-bold text-lg rotate-[-20deg] opacity-0 pointer-events-none"
                      style={{
                        opacity: direction === 'left' ? 1 : 0,
                      }}
                    >
                      SKIP
                    </motion.div>
                    <motion.div
                      className="absolute top-6 right-6 px-4 py-2 rounded-xl border-2 border-emerald-400 text-emerald-500 font-bold text-lg rotate-[20deg] opacity-0 pointer-events-none"
                      style={{
                        opacity: direction === 'right' ? 1 : 0,
                      }}
                    >
                      SEND
                    </motion.div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Type Badge */}
                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadgeClass(currentDraft.type)}`}>
                          {currentDraft.type}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-medium mb-3">{currentDraft.title}</h2>

                      {/* Content Preview / Full */}
                      <div className="flex-1 overflow-hidden">
                        <div className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-4'}`}>
                          {currentDraft.content}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border font-mono text-xs text-muted-foreground">
                            <p>---</p>
                            <p className="mt-2">This request is made pursuant to applicable California consumer protection laws.</p>
                            <p className="mt-2">Please confirm receipt and action within 45 days as required by law.</p>
                            <p className="mt-4">Sincerely,</p>
                            <p className="text-foreground">{userInfo?.name}</p>
                            <p>{userInfo?.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Expand Toggle */}
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Less details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View full document
                          </>
                        )}
                      </button>
                    </div>

                    {/* Drag Hint */}
                    <div className="px-6 pb-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Swipe right to send • Swipe left to skip
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white border-2 border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors shadow-md"
              >
                <X className="w-7 h-7" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center text-background shadow-lg"
              >
                <Send className="w-8 h-8" />
              </motion.button>
            </div>
          </>
        ) : (
          /* Completion State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-medium mb-3">All done!</h2>
            <p className="text-muted-foreground mb-8">
              You've reviewed all {drafts.length} documents.
              {sentCount > 0 && ` ${sentCount} will be sent to their respective counterparties.`}
            </p>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-white border border-border mb-8">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span className="text-2xl font-medium text-emerald-600">{sentCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <X className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-medium text-muted-foreground">{skippedCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAppState('landing')}
              className="btn-primary"
            >
              <FileText className="w-4 h-4" />
              Start New Scan
            </button>
          </motion.div>
        )}
      </main>

      {/* Disclaimer */}
      <footer className="px-6 pb-6">
        <div className="max-w-lg mx-auto p-3 rounded-2xl bg-secondary/50 border border-border text-center">
          <p className="text-xs text-muted-foreground">
            Documents indicate potential eligibility only. Your approval sends each document.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DraftsView;
