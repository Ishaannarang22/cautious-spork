import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Database, Globe, Shield, FileText, User } from 'lucide-react';

interface ExpandableNodeWidgetProps {
  id: string;
  title: string;
  nodeType: 'source' | 'data' | 'document' | 'claim';
  count?: number;
  risk?: 'high' | 'medium' | 'low';
  details?: string[];
  isDiscovered: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

const ExpandableNodeWidget: React.FC<ExpandableNodeWidgetProps> = ({
  title,
  nodeType,
  count,
  risk,
  details = [],
  isDiscovered,
  isExpanded = false,
  onClick,
}) => {

  const getIcon = () => {
    switch (nodeType) {
      case 'source':
        return <Database className="w-4 h-4" />;
      case 'data':
        return <Shield className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'claim':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    if (risk === 'high') return 'border-red-400 bg-red-50';
    if (risk === 'medium') return 'border-yellow-400 bg-yellow-50';
    if (risk === 'low') return 'border-emerald-400 bg-emerald-50';

    switch (nodeType) {
      case 'source':
        return 'border-sky-400 bg-sky-50';
      case 'data':
        return 'border-purple-400 bg-purple-50';
      case 'document':
        return 'border-emerald-400 bg-emerald-50';
      case 'claim':
        return 'border-red-400 bg-red-50';
      default:
        return 'border-neutral-400 bg-neutral-50';
    }
  };

  const getTextColor = () => {
    if (risk === 'high') return 'text-red-600';
    if (risk === 'medium') return 'text-yellow-600';
    if (risk === 'low') return 'text-emerald-600';

    switch (nodeType) {
      case 'source':
        return 'text-sky-600';
      case 'data':
        return 'text-purple-600';
      case 'document':
        return 'text-emerald-600';
      case 'claim':
        return 'text-red-600';
      default:
        return 'text-neutral-600';
    }
  };

  if (!isDiscovered) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="relative"
    >
      <motion.div
        className={`rounded-xl border-2 ${getColor()} cursor-pointer transition-all hover:shadow-md min-w-[180px]`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`${getTextColor()}`}>{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${getTextColor()} truncate`}>
                  {title}
                </div>
                {count !== undefined && (
                  <div className="text-xs text-neutral-500">
                    {count} {count === 1 ? 'item' : 'items'}
                  </div>
                )}
              </div>
            </div>
            {details.length > 0 && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className={`w-4 h-4 ${getTextColor()}`} />
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && details.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
                  {details.map((detail, i) => (
                    <div key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current/40 mt-1 flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExpandableNodeWidget;
