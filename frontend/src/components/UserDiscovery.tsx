import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, User, AlertTriangle, Globe, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockUserData, userDiscoverySteps } from '@/data/mockData';

const UserDiscovery: React.FC = () => {
  const { userInfo, setAppState, setDiscoveredUserData } = useApp();
  const [logs, setLogs] = useState<{ message: string; type?: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep >= userDiscoverySteps.length) {
      setIsComplete(true);
      setDiscoveredUserData(mockUserData);
      return;
    }

    const step = userDiscoverySteps[currentStep];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, { message: step.message, type: step.type }]);
      setCurrentStep(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentStep, setDiscoveredUserData]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleContinue = () => {
    if (userInfo?.company) {
      setAppState('companyDiscovery');
    } else {
      setAppState('redacto');
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'social': return <User className="w-3 h-3" />;
      case 'breach': return <AlertTriangle className="w-3 h-3" />;
      case 'record': return <Database className="w-3 h-3" />;
      case 'presence': return <Globe className="w-3 h-3" />;
      default: return null;
    }
  };

  const getColor = (type?: string) => {
    switch (type) {
      case 'social': return 'text-sky-400';
      case 'breach': return 'text-red-400';
      case 'record': return 'text-emerald-400';
      case 'presence': return 'text-purple-400';
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
            <span className="step-indicator">Step 1 of 4</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Researching your data</h1>
          <p className="text-muted-foreground">
            Scanning for information about <span className="text-foreground font-medium">{userInfo?.name}</span>
          </p>
        </div>

        {/* Terminal-style log output */}
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-green-500" />
            <span className="ml-3 text-xs text-neutral-500 font-mono">firecrawl --user-discovery</span>
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
                { label: 'Social Profiles', value: mockUserData.socialProfiles.length, color: 'text-sky-600' },
                { label: 'Data Breaches', value: mockUserData.dataBreaches.length, color: 'text-red-600' },
                { label: 'Public Records', value: mockUserData.publicRecords.length, color: 'text-emerald-600' },
                { label: 'Online Presence', value: mockUserData.onlinePresence.length, color: 'text-purple-600' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-border">
                  <div className={`text-3xl font-medium font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Data Breaches Alert */}
            {mockUserData.dataBreaches.length > 0 && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-600 font-medium mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  Found in {mockUserData.dataBreaches.length} data breaches
                </div>
                <div className="space-y-2">
                  {mockUserData.dataBreaches.map((breach, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{breach.name}</span>
                      <span className="text-muted-foreground">{breach.dataTypes.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {userInfo?.company ? 'Continue to Company Scan' : 'Continue to Analysis'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default UserDiscovery;
