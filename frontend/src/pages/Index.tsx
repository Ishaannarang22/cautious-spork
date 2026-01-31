import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/LandingPage';
import UserDiscovery from '@/components/UserDiscovery';
import CompanyDiscovery from '@/components/CompanyDiscovery';
import RedactoProcessing from '@/components/RedactoProcessing';
import DraftsView from '@/components/DraftsView';

const Index: React.FC = () => {
  const { appState } = useApp();

  return (
    <AnimatePresence mode="wait">
      {appState === 'landing' && <LandingPage key="landing" />}
      {appState === 'userDiscovery' && <UserDiscovery key="userDiscovery" />}
      {appState === 'companyDiscovery' && <CompanyDiscovery key="companyDiscovery" />}
      {appState === 'redacto' && <RedactoProcessing key="redacto" />}
      {appState === 'drafts' && <DraftsView key="drafts" />}
    </AnimatePresence>
  );
};

export default Index;
