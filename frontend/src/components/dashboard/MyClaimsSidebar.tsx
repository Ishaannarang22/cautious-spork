import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, AlertTriangle, ChevronRight, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Claim } from '@/data/sampleClaims';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClaimItem: React.FC<{ claim: Claim }> = ({ claim }) => {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending Review' },
    in_progress: { icon: Loader2, color: 'text-info', bg: 'bg-info/10', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10', label: 'Completed' },
  };

  const status = claim.status || 'pending';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <StatusIcon className={`w-4 h-4 ${config.color} ${status === 'in_progress' ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">{claim.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{config.label}</p>
          
          {status === 'in_progress' && claim.progress !== undefined && (
            <div className="mt-2">
              <Progress value={claim.progress} className="h-1.5 bg-secondary" />
              <p className="text-xs text-muted-foreground mt-1">{claim.progress}% complete</p>
            </div>
          )}
          
          <div className="flex items-center gap-1 mt-2 text-accent">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs font-medium">{claim.estimatedValue}</span>
          </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.div>
  );
};

const MyClaimsSidebar: React.FC = () => {
  const { acceptedClaims } = useApp();

  const pendingClaims = acceptedClaims.filter(c => c.status === 'pending');
  const inProgressClaims = acceptedClaims.filter(c => c.status === 'in_progress');
  const completedClaims = acceptedClaims.filter(c => c.status === 'completed');

  const totalValue = acceptedClaims.reduce((sum, claim) => {
    const match = claim.estimatedValue.match(/\$([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(',', '')) : 0);
  }, 0);

  const needsApproval = pendingClaims.filter(c => Math.random() > 0.5).length;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 bg-sidebar border-l border-sidebar-border p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">My Claims</h2>
        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
          {acceptedClaims.length}
        </span>
      </div>

      {/* Needs approval alert */}
      {needsApproval > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30 mb-4"
        >
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Needs Approval</p>
            <p className="text-xs text-muted-foreground">{needsApproval} claim{needsApproval > 1 ? 's' : ''} awaiting review</p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 mb-4">
          <TabsTrigger value="pending" className="data-[state=active]:bg-card text-xs">
            Pending ({pendingClaims.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-card text-xs">
            Active ({inProgressClaims.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-card text-xs">
            Done ({completedClaims.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="pending" className="m-0 space-y-3">
            {pendingClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending claims</p>
              </div>
            ) : (
              pendingClaims.map(claim => (
                <ClaimItem key={claim.id} claim={claim} />
              ))
            )}
          </TabsContent>

          <TabsContent value="progress" className="m-0 space-y-3">
            {inProgressClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No claims in progress</p>
              </div>
            ) : (
              inProgressClaims.map(claim => (
                <ClaimItem key={claim.id} claim={claim} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="m-0 space-y-3">
            {completedClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No completed claims yet</p>
              </div>
            ) : (
              completedClaims.map(claim => (
                <ClaimItem key={claim.id} claim={claim} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Total recovery */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30">
        <p className="text-sm text-muted-foreground">Total Potential Recovery</p>
        <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}+</p>
      </div>
    </motion.aside>
  );
};

export default MyClaimsSidebar;
