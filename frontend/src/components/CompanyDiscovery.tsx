import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, Building, Users, Newspaper, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockCompanyData, companyDiscoverySteps } from '@/data/mockData';

const CompanyDiscovery: React.FC = () => {
  const { userInfo, setAppState, setDiscoveredCompanyData } = useApp();
  const [logs, setLogs] = useState<{ message: string; type?: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep >= companyDiscoverySteps.length) {
      setIsComplete(true);
      setDiscoveredCompanyData(mockCompanyData);
      return;
    }

    const step = companyDiscoverySteps[currentStep];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, { message: step.message, type: step.type }]);
      setCurrentStep(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentStep, setDiscoveredCompanyData]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleContinue = () => {
    setAppState('redacto');
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'info': return <Building className="w-3 h-3" />;
      case 'employee': return <Users className="w-3 h-3" />;
      case 'news': return <Newspaper className="w-3 h-3" />;
      case 'legal': return <FileText className="w-3 h-3" />;
      default: return null;
    }
  };

  const getColor = (type?: string) => {
    switch (type) {
      case 'info': return 'text-sky-400';
      case 'employee': return 'text-purple-400';
      case 'news': return 'text-amber-400';
      case 'legal': return 'text-emerald-400';
      default: return 'text-neutral-400';
    }
  };

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
            <span className="step-indicator">Step 2 of 4</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Analyzing company data</h1>
          <p className="text-muted-foreground">
            Gathering information about <span className="text-foreground font-medium">{userInfo?.company || 'your company'}</span>
          </p>
        </div>

        {/* Terminal-style log output */}
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-green-500" />
            <span className="ml-3 text-xs text-neutral-500 font-mono">firecrawl --company-discovery</span>
          </div>

          <div className="p-4 h-80 overflow-y-auto font-mono text-sm scrollbar-thin">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 py-1 ${getColor(log.type)}`}
              >
                <span className="text-neutral-600">{'>'}</span>
                {getIcon(log.type)}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Company Info', value: mockCompanyData.companyInfo.length, color: 'text-sky-600' },
                { label: 'Key People', value: mockCompanyData.employees.length, color: 'text-purple-600' },
                { label: 'News Articles', value: mockCompanyData.newsArticles.length, color: 'text-amber-600' },
                { label: 'Legal Filings', value: mockCompanyData.legalFilings.length, color: 'text-emerald-600' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-border">
                  <div className={`text-3xl font-medium font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Company Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-border">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-sky-600" />
                  Company Information
                </h3>
                <div className="space-y-3">
                  {mockCompanyData.companyInfo.slice(0, 5).map((info, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{info.field}</span>
                      <span className="text-foreground font-medium">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-border">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Key Executives
                </h3>
                <div className="space-y-3">
                  {mockCompanyData.employees.map((emp, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{emp.name}</span>
                      <span className="text-muted-foreground">{emp.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                Continue to Analysis
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CompanyDiscovery;
