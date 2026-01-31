import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Search, FileText, Scale } from 'lucide-react';
import ProfileSidebar from './ProfileSidebar';
import ClaimCardStack from './ClaimCardStack';
import MyClaimsSidebar from './MyClaimsSidebar';
import { useApp } from '@/context/AppContext';

const Dashboard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex"
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        <ProfileSidebar />
        <ClaimCardStack />
        <MyClaimsSidebar />
      </div>

      {/* Mobile Layout */}
      <MobileLayout />
    </motion.div>
  );
};

const MobileLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'discover' | 'claims'>('discover');

  return (
    <div className="lg:hidden w-full flex flex-col min-h-screen">
      <MobileHeader />
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'profile' && <MobileProfile />}
        {activeTab === 'discover' && <ClaimCardStack />}
        {activeTab === 'claims' && <MobileClaims />}
      </div>
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const MobileHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Claims Discovery</span>
        </div>
      </div>
    </header>
  );
};

const MobileProfile: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-yellow-500 text-primary-foreground text-2xl font-bold mb-4">
          {initials}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Eligibility Score</h3>
        <div className="flex items-center justify-center">
          <div className="text-4xl font-bold text-primary">{user.eligibilityScore}%</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Jurisdictions</h3>
        {user.activeJurisdictions.map((jurisdiction) => (
          <div
            key={jurisdiction}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30"
          >
            <span className="text-sm text-foreground">{jurisdiction}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileClaims: React.FC = () => {
  const { acceptedClaims } = useApp();

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-foreground mb-4">My Claims ({acceptedClaims.length})</h2>
      {acceptedClaims.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No claims accepted yet</p>
          <p className="text-sm">Swipe right on claims to accept them</p>
        </div>
      ) : (
        acceptedClaims.map(claim => (
          <div key={claim.id} className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-medium text-foreground">{claim.title}</h4>
            <p className="text-sm text-accent mt-1">{claim.estimatedValue}</p>
          </div>
        ))
      )}
    </div>
  );
};

interface MobileNavigationProps {
  activeTab: 'profile' | 'discover' | 'claims';
  setActiveTab: (tab: 'profile' | 'discover' | 'claims') => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile' as const, icon: User, label: 'Profile' },
    { id: 'discover' as const, icon: Search, label: 'Discover' },
    { id: 'claims' as const, icon: FileText, label: 'My Claims' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Dashboard;
