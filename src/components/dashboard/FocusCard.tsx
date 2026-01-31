import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImpactOpportunity {
  id: string;
  type: "vote" | "meeting" | "action";
  urgency: "urgent" | "soon" | "upcoming";
  title: string;
  description: string;
  impact: string;
  location?: string;
  date?: string;
  costImpact?: string;
}

interface FocusCardProps {
  opportunity: ImpactOpportunity | null;
  onDismiss: () => void;
  onAccept: () => void;
}

export const FocusCard = ({ opportunity, onDismiss, onAccept }: FocusCardProps) => {
  if (!opportunity) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground max-w-md">
          You've reviewed all current opportunities. Check back soon for new ways to make an impact in your community.
        </p>
      </motion.div>
    );
  }

  const urgencyConfig = {
    urgent: {
      badge: "URGENT: Vote in 48h",
      badgeClass: "bg-urgent/10 text-urgent border-urgent/30",
      icon: AlertTriangle,
    },
    soon: {
      badge: "This Week",
      badgeClass: "bg-warning/10 text-warning border-warning/30",
      icon: Clock,
    },
    upcoming: {
      badge: "Coming Up",
      badgeClass: "bg-info/10 text-info border-info/30",
      icon: Calendar,
    },
  };

  const config = urgencyConfig[opportunity.urgency];
  const UrgencyIcon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={opportunity.id}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="card-elevated rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.badgeClass}`}>
                <UrgencyIcon className="w-4 h-4" />
                {config.badge}
              </div>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {opportunity.title}
            </h2>
            <p className="text-muted-foreground">
              {opportunity.description}
            </p>
          </div>

          {/* Impact Section */}
          <div className="p-6 bg-primary/5 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Why This Matters to You
            </h4>
            <p className="text-foreground font-medium">
              {opportunity.impact}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-3">
            {opportunity.location && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{opportunity.location}</span>
              </div>
            )}
            {opportunity.date && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{opportunity.date}</span>
              </div>
            )}
            {opportunity.costImpact && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <DollarSign className="w-5 h-5 text-warning" />
                <span className="text-warning font-medium">{opportunity.costImpact}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
            <Button
              variant="success"
              size="lg"
              className="flex-1 group"
              onClick={onAccept}
            >
              I'll Do This
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
