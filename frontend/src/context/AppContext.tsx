import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppState = 'landing' | 'userDiscovery' | 'companyDiscovery' | 'redacto' | 'drafts';

export interface UserInfo {
  name: string;
  email: string;
  company?: string;
}

export interface DiscoveredUserData {
  socialProfiles: { platform: string; url: string; username: string }[];
  dataBreaches: { name: string; date: string; dataTypes: string[] }[];
  publicRecords: { type: string; details: string }[];
  onlinePresence: { site: string; info: string }[];
}

export interface DiscoveredCompanyData {
  companyInfo: { field: string; value: string }[];
  employees: { name: string; role: string }[];
  newsArticles: { title: string; source: string; date: string }[];
  legalFilings: { type: string; date: string; status: string }[];
}

export interface RedactoResult {
  category: string;
  findings: { item: string; risk: 'high' | 'medium' | 'low'; action: string }[];
}

export interface DraftItem {
  id: string;
  type: string;
  title: string;
  content: string;
  status: 'pending' | 'sent' | 'deleted';
}

interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
  discoveredUserData: DiscoveredUserData | null;
  setDiscoveredUserData: (data: DiscoveredUserData | null) => void;
  discoveredCompanyData: DiscoveredCompanyData | null;
  setDiscoveredCompanyData: (data: DiscoveredCompanyData | null) => void;
  redactoResults: RedactoResult[];
  setRedactoResults: (results: RedactoResult[]) => void;
  drafts: DraftItem[];
  setDrafts: (drafts: DraftItem[]) => void;
  deleteDraft: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [discoveredUserData, setDiscoveredUserData] = useState<DiscoveredUserData | null>(null);
  const [discoveredCompanyData, setDiscoveredCompanyData] = useState<DiscoveredCompanyData | null>(null);
  const [redactoResults, setRedactoResults] = useState<RedactoResult[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'deleted' as const } : d));
  };

  return (
    <AppContext.Provider value={{
      appState,
      setAppState,
      userInfo,
      setUserInfo,
      discoveredUserData,
      setDiscoveredUserData,
      discoveredCompanyData,
      setDiscoveredCompanyData,
      redactoResults,
      setRedactoResults,
      drafts,
      setDrafts,
      deleteDraft,
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
