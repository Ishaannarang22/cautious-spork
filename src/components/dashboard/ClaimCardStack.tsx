import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, AlertCircle, Clock, Calendar,
  DollarSign, ChevronDown, ChevronUp, Check, X, Shield, 
  Wallet, Lock, PhoneOff, FileText, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { Claim } from '@/data/sampleClaims';

const typeConfig = {
  breach: { icon: Shield, label: 'Data Breach', class: 'claim-type-breach' },
  money: { icon: Wallet, label: 'Unclaimed Property', class: 'claim-type-money' },
  privacy: { icon: Lock, label: 'Privacy Violation', class: 'claim-type-privacy' },
  spam: { icon: PhoneOff, label: 'TCPA Violation', class: 'claim-type-spam' },
};

const urgencyConfig = {
  urgent: { label: 'Urgent', class: 'badge-urgent' },
  soon: { label: 'Soon', class: 'badge-warning' },
  upcoming: { label: 'Upcoming', class: 'badge-success' },
};

interface ClaimCardProps {
  claim: Claim;
  isTop: boolean;
  onAccept: () => void;
  onSkip: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, isTop, onAccept, onSkip }) => {
  const [expanded, setExpanded] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const TypeIcon = typeConfig[claim.type].icon;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onAccept();
    } else if (info.offset.x < -100) {
      onSkip();
    }
    setDragDirection(null);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x > 50) {
      setDragDirection('right');
    } else if (info.offset.x < -50) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      className={`absolute inset-0 ${isTop ? 'cursor-grab z-30' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <div 
        className={`h-full card-elevated p-6 transition-all duration-300 ${
          dragDirection === 'right' ? 'border-accent/50 shadow-glow-accent' : 
          dragDirection === 'left' ? 'border-destructive/50' : ''
        }`}
      >
        {/* Type badge and urgency */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${typeConfig[claim.type].class}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            {typeConfig[claim.type].label}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urgencyConfig[claim.urgency].class}`}>
            <AlertCircle className="w-3 h-3" />
            {urgencyConfig[claim.urgency].label}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-3">{claim.title}</h3>

        {/* Value and deadline */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-accent">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">{claim.estimatedValue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Expires in {claim.daysRemaining} days</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {expanded ? claim.fullDescription : claim.description}
        </p>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:underline mb-4"
        >
          {expanded ? (
            <>Less details <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>More details <ChevronDown className="w-4 h-4" /></>
          )}
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-4 overflow-hidden"
            >
              {/* Eligibility */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Eligibility Requirements</h4>
                <ul className="space-y-1.5">
                  {claim.eligibilityRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {claim.requiredDocuments.map((doc, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Statute */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Legal Reference:</span> {claim.statuteReference}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {isTop && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary border border-border text-muted-foreground font-medium hover:bg-secondary/70 transition-colors"
            >
              <X className="w-5 h-5" />
              Skip
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
            >
              <Check className="w-5 h-5" />
              Accept Claim
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ClaimCardStack: React.FC = () => {
  const { pendingClaims, acceptClaim, skipClaim } = useApp();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('urgency');
  const [search, setSearch] = useState('');

  const filteredClaims = pendingClaims
    .filter(claim => {
      if (filter !== 'all' && claim.type !== filter) return false;
      if (search && !claim.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'urgency') {
        const urgencyOrder = { urgent: 0, soon: 1, upcoming: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      if (sort === 'value') {
        const getMinValue = (str: string) => parseInt(str.match(/\$([\d,]+)/)?.[1].replace(',', '') || '0');
        return getMinValue(b.estimatedValue) - getMinValue(a.estimatedValue);
      }
      if (sort === 'deadline') {
        return a.daysRemaining - b.daysRemaining;
      }
      return 0;
    });

  const handleAccept = (claimId: string) => {
    acceptClaim(claimId);
  };

  const handleSkip = (claimId: string) => {
    skipClaim(claimId);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3 mb-6"
      >
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-secondary/50 border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter claims" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Claims</SelectItem>
            <SelectItem value="breach">Data Breach</SelectItem>
            <SelectItem value="money">Unclaimed Property</SelectItem>
            <SelectItem value="privacy">CCPA/Privacy</SelectItem>
            <SelectItem value="spam">TCPA/Spam</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-36 bg-secondary/50 border-border">
            <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="urgency">Urgency</SelectItem>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </div>
      </motion.div>

      {/* Card stack or empty state */}
      {filteredClaims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">All Claims Reviewed!</h3>
          <p className="text-muted-foreground max-w-sm">
            You've reviewed all available claims. Check the "My Claims" section to track your accepted claims.
          </p>
        </motion.div>
      ) : (
        <div className="flex-1 relative">
          {/* Card stack */}
          <div className="relative w-full max-w-2xl mx-auto h-[500px]">
            <AnimatePresence>
              {filteredClaims.slice(0, 3).map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{
                    opacity: index === 0 ? 1 : 0.7 - index * 0.2,
                    scale: 1 - index * 0.05,
                    y: index * 12,
                    zIndex: 3 - index,
                  }}
                  exit={{ opacity: 0, x: 300, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                  style={{ pointerEvents: index === 0 ? 'auto' : 'none' }}
                >
                  <ClaimCard
                    claim={claim}
                    isTop={index === 0}
                    onAccept={() => handleAccept(claim.id)}
                    onSkip={() => handleSkip(claim.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Remaining claims indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border"
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} remaining
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClaimCardStack;
