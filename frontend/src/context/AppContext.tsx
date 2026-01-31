import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserProfile, VerificationAnswers } from '@/types/user';
import { Claim, sampleClaims } from '@/data/sampleClaims';

type AppState = 'landing' | 'scanning' | 'verification' | 'dashboard';

interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  claims: Claim[];
  acceptedClaims: Claim[];
  skippedClaims: Claim[];
  pendingClaims: Claim[];
  acceptClaim: (claimId: string) => void;
  skipClaim: (claimId: string) => void;
  verificationAnswers: VerificationAnswers;
  updateVerificationAnswer: (key: keyof VerificationAnswers, value: boolean) => void;
}

const defaultVerificationAnswers: VerificationAnswers = {
  dataBreachNotifications: null,
  californiaResident: null,
  spamCalls: null,
  retailerAccounts: null,
  vehicleOwner: null,
  californiaEmployer: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [acceptedClaimIds, setAcceptedClaimIds] = useState<string[]>([]);
  const [skippedClaimIds, setSkippedClaimIds] = useState<string[]>([]);
  const [verificationAnswers, setVerificationAnswers] = useState<VerificationAnswers>(defaultVerificationAnswers);

  const claims = sampleClaims;
  
  const acceptedClaims = claims.filter(c => acceptedClaimIds.includes(c.id)).map(c => ({
    ...c,
    status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as Claim['status'],
    progress: Math.floor(Math.random() * 100)
  }));
  
  const skippedClaims = claims.filter(c => skippedClaimIds.includes(c.id));
  const pendingClaims = claims.filter(c => !acceptedClaimIds.includes(c.id) && !skippedClaimIds.includes(c.id));

  const acceptClaim = (claimId: string) => {
    setAcceptedClaimIds(prev => [...prev, claimId]);
  };

  const skipClaim = (claimId: string) => {
    setSkippedClaimIds(prev => [...prev, claimId]);
  };

  const updateVerificationAnswer = (key: keyof VerificationAnswers, value: boolean) => {
    setVerificationAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppContext.Provider value={{
      appState,
      setAppState,
      user,
      setUser,
      claims,
      acceptedClaims,
      skippedClaims,
      pendingClaims,
      acceptClaim,
      skipClaim,
      verificationAnswers,
      updateVerificationAnswer,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
