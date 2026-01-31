import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, CheckCircle, Edit, Building } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const ProfileSidebar: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 bg-sidebar border-r border-sidebar-border p-6 flex flex-col"
    >
      {/* Profile header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-yellow-500 text-primary-foreground text-2xl font-bold mb-4">
          {initials}
        </div>
        <h2 className="text-xl font-semibold text-sidebar-foreground">{user.name}</h2>
        <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-sm">
          <Building className="w-3 h-3" />
          Consumer
        </span>
      </div>

      {/* Micro CV */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-sidebar-foreground">California, USA</span>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-sidebar-foreground truncate">{user.email}</span>
          <CheckCircle className="w-4 h-4 text-accent ml-auto" />
        </div>
        
        {user.phone && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-sidebar-foreground">{user.phone}</span>
            <CheckCircle className="w-4 h-4 text-accent ml-auto" />
          </div>
        )}
      </div>

      {/* Edit profile button */}
      <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors mb-6">
        <Edit className="w-4 h-4" />
        Edit Profile
      </button>

      {/* Eligibility Score */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Claim Eligibility Score</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 251.2' }}
                animate={{ strokeDasharray: `${user.eligibilityScore * 2.512} 251.2` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-primary"
              >
                {user.eligibilityScore}%
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Jurisdictions */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Jurisdictions</h3>
        <div className="space-y-2">
          {user.activeJurisdictions.map((jurisdiction) => (
            <div
              key={jurisdiction}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">{jurisdiction}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        © 2025 Legal Claims Discovery
      </p>
    </motion.aside>
  );
};

export default ProfileSidebar;
