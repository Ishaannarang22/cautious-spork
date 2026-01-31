import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Linkedin, 
  Facebook, 
  Instagram, 
  Music,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface ScanningOverlayProps {
  onComplete: () => void;
}

const platforms = [
  { icon: Linkedin, name: "LinkedIn", color: "#0077B5" },
  { icon: Facebook, name: "Facebook", color: "#1877F2" },
  { icon: Instagram, name: "Instagram", color: "#E4405F" },
  { icon: Music, name: "Spotify", color: "#1DB954" },
];

const statusMessages = [
  "Connecting to Nyne.ai Identity Layer...",
  "Scanning public sentiment...",
  "Analyzing digital footprint...",
  "Triangulating civic vectors...",
  "Building your civic profile...",
];

export const ScanningOverlay = ({ onComplete }: ScanningOverlayProps) => {
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState<number[]>([]);

  useEffect(() => {
    // Cycle through platforms
    const platformInterval = setInterval(() => {
      setCurrentPlatformIndex((prev) => {
        const next = prev + 1;
        if (next < platforms.length) {
          setCompletedPlatforms((completed) => [...completed, prev]);
          return next;
        }
        return prev;
      });
    }, 800);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = prev + 1;
        return next < statusMessages.length ? next : prev;
      });
    }, 700);

    // Complete after all platforms are scanned
    const completeTimeout = setTimeout(() => {
      setCompletedPlatforms((prev) => [...prev, platforms.length - 1]);
      setTimeout(onComplete, 500);
    }, 3500);

    return () => {
      clearInterval(platformInterval);
      clearInterval(messageInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_60%_/_0.15)_0%,_transparent_60%)]" />
      
      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            FULCRUM<span className="text-primary">.ai</span>
          </h2>
          <p className="text-sm text-muted-foreground">Identity Analysis Engine</p>
        </motion.div>

        {/* Platform icons */}
        <div className="flex items-center gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isActive = currentPlatformIndex === index;
            const isCompleted = completedPlatforms.includes(index);

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.3,
                  scale: isActive ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center gap-2"
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 56, height: 56, left: -4, top: -4 }}
                  />
                )}
                
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent/20 border border-accent/50"
                      : isActive
                      ? "bg-primary/20 border border-primary/50"
                      : "bg-secondary/50 border border-border/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <span className={`text-xs ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {platform.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Status message */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground text-sm font-mono"
            >
              {statusMessages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};
