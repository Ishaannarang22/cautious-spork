import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, Shield, AlertTriangle, FileText, Wifi, WifiOff } from 'lucide-react';
import { useApp, RedactoResult, DraftItem } from '@/context/AppContext';
import { mockRedactoResults, mockDrafts, redactoSteps } from '@/data/mockData';
import api from '@/services/api';

const RedactoProcessing: React.FC = () => {
  const { userInfo, discoveredUserData, discoveredCompanyData, setAppState, setRedactoResults, setDrafts } = useApp();
  const [logs, setLogs] = useState<{ message: string; type?: string; risk?: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [apiResults, setApiResults] = useState<RedactoResult[] | null>(null);
  const [apiDrafts, setApiDrafts] = useState<DraftItem[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Fetch data from API on mount
  useEffect(() => {
    if (hasFetchedRef.current || !discoveredUserData) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setLogs(prev => [...prev, { message: 'Connecting to analysis API...', type: undefined }]);
        const response = await api.analyze(
          discoveredUserData,
          discoveredCompanyData || undefined,
          userInfo?.name
        );
        setApiResults(response.redactoResults);
        setApiDrafts(response.drafts);
        setLogs(prev => [...prev, { message: 'Analysis engine connected...', type: undefined }]);
      } catch (error) {
        console.error('API error:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to connect to API');
        setLogs(prev => [...prev, { message: 'API unavailable - using cached analysis...', type: undefined }]);
        setApiResults(mockRedactoResults);
        setApiDrafts(mockDrafts);
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchData();
  }, [discoveredUserData, discoveredCompanyData, userInfo?.name]);

  // Generate streaming steps based on API data
  const generateStepsFromResults = useCallback((results: RedactoResult[], drafts: DraftItem[]): typeof redactoSteps => {
    const steps: typeof redactoSteps = [
      { message: 'Connecting to Redacto API...', delay: 500 },
      { message: 'Uploading discovered data...', delay: 600 },
    ];

    // Add findings from each category
    results.forEach((result) => {
      steps.push({ message: `Analyzing ${result.category.toLowerCase()}...`, delay: 700 });

      result.findings.forEach((finding, i) => {
        const riskLabel = finding.risk.toUpperCase();
        steps.push({
          message: `${finding.item.split(' - ')[0]} - ${riskLabel} RISK`,
          delay: 300 + i * 50,
          type: 'finding' as const,
          risk: finding.risk as 'high' | 'medium' | 'low',
        });
      });
    });

    // Add document generation steps
    steps.push({ message: 'Generating removal requests...', delay: 600 });
    steps.push({ message: 'Drafting legal notices...', delay: 500 });
    steps.push({ message: 'Preparing claim forms...', delay: 500 });
    steps.push({ message: `Analysis complete - ${drafts.length} drafts ready`, delay: 400 });

    return steps;
  }, []);

  // Stream the logs based on fetched data
  useEffect(() => {
    if (isApiLoading || !apiResults || !apiDrafts) return;

    const steps = generateStepsFromResults(apiResults, apiDrafts);

    if (currentStep >= steps.length) {
      setIsComplete(true);
      setRedactoResults(apiResults);
      setDrafts(apiDrafts);
      return;
    }

    const step = steps[currentStep];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, { message: step.message, type: step.type, risk: step.risk }]);
      setCurrentStep(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentStep, isApiLoading, apiResults, apiDrafts, setRedactoResults, setDrafts, generateStepsFromResults]);

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

  const displayResults = apiResults || mockRedactoResults;
  const displayDrafts = apiDrafts || mockDrafts;

  const totalFindings = displayResults.reduce((acc, r) => acc + r.findings.length, 0);
  const highRiskCount = displayResults.reduce((acc, r) => acc + r.findings.filter(f => f.risk === 'high').length, 0);

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
            <div className="flex items-center gap-4">
              {apiError ? (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <WifiOff className="w-3 h-3" />
                  Offline mode
                </span>
              ) : !isApiLoading && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Wifi className="w-3 h-3" />
                  Live analysis
                </span>
              )}
              <span className="step-indicator">Step 3 of 4</span>
            </div>
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
                <div className="text-3xl font-medium font-mono text-emerald-600">{displayDrafts.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Documents Ready</div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {displayResults.map((result, i) => (
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
