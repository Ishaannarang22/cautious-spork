import { motion } from "framer-motion";
import { 
  MapPin, 
  Edit3, 
  Building2, 
  Train, 
  GraduationCap,
  TrendingUp,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSidebarProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
  };
  onEditProfile: () => void;
}

export const ProfileSidebar = ({ userProfile, onEditProfile }: ProfileSidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 min-h-screen bg-sidebar border-r border-sidebar-border p-6 flex flex-col"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-bold tracking-tight text-sidebar-foreground">
          FULCRUM<span className="text-sidebar-primary">.ai</span>
        </h2>
      </div>

      {/* User Profile Card */}
      <div className="card-elevated p-5 rounded-xl mb-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">Alex Mercer</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Mission District, SF (94110)</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {userProfile.drives && (
            <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20">
              Driver
            </span>
          )}
          {userProfile.owns ? (
            <span className="px-2 py-1 text-xs rounded-md bg-accent/10 text-accent border border-accent/20">
              Homeowner
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-md bg-warning/10 text-warning border border-warning/20">
              Renter
            </span>
          )}
          {userProfile.hasChildren && (
            <span className="px-2 py-1 text-xs rounded-md bg-info/10 text-info border border-info/20">
              SFUSD Parent
            </span>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onEditProfile}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Psychographic Profile */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Civic Profile Analysis
        </h4>
        <div className="card-elevated p-4 rounded-xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are a <span className="text-foreground font-medium">tech-native {userProfile.owns ? "homeowner" : "renter"}</span> concerned 
            with zoning efficiency and transit density. Your digital footprint suggests 
            <span className="text-primary"> high interest in YIMBY policies</span> but 
            <span className="text-warning"> low engagement with school board budgets</span>.
            {userProfile.drives && " Parking and transportation costs directly impact your daily life."}
          </p>
        </div>
      </div>

      {/* Interest indicators */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Detected Interests
        </h4>
        <div className="space-y-2">
          <InterestBar icon={Building2} label="Housing Policy" value={85} color="primary" />
          <InterestBar icon={Train} label="Transit" value={72} color="accent" />
          {userProfile.hasChildren && (
            <InterestBar icon={GraduationCap} label="Education" value={90} color="info" />
          )}
          <InterestBar icon={TrendingUp} label="Local Economy" value={45} color="warning" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Data refreshed 2 hours ago
        </p>
      </div>
    </motion.aside>
  );
};

interface InterestBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "primary" | "accent" | "info" | "warning";
}

const InterestBar = ({ icon: Icon, label, value, color }: InterestBarProps) => {
  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    info: "bg-info",
    warning: "bg-warning",
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{value}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-full rounded-full ${colorClasses[color]}`}
          />
        </div>
      </div>
    </div>
  );
};
