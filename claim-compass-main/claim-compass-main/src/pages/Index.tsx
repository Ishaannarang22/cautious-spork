import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/LandingPage';
import ScanningOverlay from '@/components/ScanningOverlay';
import VerificationCards from '@/components/VerificationCards';
import Dashboard from '@/components/dashboard/Dashboard';

const Index: React.FC = () => {
  const { appState } = useApp();

  return (
    <AnimatePresence mode="wait">
      {appState === 'landing' && <LandingPage key="landing" />}
      {appState === 'scanning' && <ScanningOverlay key="scanning" />}
      {appState === 'verification' && <VerificationCards key="verification" />}
      {appState === 'dashboard' && <Dashboard key="dashboard" />}
    </AnimatePresence>
  );
};

export default Index;
