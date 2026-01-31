import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Building, Scale, Shield, Phone, DollarSign, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { scanningStatuses } from '@/data/sampleClaims';

const platformIcons = [
  { icon: Database, label: 'Databases', delay: 0.5 },
  { icon: Building, label: 'Government', delay: 1.5 },
  { icon: Scale, label: 'Legal', delay: 3.5 },
  { icon: Shield, label: 'Privacy', delay: 5.5 },
  { icon: Phone, label: 'TCPA', delay: 7.5 },
  { icon: DollarSign, label: 'Claims', delay: 9.5 },
];

const ScanningOverlay: React.FC = () => {
  const { setAppState } = useApp();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [completedIcons, setCompletedIcons] = useState<number[]>([]);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.7;
      });
    }, 100);

    // Status message rotation
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % scanningStatuses.length);
    }, 1800);

    // Complete icons sequentially
    platformIcons.forEach((_, index) => {
      setTimeout(() => {
        setCompletedIcons(prev => [...prev, index]);
      }, (index + 1) * 2000);
    });

    // Navigate to verification after scanning
    const timeout = setTimeout(() => {
      setAppState('verification');
    }, 15000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(timeout);
    };
  }, [setAppState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-4"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Animated logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-yellow-500 mb-8 shadow-glow"
        >
          <Scale className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        {/* Status message */}
        <div className="h-8 mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-medium text-foreground"
            >
              {scanningStatuses[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-secondary" />
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
        </div>

        {/* Platform icons grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {platformIcons.map((platform, index) => {
            const Icon = platform.icon;
            const isCompleted = completedIcons.includes(index);
            
            return (
              <motion.div
                key={platform.label}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isCompleted ? 1 : 0.3,
                  scale: isCompleted ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors duration-300 ${
                  isCompleted ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30 border border-border'
                }`}
              >
                <Icon className={`w-6 h-6 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                  {platform.label}
                </span>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-accent"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* AI badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Powered by AI</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScanningOverlay;
