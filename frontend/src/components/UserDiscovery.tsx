import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, User, AlertTriangle, Globe, Database, Wifi, WifiOff } from 'lucide-react';
import { useApp, DiscoveredUserData } from '@/context/AppContext';
import { mockUserData, userDiscoverySteps } from '@/data/mockData';
import DiscoveryGraph from './DiscoveryGraph';
import api from '@/services/api';

const UserDiscovery: React.FC = () => {
  const { userInfo, setAppState, setDiscoveredUserData } = useApp();
  const [logs, setLogs] = useState<{ message: string; type?: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<Set<string>>(new Set());
  const [apiData, setApiData] = useState<DiscoveredUserData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Fetch data from API on mount
  useEffect(() => {
    if (hasFetchedRef.current || !userInfo?.name) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setLogs(prev => [...prev, { message: 'Connecting to LitiGate API...', type: undefined }]);
        const data = await api.discoverUser(userInfo.name, userInfo.email);
        setApiData(data);
        setLogs(prev => [...prev, { message: 'API connected - starting discovery...', type: undefined }]);
      } catch (error) {
        console.error('API error:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to connect to API');
        setLogs(prev => [...prev, { message: 'API unavailable - using cached data...', type: undefined }]);
        setApiData(mockUserData);
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  // Generate streaming steps based on API data
  const generateStepsFromData = useCallback((data: DiscoveredUserData): typeof userDiscoverySteps => {
    const steps: typeof userDiscoverySteps = [
      { message: 'Initializing Firecrawl...', delay: 500 },
      { message: 'Searching social media platforms...', delay: 800 },
    ];

    // Add social profiles
    data.socialProfiles.forEach((profile, i) => {
      steps.push({
        message: `Found ${profile.platform} profile`,
        delay: 400 + i * 100,
        type: 'social' as const,
        category: 'socialProfiles' as const,
        itemId: profile.platform.toLowerCase(),
      });
    });

    steps.push({ message: 'Scanning data breach databases...', delay: 600 });

    // Add data breaches
    data.dataBreaches.forEach((breach, i) => {
      steps.push({
        message: `Alert: Found in ${breach.name}`,
        delay: 400 + i * 100,
        type: 'breach' as const,
        category: 'dataBreaches' as const,
        itemId: `breach-${breach.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });

    steps.push({ message: 'Checking public records...', delay: 600 });

    // Add public records
    data.publicRecords.forEach((record, i) => {
      steps.push({
        message: `Found ${record.type.toLowerCase()}`,
        delay: 300 + i * 100,
        type: 'record' as const,
        category: 'publicRecords' as const,
        itemId: `record-${record.type.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });

    steps.push({ message: 'Analyzing online presence...', delay: 600 });

    // Add online presence
    data.onlinePresence.forEach((presence, i) => {
      steps.push({
        message: `Found ${presence.site}`,
        delay: 300 + i * 100,
        type: 'presence' as const,
        category: 'onlinePresence' as const,
        itemId: `presence-${presence.site.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });

    steps.push({ message: 'Discovery complete', delay: 400 });

    return steps;
  }, []);

  // Stream the logs based on fetched data
  useEffect(() => {
    if (isApiLoading || !apiData) return;

    const steps = generateStepsFromData(apiData);

    if (currentStep >= steps.length) {
      setIsComplete(true);
      setDiscoveredUserData(apiData);
      return;
    }

    const step = steps[currentStep];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, { message: step.message, type: step.type }]);

      if (step.itemId) {
        setDiscoveredItems(prev => new Set([...prev, step.itemId!]));
      }

      setCurrentStep(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [currentStep, isApiLoading, apiData, setDiscoveredUserData, generateStepsFromData]);

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

  const displayData = apiData || mockUserData;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-4">
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
                  Live data
                </span>
              )}
              <span className="step-indicator">Step 1 of 4</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-[95vw] mx-auto px-6 py-6 w-full">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-medium mb-2">Researching your data</h1>
          <p className="text-muted-foreground">
            Scanning for information about <span className="text-foreground font-medium">{userInfo?.name}</span>
          </p>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Terminal-style log output - 20% width */}
          <div className="w-[20%] flex-shrink-0 flex flex-col">
            <div className="terminal flex-1 flex flex-col">
          <div className="terminal-header flex-shrink-0">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-green-500" />
            <span className="ml-3 text-xs text-neutral-500 font-mono">firecrawl --user-discovery</span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-mono text-sm scrollbar-thin">
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
          </div>

          {/* Discovery Graph - 80% width */}
          <div className="flex-1 min-w-0">
            <DiscoveryGraph
              discoveredItems={discoveredItems}
              userName={userInfo?.name || 'User'}
            />
          </div>
        </div>

        {/* Results Summary */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {[
                  { label: 'Profiles', value: displayData.socialProfiles.length, color: 'text-sky-600' },
                  { label: 'Breaches', value: displayData.dataBreaches.length, color: 'text-red-600' },
                  { label: 'Records', value: displayData.publicRecords.length, color: 'text-emerald-600' },
                  { label: 'Presence', value: displayData.onlinePresence.length, color: 'text-purple-600' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-xl font-medium font-mono ${stat.color}`}>{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {userInfo?.company ? 'Continue to Company Scan' : 'Continue to Analysis'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default UserDiscovery;
