import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, Shield, AlertTriangle, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockRedactoResults, mockDrafts, redactoSteps } from '@/data/mockData';

const RedactoProcessing: React.FC = () => {
  const { setAppState, setRedactoResults, setDrafts } = useApp();
  const [logs, setLogs] = useState<{ message: string; type?: string; risk?: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep >= redactoSteps.length) {
      setIsComplete(true);
      setRedactoResults(mockRedactoResults);
      setDrafts(mockDrafts);
      return;
    }

    const step = redactoSteps[currentStep];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, { message: step.message, type: step.type, risk: step.risk }]);
      setCurrentStep(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentStep, setRedactoResults, setDrafts]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleContinue = () => {
    setAppState('drafts');
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-neutral-400';
    }
  };

  const totalFindings = mockRedactoResults.reduce((acc, r) => acc + r.findings.length, 0);
  const highRiskCount = mockRedactoResults.reduce((acc, r) => acc + r.findings.filter(f => f.risk === 'high').length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-medium">LitiGate</span>
            </div>
            <span className="step-indicator">Step 3 of 4</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Analyzing eligibility</h1>
          <p className="text-muted-foreground">
            Identifying potential violations and generating legal documents
          </p>
        </div>

        {/* Terminal-style log output */}
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-green-500" />
            <span className="ml-3 text-xs text-neutral-500 font-mono">reducto --analyze --generate-documents</span>
          </div>

          <div className="p-4 h-80 overflow-y-auto font-mono text-sm scrollbar-thin">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 py-1 ${log.type === 'finding' ? getRiskColor(log.risk) : 'text-neutral-400'}`}
              >
                <span className="text-neutral-600">{'>'}</span>
                {log.type === 'finding' && <AlertTriangle className="w-3 h-3" />}
                <span>{log.message}</span>
              </motion.div>
            ))}
            {!isComplete && (
              <div className="flex items-center gap-2 py-1 text-neutral-500">
                <span className="text-neutral-600">{'>'}</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Results Summary */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-border">
                <div className="text-3xl font-medium font-mono text-foreground">{totalFindings}</div>
                <div className="text-sm text-muted-foreground mt-1">Issues Found</div>
              </div>
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <div className="text-3xl font-medium font-mono text-red-600">{highRiskCount}</div>
                <div className="text-sm text-muted-foreground mt-1">High Priority</div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-3xl font-medium font-mono text-emerald-600">{mockDrafts.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Documents Ready</div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {mockRedactoResults.map((result, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-border">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-foreground" />
                    {result.category}
                  </h3>
                  <div className="space-y-3">
                    {result.findings.map((finding, j) => (
                      <div key={j} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            finding.risk === 'high' ? 'bg-red-500' :
                            finding.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="text-foreground">{finding.item}</span>
                        </div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {finding.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                View Documents
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default RedactoProcessing;
