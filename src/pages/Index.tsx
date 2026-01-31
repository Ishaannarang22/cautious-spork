import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/landing/HeroSection";
import { ScanningOverlay } from "@/components/scanning/ScanningOverlay";
import { VerificationCards } from "@/components/verification/VerificationCards";
import { Dashboard } from "@/components/dashboard/Dashboard";

type AppState = "landing" | "scanning" | "verification" | "dashboard";

interface UserProfile {
  email: string;
  linkedin: string;
  drives: boolean;
  owns: boolean;
  hasChildren: boolean;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: "",
    linkedin: "",
    drives: false,
    owns: false,
    hasChildren: false,
  });

  const handleAnalyze = (email: string, linkedin: string) => {
    setUserProfile((prev) => ({ ...prev, email, linkedin }));
    setAppState("scanning");
  };

  const handleScanComplete = () => {
    setAppState("verification");
  };

  const handleVerificationComplete = (answers: { drives: boolean; owns: boolean; hasChildren: boolean }) => {
    setUserProfile((prev) => ({ ...prev, ...answers }));
    setAppState("dashboard");
  };

  const handleUpdateProfile = (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <HeroSection key="landing" onAnalyze={handleAnalyze} />
        )}

        {appState === "scanning" && (
          <ScanningOverlay key="scanning" onComplete={handleScanComplete} />
        )}

        {appState === "verification" && (
          <VerificationCards key="verification" onComplete={handleVerificationComplete} />
        )}

        {appState === "dashboard" && (
          <Dashboard
            key="dashboard"
            userProfile={{
              drives: userProfile.drives,
              owns: userProfile.owns,
              hasChildren: userProfile.hasChildren,
            }}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
